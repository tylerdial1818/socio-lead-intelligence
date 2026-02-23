import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Prisma } from "@/lib/generated/prisma/client";
import { generateBrief } from "@/lib/ai";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const opportunity = await prisma.opportunity.findUnique({
      where: { id: params.id },
    });
    if (!opportunity) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const brief = await generateBrief({
      title: opportunity.title,
      description: opportunity.description,
      issuingOrg: opportunity.issuingOrg,
      category: opportunity.category,
      estimatedValue: opportunity.estimatedValue,
      locationState: opportunity.locationState,
      locationCountry: opportunity.locationCountry,
      deadline: opportunity.deadline?.toISOString() ?? null,
      icpScore: opportunity.icpScore,
      tier: opportunity.tier,
    });

    const updated = await prisma.opportunity.update({
      where: { id: params.id },
      data: {
        aiBrief: brief as unknown as Prisma.InputJsonValue,
        aiGeneratedAt: new Date(),
      },
      include: {
        assignedTo: true,
        matchedKeywords: { include: { keyword: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Brief generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate brief" },
      { status: 500 }
    );
  }
}
