import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Prisma } from "@/lib/generated/prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const tier = searchParams.get("tier");
    const category = searchParams.get("category");
    const isActive = searchParams.get("isActive");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = (searchParams.get("sortOrder") || "desc") as Prisma.SortOrder;

    const where: Prisma.KeywordWhereInput = {};

    if (type && type !== "all") where.type = type as Prisma.KeywordWhereInput["type"];
    if (tier && tier !== "all") where.tier = tier as Prisma.KeywordWhereInput["tier"];
    if (category && category !== "all") where.category = category;
    if (isActive === "true") where.isActive = true;
    if (isActive === "false") where.isActive = false;
    if (search) {
      where.term = { contains: search, mode: "insensitive" };
    }

    const orderByMap: Record<string, Prisma.KeywordOrderByWithRelationInput> = {
      term: { term: sortOrder as Prisma.SortOrder },
      matchCount: { matchCount: sortOrder as Prisma.SortOrder },
      createdAt: { createdAt: sortOrder as Prisma.SortOrder },
    };

    const [data, total, includeCounts, excludeCounts] = await Promise.all([
      prisma.keyword.findMany({
        where,
        orderBy: orderByMap[sortBy] || { createdAt: "desc" },
      }),
      prisma.keyword.count({ where }),
      prisma.keyword.groupBy({
        by: ["isActive"],
        where: { type: "INCLUDE" },
        _count: true,
      }),
      prisma.keyword.groupBy({
        by: ["isActive"],
        where: { type: "EXCLUDE" },
        _count: true,
      }),
    ]);

    const includeActive = includeCounts.find((g) => g.isActive === true)?._count ?? 0;
    const includePaused = includeCounts.find((g) => g.isActive === false)?._count ?? 0;
    const excludeActive = excludeCounts.find((g) => g.isActive === true)?._count ?? 0;
    const excludePaused = excludeCounts.find((g) => g.isActive === false)?._count ?? 0;

    return NextResponse.json({
      data,
      total,
      includeCounts: { active: includeActive, paused: includePaused },
      excludeCounts: { active: excludeActive, paused: excludePaused },
    });
  } catch (error) {
    console.error("Error fetching keywords:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { term, type, tier, category } = body;

    if (!term || !type) {
      return NextResponse.json(
        { error: "Term and type are required" },
        { status: 400 }
      );
    }

    if (!["INCLUDE", "EXCLUDE"].includes(type)) {
      return NextResponse.json(
        { error: "Type must be INCLUDE or EXCLUDE" },
        { status: 400 }
      );
    }

    if (tier && !["HIGH", "MEDIUM", "LOW"].includes(tier)) {
      return NextResponse.json(
        { error: "Tier must be HIGH, MEDIUM, or LOW" },
        { status: 400 }
      );
    }

    const createData: Prisma.KeywordCreateInput = {
      term: term.trim(),
      type,
    };
    if (tier) createData.tier = tier;
    if (category) createData.category = category;

    const keyword = await prisma.keyword.create({ data: createData });

    return NextResponse.json(keyword, { status: 201 });
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err && err.code === "P2002") {
      return NextResponse.json(
        { error: "A keyword with this term already exists" },
        { status: 409 }
      );
    }
    console.error("Error creating keyword:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
