import { NextRequest, NextResponse } from "next/server";
import { fetchWorldBankOpportunities } from "@/lib/scraper/world-bank";
import { runPipeline } from "@/lib/scraper/pipeline";

export const maxDuration = 60;

function verifyCronAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return false;
  return authHeader === `Bearer ${cronSecret}`;
}

export async function GET(request: NextRequest) {
  if (!verifyCronAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const fetchResult = await fetchWorldBankOpportunities(30);
    const result = await runPipeline("WORLD_BANK", fetchResult.opportunities, fetchResult.errors);

    return NextResponse.json(result, {
      status: result.status === "FAILED" ? 500 : 200,
    });
  } catch (error) {
    console.error("World Bank scraper error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
