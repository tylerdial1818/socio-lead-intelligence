import { prisma } from "@/lib/db";
import type { Prisma, Source } from "@/lib/generated/prisma/client";
import { calculateIcpScore, type ScoringWeights } from "@/lib/scoring";
import { loadActiveKeywords, matchKeywords } from "./keyword-matcher";
import type { RawOpportunity, ScraperRunResult } from "./types";

async function loadScoringWeights(): Promise<ScoringWeights> {
  const config = await prisma.scoringConfig.findUnique({
    where: { id: "default" },
  });
  if (!config) {
    return { budget: 25, sector: 25, geography: 25, timing: 25, utahMultiplier: 1.5 };
  }
  return {
    budget: config.budgetWeight,
    sector: config.sectorWeight,
    geography: config.geographyWeight,
    timing: config.timingWeight,
    utahMultiplier: config.utahMultiplier,
  };
}

/**
 * Main pipeline: takes raw opportunities from any scraper,
 * scores them, matches keywords, upserts to DB, logs the run.
 */
export async function runPipeline(
  source: Source,
  opportunities: RawOpportunity[],
  fetchErrors: string[]
): Promise<ScraperRunResult> {
  const startedAt = new Date();
  let opportunitiesNew = 0;
  const errors = [...fetchErrors];

  const scraperRun = await prisma.scraperRun.create({
    data: {
      source,
      startedAt,
      status: "RUNNING",
      opportunitiesFound: opportunities.length,
    },
  });

  try {
    const [weights, keywords] = await Promise.all([
      loadScoringWeights(),
      loadActiveKeywords(),
    ]);

    for (const raw of opportunities) {
      try {
        // 1. Score
        const scoreResult = calculateIcpScore(
          {
            estimatedValue: raw.estimatedValue,
            title: raw.title,
            description: raw.description,
            state: raw.locationState,
            country: raw.locationCountry,
            dueDate: raw.deadline,
          },
          weights
        );

        // 2. Match keywords
        const keywordResult = matchKeywords(raw.title, raw.description, keywords);

        // 3. Upsert — create if new, update data fields but preserve user-curated fields
        const data = {
          source: raw.source,
          sourceId: raw.sourceId,
          sourceUrl: raw.sourceUrl,
          title: raw.title,
          description: raw.description,
          issuingOrg: raw.issuingOrg,
          category: raw.category,
          postedDate: raw.postedDate,
          deadline: raw.deadline,
          estimatedValue: raw.estimatedValue,
          estimatedValueLow: raw.estimatedValueLow,
          estimatedValueHigh: raw.estimatedValueHigh,
          locationState: raw.locationState,
          locationCity: raw.locationCity,
          locationCountry: raw.locationCountry,
          isUtah: scoreResult.isUtah,
          contactName: raw.contactName,
          contactEmail: raw.contactEmail,
          contactPhone: raw.contactPhone,
          icpScore: Math.round(scoreResult.score),
          scoreBreakdown: scoreResult.breakdown as unknown as Prisma.InputJsonValue,
          tier: scoreResult.tier,
          keywordsMatched: keywordResult.includeTerms,
          rawData: raw.rawData as Prisma.InputJsonValue,
        };

        // On update, omit user-curated fields: status, assignedTo, notes, decision, aiBrief
        const { ...updateData } = data;

        const upserted = await prisma.opportunity.upsert({
          where: {
            source_sourceId: { source: raw.source, sourceId: raw.sourceId },
          },
          create: data,
          update: updateData,
        });

        // Detect new record: createdAt ≈ updatedAt
        const isNew =
          Math.abs(upserted.createdAt.getTime() - upserted.updatedAt.getTime()) < 1000;
        if (isNew) opportunitiesNew++;

        // 4. Recreate keyword junction records
        await prisma.opportunityKeyword.deleteMany({
          where: { opportunityId: upserted.id },
        });

        if (keywordResult.matched.length > 0) {
          await prisma.opportunityKeyword.createMany({
            data: keywordResult.matched.map((m) => ({
              opportunityId: upserted.id,
              keywordId: m.keywordId,
              matchLocation: m.matchLocation,
              matchedText: m.term,
            })),
          });

          // Update keyword match stats
          await Promise.all(
            keywordResult.matched.map((m) =>
              prisma.keyword.update({
                where: { id: m.keywordId },
                data: {
                  matchCount: { increment: 1 },
                  lastMatchAt: new Date(),
                },
              })
            )
          );
        }
      } catch (err) {
        const msg = `Failed to process ${raw.sourceId}: ${err instanceof Error ? err.message : String(err)}`;
        errors.push(msg);
        console.error(msg);
      }
    }

    const completedAt = new Date();
    const status = errors.length > fetchErrors.length ? "PARTIAL" : "SUCCESS";

    await prisma.scraperRun.update({
      where: { id: scraperRun.id },
      data: {
        completedAt,
        status,
        opportunitiesFound: opportunities.length,
        opportunitiesNew,
        errorMessage: errors.length > 0 ? errors.join("\n").slice(0, 5000) : null,
      },
    });

    return {
      source,
      status,
      opportunitiesFound: opportunities.length,
      opportunitiesNew,
      errors,
      durationMs: completedAt.getTime() - startedAt.getTime(),
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    await prisma.scraperRun.update({
      where: { id: scraperRun.id },
      data: {
        completedAt: new Date(),
        status: "FAILED",
        errorMessage: errorMsg,
      },
    });

    return {
      source,
      status: "FAILED",
      opportunitiesFound: opportunities.length,
      opportunitiesNew: 0,
      errors: [errorMsg],
      durationMs: Date.now() - startedAt.getTime(),
    };
  }
}
