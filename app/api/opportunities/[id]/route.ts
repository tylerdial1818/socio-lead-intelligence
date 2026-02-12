import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const opportunity = await prisma.opportunity.findUnique({
      where: { id: params.id },
      include: {
        assignedTo: true,
        matchedKeywords: { include: { keyword: true } },
      },
    });
    if (!opportunity) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(opportunity);
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
    const { status, assignedToId, notes, decision } = body;

    const data: Record<string, unknown> = {};
    if (status !== undefined) data.status = status;
    if (assignedToId !== undefined) data.assignedToId = assignedToId;
    if (notes !== undefined) data.notes = notes;
    if (decision !== undefined) data.decision = decision;

    const opportunity = await prisma.opportunity.update({
      where: { id: params.id },
      data,
      include: {
        assignedTo: true,
        matchedKeywords: { include: { keyword: true } },
      },
    });

    return NextResponse.json(opportunity);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
