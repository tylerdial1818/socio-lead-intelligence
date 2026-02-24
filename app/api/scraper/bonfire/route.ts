import { NextRequest, NextResponse } from "next/server";
import {
  fetchBonfireOpportunities,
  fetchBonfireHub,
} from "@/lib/scraper/bonfire";
import { runPipeline } from "@/lib/scraper/pipeline";
import { getEnabledHubs } from "@/lib/scraper/bonfire-hubs";
import type { ScraperRunResult } from "@/lib/scraper/types";

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
    // 1. Scrape Utah (primary, always runs first)
    const utahFetch = await fetchBonfireOpportunities();
    const utahResult = await runPipeline(
      "UTAH_BONFIRE",
      utahFetch.opportunities,
      utahFetch.errors
    );

    // 2. Scrape enabled extra hubs
    const hubResults: (ScraperRunResult & { hub: string })[] = [];
    const enabledHubs = getEnabledHubs();

    for (const hub of enabledHubs) {
      try {
        const fetchResult = await fetchBonfireHub(hub);
        const pipelineResult = await runPipeline(
          "STATE_BONFIRE",
          fetchResult.opportunities,
          fetchResult.errors
        );
        hubResults.push({ ...pipelineResult, hub: hub.subdomain });
      } catch (err) {
        hubResults.push({
          source: "STATE_BONFIRE",
          status: "FAILED",
          opportunitiesFound: 0,
          opportunitiesNew: 0,
          errors: [
            `${hub.label}: ${err instanceof Error ? err.message : String(err)}`,
          ],
          durationMs: 0,
          hub: hub.subdomain,
        });
      }
    }

    const anyFailed =
      utahResult.status === "FAILED" ||
      hubResults.some((r) => r.status === "FAILED");

    return NextResponse.json(
      { utah: utahResult, hubs: hubResults },
      { status: anyFailed ? 207 : 200 }
    );
  } catch (error) {
    console.error("Bonfire scraper error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
