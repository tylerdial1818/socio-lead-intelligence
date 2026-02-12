import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Prisma } from "@/lib/generated/prisma/client";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const keyword = await prisma.keyword.findUnique({
      where: { id: params.id },
    });

    if (!keyword) {
      return NextResponse.json({ error: "Keyword not found" }, { status: 404 });
    }

    const opportunityKeywords = await prisma.opportunityKeyword.findMany({
      where: { keywordId: params.id },
      include: {
        opportunity: {
          include: { assignedTo: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const opportunities = opportunityKeywords.map((ok) => ok.opportunity);

    return NextResponse.json({ keyword, opportunities });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { term, type, tier, category, isActive } = body;

    const data: Prisma.KeywordUpdateInput = {};
    if (term !== undefined) data.term = typeof term === "string" ? term.trim() : term;
    if (type !== undefined) data.type = type;
    if (tier !== undefined) data.tier = tier;
    if (category !== undefined) data.category = category;
    if (isActive !== undefined) data.isActive = isActive;

    if (type !== undefined && !["INCLUDE", "EXCLUDE"].includes(type)) {
      return NextResponse.json(
        { error: "Type must be INCLUDE or EXCLUDE" },
        { status: 400 }
      );
    }

    if (tier !== undefined && !["HIGH", "MEDIUM", "LOW"].includes(tier)) {
      return NextResponse.json(
        { error: "Tier must be HIGH, MEDIUM, or LOW" },
        { status: 400 }
      );
    }

    const keyword = await prisma.keyword.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json(keyword);
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err && err.code === "P2002") {
      return NextResponse.json(
        { error: "A keyword with this term already exists" },
        { status: 409 }
      );
    }
    if (err && typeof err === "object" && "code" in err && err.code === "P2025") {
      return NextResponse.json({ error: "Keyword not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.keyword.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err && err.code === "P2025") {
      return NextResponse.json({ error: "Keyword not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
