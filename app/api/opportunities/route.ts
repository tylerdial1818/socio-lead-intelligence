import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Prisma } from "@/lib/generated/prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tier = searchParams.get("tier");
    const status = searchParams.get("status");
    const source = searchParams.get("source");
    const search = searchParams.get("search");
    const isUtah = searchParams.get("isUtah");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");
    const sortBy = searchParams.get("sortBy") || "score";
    const sortOrder = (searchParams.get("sortOrder") || "desc") as Prisma.SortOrder;

    const where: Prisma.OpportunityWhereInput = {};

    if (tier && tier !== "all") where.tier = tier as Prisma.OpportunityWhereInput["tier"];
    if (status && status !== "all") where.status = status as Prisma.OpportunityWhereInput["status"];
    if (source && source !== "all") where.source = source as Prisma.OpportunityWhereInput["source"];
    if (isUtah === "true") where.isUtah = true;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { issuingOrg: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const orderByMap: Record<string, Prisma.OpportunityOrderByWithRelationInput> = {
      score: { icpScore: sortOrder as Prisma.SortOrder },
      deadline: { deadline: sortOrder as Prisma.SortOrder },
      value: { estimatedValue: sortOrder as Prisma.SortOrder },
    };

    const [data, total] = await Promise.all([
      prisma.opportunity.findMany({
        where,
        orderBy: orderByMap[sortBy] || { icpScore: "desc" },
        take: limit,
        skip: offset,
        include: {
          assignedTo: true,
          matchedKeywords: { include: { keyword: true } },
        },
      }),
      prisma.opportunity.count({ where }),
    ]);

    return NextResponse.json({ data, total });
  } catch (error) {
    console.error("Error fetching opportunities:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
