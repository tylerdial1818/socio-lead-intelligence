/**
 * One-time script to add missing keywords to the production database.
 * Uses upsert so it's safe to run multiple times.
 *
 * Usage: npx tsx scripts/add-missing-keywords.ts
 */

import "dotenv/config";
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const newKeywords = [
  { term: "impact measurement", tier: "HIGH" as const, type: "INCLUDE" as const, category: "Methods" },
  { term: "outcome measurement", tier: "HIGH" as const, type: "INCLUDE" as const, category: "Methods" },
  { term: "survey services", tier: "MEDIUM" as const, type: "INCLUDE" as const, category: "Services" },
  { term: "community engagement", tier: "MEDIUM" as const, type: "INCLUDE" as const, category: "Services" },
  { term: "performance management", tier: "MEDIUM" as const, type: "INCLUDE" as const, category: "Services" },
  { term: "strategic planning", tier: "MEDIUM" as const, type: "INCLUDE" as const, category: "Services" },
  { term: "capacity building", tier: "MEDIUM" as const, type: "INCLUDE" as const, category: "Services" },
  { term: "data collection", tier: "MEDIUM" as const, type: "INCLUDE" as const, category: "Methods" },
  { term: "ethnographic research", tier: "MEDIUM" as const, type: "INCLUDE" as const, category: "Methods" },
  { term: "natural language processing", tier: "MEDIUM" as const, type: "INCLUDE" as const, category: "Methods" },
  { term: "machine learning", tier: "MEDIUM" as const, type: "INCLUDE" as const, category: "Methods" },
  { term: "econometrics", tier: "MEDIUM" as const, type: "INCLUDE" as const, category: "Methods" },
  { term: "mathematical modeling", tier: "MEDIUM" as const, type: "INCLUDE" as const, category: "Methods" },
  { term: "research consultant", tier: "MEDIUM" as const, type: "INCLUDE" as const, category: "Services" },
];

async function main() {
  console.log("Adding missing keywords to database...\n");

  let created = 0;
  let skipped = 0;

  for (const kw of newKeywords) {
    const result = await prisma.keyword.upsert({
      where: { term: kw.term },
      update: {},
      create: {
        term: kw.term,
        type: kw.type,
        tier: kw.tier,
        category: kw.category,
        isActive: true,
      },
    });

    // Check if it was newly created (createdAt ~= now)
    const isNew = Date.now() - result.createdAt.getTime() < 5000;
    if (isNew) {
      console.log(`  + Created: "${kw.term}" (${kw.tier}, ${kw.category})`);
      created++;
    } else {
      console.log(`  = Exists:  "${kw.term}"`);
      skipped++;
    }
  }

  console.log(`\nDone: ${created} created, ${skipped} already existed.`);

  const total = await prisma.keyword.count();
  const includeCount = await prisma.keyword.count({ where: { type: "INCLUDE" } });
  const excludeCount = await prisma.keyword.count({ where: { type: "EXCLUDE" } });
  console.log(`Total keywords: ${total} (${includeCount} include, ${excludeCount} exclude)`);
}

main()
  .catch((err) => {
    console.error("Failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
