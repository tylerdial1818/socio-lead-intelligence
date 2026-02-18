import type { ScraperFetchResult, RawOpportunity } from "./types";

const WB_API_BASE = "https://search.worldbank.org/api/v2/procnotices";

interface WbNotice {
  id: string;
  notice_type: string;
  noticedate: string;
  notice_status: string;
  project_name: string;
  project_ctry_name: string;
  bid_description: string;
  submission_deadline_date: string;
  contact_name: string;
  contact_email: string;
  procurement_method_name: string;
  notice_text: string;
  project_id: string;
}

interface WbApiResponse {
  total: number;
  rows: number;
  procnotices: Record<string, WbNotice>;
}

function parseWbDate(dateStr: string | null | undefined): Date | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

function transformWbNotice(wb: WbNotice): RawOpportunity {
  const description = [wb.bid_description, wb.notice_text]
    .filter(Boolean)
    .join("\n\n")
    .slice(0, 10000);

  return {
    source: "WORLD_BANK",
    sourceId: wb.id,
    sourceUrl: `https://projects.worldbank.org/en/projects-operations/procurement-detail/${wb.id}`,
    title: wb.project_name || wb.bid_description?.slice(0, 200) || "Untitled",
    description: description || null,
    issuingOrg: "World Bank",
    category: wb.procurement_method_name || wb.notice_type || null,
    postedDate: parseWbDate(wb.noticedate),
    deadline: parseWbDate(wb.submission_deadline_date),
    estimatedValue: null,
    estimatedValueLow: null,
    estimatedValueHigh: null,
    locationState: null,
    locationCity: null,
    locationCountry: wb.project_ctry_name || "International",
    contactName: wb.contact_name || null,
    contactEmail: wb.contact_email || null,
    contactPhone: null,
    rawData: wb as unknown as Record<string, unknown>,
  };
}

/**
 * Fetch procurement notices from the World Bank API.
 * No auth required. Paginates up to 1000 results total.
 */
export async function fetchWorldBankOpportunities(
  lookbackDays: number = 30
): Promise<ScraperFetchResult> {
  const from = new Date(Date.now() - lookbackDays * 24 * 60 * 60 * 1000);
  const fromStr = from.toISOString().split("T")[0];

  const opportunities: RawOpportunity[] = [];
  const errors: string[] = [];
  let totalAvailable = 0;
  let offset = 0;

  try {
    while (offset < 1000) {
      const params = new URLSearchParams({
        format: "json",
        rows: "200",
        os: String(offset),
        strdate: fromStr,
      });

      const response = await fetch(`${WB_API_BASE}?${params.toString()}`, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(30000),
      });

      if (!response.ok) {
        const body = await response.text();
        errors.push(`World Bank API returned ${response.status}: ${body.slice(0, 500)}`);
        break;
      }

      const data: WbApiResponse = await response.json();

      if (offset === 0) {
        totalAvailable = data.total || 0;
      }

      if (!data.procnotices) break;

      const notices = Object.values(data.procnotices);
      if (notices.length === 0) break;

      for (const wb of notices) {
        try {
          if (!wb.id) continue;
          opportunities.push(transformWbNotice(wb));
        } catch (err) {
          errors.push(
            `Failed to transform WB notice ${wb.id}: ${err instanceof Error ? err.message : String(err)}`
          );
        }
      }

      // Stop if we've fetched everything
      if (offset + notices.length >= totalAvailable) break;
      offset += 200;
    }
  } catch (err) {
    errors.push(
      `World Bank fetch failed: ${err instanceof Error ? err.message : String(err)}`
    );
  }

  return { opportunities, totalAvailable, errors };
}
