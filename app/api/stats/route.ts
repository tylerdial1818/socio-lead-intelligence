import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const [activeCount, hotCount, warmCount, dueSoonCount, pipelineAgg, lastSync] = await Promise.all([
      prisma.opportunity.count({
        where: { status: { in: ["NEW", "REVIEWING", "PURSUING"] } },
      }),
      prisma.opportunity.count({
        where: { tier: "HOT", status: { in: ["NEW", "REVIEWING", "PURSUING"] } },
      }),
      prisma.opportunity.count({
        where: { tier: "WARM", status: { in: ["NEW", "REVIEWING", "PURSUING"] } },
      }),
      prisma.opportunity.count({
        where: {
          deadline: { lte: sevenDaysFromNow, gte: now },
          status: { in: ["NEW", "REVIEWING", "PURSUING"] },
        },
      }),
      prisma.opportunity.aggregate({
        where: { status: { in: ["NEW", "REVIEWING", "PURSUING"] } },
        _sum: { estimatedValue: true },
      }),
      prisma.scraperRun.findFirst({ orderBy: { startedAt: "desc" } }),
    ]);

    return NextResponse.json({
      activeCount,
      hotCount,
      warmCount,
      pipelineValue: pipelineAgg._sum.estimatedValue || 0,
      dueSoonCount,
      lastSyncAt: lastSync?.completedAt?.toISOString() || null,
      lastSyncStatus: lastSync?.status || null,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
