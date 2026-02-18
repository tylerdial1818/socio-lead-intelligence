import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const runs = await prisma.scraperRun.findMany({
      orderBy: { startedAt: "desc" },
      take: 20,
    });

    // Latest run per source
    const sources = ["SAM_GOV", "WORLD_BANK"] as const;
    const latest = await Promise.all(
      sources.map((s) =>
        prisma.scraperRun.findFirst({
          where: { source: s },
          orderBy: { startedAt: "desc" },
        })
      )
    );

    return NextResponse.json({
      runs,
      latestBySource: Object.fromEntries(
        sources.map((s, i) => [s, latest[i] || null])
      ),
    });
  } catch (error) {
    console.error("Error fetching scraper status:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
