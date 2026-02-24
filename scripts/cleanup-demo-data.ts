/**
 * One-time script to remove demo seed opportunities from the production database.
 * These are the 10 fictional opportunities created by prisma/seed.ts that have
 * hardcoded estimatedValue fields, inflating the pipeline value metrics.
 *
 * Usage: npx tsx scripts/cleanup-demo-data.ts
 */

import "dotenv/config";
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const DEMO_SOURCE_IDS = [
  "UT-2026-001",
  "UT-2026-002",
  "SAM-2026-001",
  "SAM-2026-002",
  "WB-2026-001",
  "CO-2026-001",
  "NV-2026-001",
  "UNDP-2026-001",
  "BN-2026-001",
  "UNGM-2026-001",
];

async function main() {
  console.log("Cleaning up demo seed opportunities...\n");

  // Show what will be deleted
  const demoOpps = await prisma.opportunity.findMany({
    where: { sourceId: { in: DEMO_SOURCE_IDS } },
    select: { sourceId: true, title: true, estimatedValue: true, source: true },
  });

  if (demoOpps.length === 0) {
    console.log("No demo opportunities found. Database is already clean.");
    return;
  }

  console.log(`Found ${demoOpps.length} demo opportunities to remove:`);
  for (const opp of demoOpps) {
    const value = opp.estimatedValue ? `$${opp.estimatedValue.toLocaleString()}` : "no value";
    console.log(`  - [${opp.source}] ${opp.sourceId}: ${opp.title} (${value})`);
  }

  // Delete (OpportunityKeyword records cascade automatically)
  const result = await prisma.opportunity.deleteMany({
    where: { sourceId: { in: DEMO_SOURCE_IDS } },
  });

  console.log(`\nDeleted ${result.count} demo opportunities.`);

  // Show remaining counts
  const remaining = await prisma.opportunity.count();
  const pipelineAgg = await prisma.opportunity.aggregate({
    where: { status: { in: ["NEW", "REVIEWING", "PURSUING"] } },
    _sum: { estimatedValue: true },
  });
  console.log(`Remaining opportunities: ${remaining}`);
  console.log(`Pipeline value: $${(pipelineAgg._sum.estimatedValue || 0).toLocaleString()}`);
}

main()
  .catch((err) => {
    console.error("Cleanup failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
