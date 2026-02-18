import type { Source } from "@/lib/generated/prisma/client";

/**
 * Normalized shape every scraper must produce.
 * Maps to the Opportunity model's create fields (minus computed fields).
 */
export interface RawOpportunity {
  source: Source;
  sourceId: string;
  sourceUrl: string | null;
  title: string;
  description: string | null;
  issuingOrg: string | null;
  category: string | null;
  postedDate: Date | null;
  deadline: Date | null;
  estimatedValue: number | null;
  estimatedValueLow: number | null;
  estimatedValueHigh: number | null;
  locationState: string | null;
  locationCity: string | null;
  locationCountry: string;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  rawData: Record<string, unknown>;
}

export interface ScraperFetchResult {
  opportunities: RawOpportunity[];
  totalAvailable: number;
  errors: string[];
}

export interface ScraperRunResult {
  source: Source;
  status: "SUCCESS" | "PARTIAL" | "FAILED";
  opportunitiesFound: number;
  opportunitiesNew: number;
  errors: string[];
  durationMs: number;
}
