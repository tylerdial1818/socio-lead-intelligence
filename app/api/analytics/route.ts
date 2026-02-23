import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [
      opportunities,
      teamMembers,
    ] = await Promise.all([
      prisma.opportunity.findMany({
        select: {
          id: true,
          tier: true,
          source: true,
          status: true,
          icpScore: true,
          estimatedValue: true,
          assignedToId: true,
          createdAt: true,
        },
      }),
      prisma.teamMember.findMany({
        select: { id: true, name: true },
      }),
    ]);

    // By tier
    const byTier: Record<string, number> = { HOT: 0, WARM: 0, COOL: 0, COLD: 0 };
    for (const opp of opportunities) {
      if (opp.tier && opp.tier in byTier) byTier[opp.tier]++;
    }

    // By source
    const bySource: Record<string, number> = {};
    for (const opp of opportunities) {
      bySource[opp.source] = (bySource[opp.source] || 0) + 1;
    }

    // By status
    const byStatus: Record<string, number> = {};
    for (const opp of opportunities) {
      byStatus[opp.status] = (byStatus[opp.status] || 0) + 1;
    }

    // Pipeline value (active = not PASSED/LOST)
    const pipelineValue = opportunities
      .filter((o) => o.status !== "PASSED" && o.status !== "LOST")
      .reduce((sum, o) => sum + (o.estimatedValue || 0), 0);

    // Team assignments
    const assignmentMap: Record<string, number> = {};
    for (const opp of opportunities) {
      if (opp.assignedToId) {
        assignmentMap[opp.assignedToId] = (assignmentMap[opp.assignedToId] || 0) + 1;
      }
    }
    const teamAssignments = teamMembers.map((tm) => ({
      name: tm.name,
      count: assignmentMap[tm.id] || 0,
    }));

    // Weekly trend (last 12 weeks)
    const now = new Date();
    const twelveWeeksAgo = new Date(now.getTime() - 12 * 7 * 24 * 60 * 60 * 1000);
    const weeklyBuckets: Record<string, number> = {};
    for (let i = 0; i < 12; i++) {
      const weekStart = new Date(twelveWeeksAgo.getTime() + i * 7 * 24 * 60 * 60 * 1000);
      const label = weekStart.toISOString().slice(0, 10);
      weeklyBuckets[label] = 0;
    }
    for (const opp of opportunities) {
      const created = new Date(opp.createdAt);
      if (created >= twelveWeeksAgo) {
        // Find which week bucket
        const diffMs = created.getTime() - twelveWeeksAgo.getTime();
        const weekIndex = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));
        if (weekIndex >= 0 && weekIndex < 12) {
          const weekStart = new Date(twelveWeeksAgo.getTime() + weekIndex * 7 * 24 * 60 * 60 * 1000);
          const label = weekStart.toISOString().slice(0, 10);
          weeklyBuckets[label] = (weeklyBuckets[label] || 0) + 1;
        }
      }
    }
    const weeklyTrend = Object.entries(weeklyBuckets).map(([week, count]) => ({
      week,
      count,
    }));

    // Score distribution
    const scoreBuckets = [
      { range: "0-20", min: 0, max: 20, count: 0 },
      { range: "21-40", min: 21, max: 40, count: 0 },
      { range: "41-60", min: 41, max: 60, count: 0 },
      { range: "61-80", min: 61, max: 80, count: 0 },
      { range: "81-100", min: 81, max: 100, count: 0 },
    ];
    for (const opp of opportunities) {
      if (opp.icpScore !== null) {
        const bucket = scoreBuckets.find(
          (b) => opp.icpScore! >= b.min && opp.icpScore! <= b.max
        );
        if (bucket) bucket.count++;
      }
    }
    const scoreDistribution = scoreBuckets.map(({ range, count }) => ({ range, count }));

    // Summary stats
    const totalCount = opportunities.length;
    const scoredOpps = opportunities.filter((o) => o.icpScore !== null);
    const avgScore = scoredOpps.length > 0
      ? Math.round(scoredOpps.reduce((sum, o) => sum + o.icpScore!, 0) / scoredOpps.length)
      : 0;
    const activeSources = new Set(opportunities.map((o) => o.source)).size;

    return NextResponse.json({
      totalCount,
      avgScore,
      pipelineValue,
      activeSources,
      byTier,
      bySource,
      byStatus,
      teamAssignments,
      weeklyTrend,
      scoreDistribution,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
