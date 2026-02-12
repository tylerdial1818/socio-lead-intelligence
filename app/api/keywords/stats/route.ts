import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const [
      totalInclude,
      totalExclude,
      activeInclude,
      activeExclude,
      topMatching,
      recentlyAdded,
      neverMatched,
    ] = await Promise.all([
      prisma.keyword.count({ where: { type: "INCLUDE" } }),
      prisma.keyword.count({ where: { type: "EXCLUDE" } }),
      prisma.keyword.count({ where: { type: "INCLUDE", isActive: true } }),
      prisma.keyword.count({ where: { type: "EXCLUDE", isActive: true } }),
      prisma.keyword.findMany({
        where: { matchCount: { gt: 0 } },
        orderBy: { matchCount: "desc" },
        take: 10,
      }),
      prisma.keyword.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.keyword.findMany({
        where: { matchCount: 0 },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);

    return NextResponse.json({
      totalInclude,
      totalExclude,
      activeInclude,
      activeExclude,
      topMatching,
      recentlyAdded,
      neverMatched,
    });
  } catch (error) {
    console.error("Error fetching keyword stats:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
