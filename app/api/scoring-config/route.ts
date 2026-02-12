import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const DEFAULT_CONFIG = {
  id: "default",
  budgetWeight: 25,
  sectorWeight: 25,
  geographyWeight: 25,
  timingWeight: 25,
  utahMultiplier: 1.5,
};

export async function GET() {
  try {
    const config = await prisma.scoringConfig.upsert({
      where: { id: "default" },
      update: {},
      create: DEFAULT_CONFIG,
    });

    return NextResponse.json(config);
  } catch (error) {
    console.error("Error fetching scoring config:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { budgetWeight, sectorWeight, geographyWeight, timingWeight, utahMultiplier } = body;

    const data: Record<string, number> = {};

    if (budgetWeight !== undefined) {
      if (typeof budgetWeight !== "number" || budgetWeight < 0 || budgetWeight > 50) {
        return NextResponse.json({ error: "Budget weight must be between 0 and 50" }, { status: 400 });
      }
      data.budgetWeight = budgetWeight;
    }
    if (sectorWeight !== undefined) {
      if (typeof sectorWeight !== "number" || sectorWeight < 0 || sectorWeight > 50) {
        return NextResponse.json({ error: "Sector weight must be between 0 and 50" }, { status: 400 });
      }
      data.sectorWeight = sectorWeight;
    }
    if (geographyWeight !== undefined) {
      if (typeof geographyWeight !== "number" || geographyWeight < 0 || geographyWeight > 50) {
        return NextResponse.json({ error: "Geography weight must be between 0 and 50" }, { status: 400 });
      }
      data.geographyWeight = geographyWeight;
    }
    if (timingWeight !== undefined) {
      if (typeof timingWeight !== "number" || timingWeight < 0 || timingWeight > 50) {
        return NextResponse.json({ error: "Timing weight must be between 0 and 50" }, { status: 400 });
      }
      data.timingWeight = timingWeight;
    }
    if (utahMultiplier !== undefined) {
      if (typeof utahMultiplier !== "number" || utahMultiplier < 1 || utahMultiplier > 3) {
        return NextResponse.json({ error: "Utah multiplier must be between 1.0 and 3.0" }, { status: 400 });
      }
      data.utahMultiplier = utahMultiplier;
    }

    const config = await prisma.scoringConfig.upsert({
      where: { id: "default" },
      update: data,
      create: { ...DEFAULT_CONFIG, ...data },
    });

    return NextResponse.json(config);
  } catch (error) {
    console.error("Error updating scoring config:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
