import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { enrichOpportunity } from "@/lib/scraper/enrich";
import { loadActiveKeywords, matchKeywords } from "@/lib/scraper/keyword-matcher";

export const maxDuration = 60;

/** Max opportunities to enrich per invocation (keeps within 60s timeout). */
const BATCH_SIZE = 30;

function verifyCronAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return false;
  return authHeader === `Bearer ${cronSecret}`;
}

/**
 * Find opportunities that haven't been enriched yet.
 *
 * Detection: Bonfire synthetic descriptions follow the pattern
 * "{title} — Issued by {dept}. Reference: {ref}" or are null.
 * After enrichment, the description will be the AI-generated text
 * and category will be set (Bonfire raw data has category = null).
 *
 * We use `category IS NULL` as the enrichment marker since:
 * - All Bonfire opportunities have category = null from the scraper
 * - After enrichment, category is set to the AI-suggested value
 * - This is simple and reliable
 */
async function findUnenriched(limit: number) {
  return prisma.opportunity.findMany({
    where: {
      category: null,
      source: { in: ["UTAH_BONFIRE", "STATE_BONFIRE"] },
    },
    select: {
      id: true,
      title: true,
      issuingOrg: true,
      locationState: true,
      description: true,
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function GET(request: NextRequest) {
  if (!verifyCronAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY not configured" },
      { status: 500 }
    );
  }

  try {
    const unenriched = await findUnenriched(BATCH_SIZE);

    if (unenriched.length === 0) {
      return NextResponse.json({
        enriched: 0,
        remaining: 0,
        message: "All opportunities already enriched",
      });
    }

    const keywords = await loadActiveKeywords();
    let enrichedCount = 0;
    const errors: string[] = [];

    for (const opp of unenriched) {
      try {
        // Extract department from the synthetic description if available
        const deptMatch = opp.description?.match(/Issued by (.+?)\. Reference:/);
        const department = deptMatch?.[1] || opp.issuingOrg;

        const result = await enrichOpportunity({
          title: opp.title,
          issuingOrg: opp.issuingOrg,
          state: opp.locationState,
          department,
        });

        // Re-run keyword matching against the enriched description
        const keywordResult = matchKeywords(
          opp.title,
          result.enrichedDescription,
          keywords
        );

        // Update the opportunity
        await prisma.opportunity.update({
          where: { id: opp.id },
          data: {
            description: result.enrichedDescription,
            category: result.suggestedCategory,
            keywordsMatched: keywordResult.includeTerms,
          },
        });

        // Recreate keyword junction records with new matches
        await prisma.opportunityKeyword.deleteMany({
          where: { opportunityId: opp.id },
        });

        if (keywordResult.matched.length > 0) {
          await prisma.opportunityKeyword.createMany({
            data: keywordResult.matched.map((m) => ({
              opportunityId: opp.id,
              keywordId: m.keywordId,
              matchLocation: m.matchLocation,
              matchedText: m.term,
            })),
          });

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

        enrichedCount++;
      } catch (err) {
        const msg = `Failed to enrich ${opp.id}: ${err instanceof Error ? err.message : String(err)}`;
        errors.push(msg);
        console.error(msg);
      }
    }

    // Count remaining unenriched
    const remaining = await prisma.opportunity.count({
      where: {
        category: null,
        source: { in: ["UTAH_BONFIRE", "STATE_BONFIRE"] },
      },
    });

    return NextResponse.json({
      enriched: enrichedCount,
      errors: errors.length > 0 ? errors : undefined,
      remaining,
      message:
        remaining > 0
          ? `Enriched ${enrichedCount}/${unenriched.length}. ${remaining} remaining — will process on next run.`
          : `Enriched ${enrichedCount}/${unenriched.length}. All opportunities now enriched.`,
    });
  } catch (error) {
    console.error("Enrichment error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
