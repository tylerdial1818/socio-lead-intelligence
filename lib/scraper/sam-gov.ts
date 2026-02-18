import type { ScraperFetchResult, RawOpportunity } from "./types";

const SAM_API_BASE = "https://api.sam.gov/opportunities/v2/search";

interface SamOpportunity {
  noticeId: string;
  title: string;
  solicitationNumber: string;
  fullParentPathName: string;
  postedDate: string;
  type: string;
  active: string;
  description: string; // URL to description, not actual text
  uiLink: string;
  responseDeadLine: string | null;
  award: {
    amount: string;
    number: string;
  } | null;
  pointOfContact: Array<{
    fullName: string;
    email: string;
    phone: string;
    type: string;
  }>;
  placeOfPerformance: {
    state: { code: string; name: string } | null;
    city: { code: string; name: string } | null;
    country: { code: string; name: string } | null;
  };
}

interface SamApiResponse {
  totalRecords: number;
  opportunitiesData: SamOpportunity[];
}

function formatSamDate(date: Date): string {
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${mm}/${dd}/${date.getFullYear()}`;
}

function parseSamDate(dateStr: string | null | undefined): Date | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

function parseAwardAmount(award: SamOpportunity["award"]): number | null {
  if (!award?.amount) return null;
  const cleaned = award.amount.replace(/[$,]/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

function transformSamOpportunity(sam: SamOpportunity): RawOpportunity {
  const primaryContact =
    sam.pointOfContact?.find((c) => c.type?.toLowerCase() === "primary") ||
    sam.pointOfContact?.[0];

  const state = sam.placeOfPerformance?.state?.code || null;
  const city = sam.placeOfPerformance?.city?.name || null;
  const countryCode = sam.placeOfPerformance?.country?.code || "USA";
  const country = countryCode === "US" || countryCode === "USA" ? "USA" : countryCode;

  return {
    source: "SAM_GOV",
    sourceId: sam.noticeId,
    sourceUrl: sam.uiLink || `https://sam.gov/opp/${sam.noticeId}/view`,
    title: sam.title,
    description: sam.description || null,
    issuingOrg: sam.fullParentPathName?.split(".").pop()?.trim() || null,
    category: sam.type || null,
    postedDate: parseSamDate(sam.postedDate),
    deadline: parseSamDate(sam.responseDeadLine),
    estimatedValue: parseAwardAmount(sam.award),
    estimatedValueLow: null,
    estimatedValueHigh: null,
    locationState: state,
    locationCity: city,
    locationCountry: country,
    contactName: primaryContact?.fullName || null,
    contactEmail: primaryContact?.email || null,
    contactPhone: primaryContact?.phone || null,
    rawData: sam as unknown as Record<string, unknown>,
  };
}

/**
 * Fetch opportunities from SAM.gov posted in the last N days.
 * Rate limit: 10 req/day (public key), 1000/day (entity role).
 * Single request with limit=1000 suffices for daily scraping.
 */
export async function fetchSamOpportunities(
  lookbackDays: number = 7
): Promise<ScraperFetchResult> {
  const apiKey = process.env.SAM_GOV_API_KEY;
  if (!apiKey) {
    return {
      opportunities: [],
      totalAvailable: 0,
      errors: ["SAM_GOV_API_KEY environment variable is not set"],
    };
  }

  const now = new Date();
  const postedFrom = new Date(now.getTime() - lookbackDays * 24 * 60 * 60 * 1000);

  const params = new URLSearchParams({
    api_key: apiKey,
    postedFrom: formatSamDate(postedFrom),
    postedTo: formatSamDate(now),
    limit: "1000",
    offset: "0",
  });

  const opportunities: RawOpportunity[] = [];
  const errors: string[] = [];
  let totalAvailable = 0;

  try {
    const url = `${SAM_API_BASE}?${params.toString()}`;
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      const body = await response.text();
      return {
        opportunities: [],
        totalAvailable: 0,
        errors: [`SAM.gov API returned ${response.status}: ${body.slice(0, 500)}`],
      };
    }

    const data: SamApiResponse = await response.json();
    totalAvailable = data.totalRecords || 0;

    if (data.opportunitiesData) {
      for (const sam of data.opportunitiesData) {
        try {
          if (sam.active?.toLowerCase() === "no") continue;
          opportunities.push(transformSamOpportunity(sam));
        } catch (err) {
          errors.push(
            `Failed to transform SAM notice ${sam.noticeId}: ${err instanceof Error ? err.message : String(err)}`
          );
        }
      }
    }

    if (totalAvailable > 1000) {
      errors.push(
        `SAM.gov returned ${totalAvailable} total results but only first 1000 were fetched`
      );
    }
  } catch (err) {
    errors.push(
      `SAM.gov fetch failed: ${err instanceof Error ? err.message : String(err)}`
    );
  }

  return { opportunities, totalAvailable, errors };
}
