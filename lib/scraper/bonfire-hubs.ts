/**
 * Registry of Bonfire procurement portals to scrape.
 * All portals share the same API: https://{subdomain}.bonfirehub.com/PublicPortal/getOpenPublicOpportunitiesSectionData
 *
 * Set `enabled: true` to include a hub in the daily cron scrape.
 * Keep total enabled hubs to ~3 to stay within Vercel's 60s function timeout.
 *
 * Discovery results (Feb 2026): 18 valid portals, 705 total opportunities.
 * Run `npx tsx scripts/discover-bonfire-hubs.ts` to find more.
 */

export interface BonfireHub {
  /** Subdomain used in {subdomain}.bonfirehub.com */
  subdomain: string;
  /** Human-readable label */
  label: string;
  /** Two-letter US state code */
  state: string;
  /** City name if applicable (null for state-level agencies) */
  city: string | null;
  /** UTC offset for parsing Bonfire date strings, e.g. "-06:00" */
  utcOffset: string;
  /** Whether this hub is actively scraped */
  enabled: boolean;
}

export const BONFIRE_HUBS: BonfireHub[] = [
  // --- Active hubs (scraped daily alongside Utah) ---
  // PennBid is the largest hub (268 opps), followed by TxDOT (38) and CPS (25)
  {
    subdomain: "pennbid",
    label: "PennBid (Pennsylvania)",
    state: "PA",
    city: null,
    utcOffset: "-05:00",
    enabled: true,
  },
  {
    subdomain: "txdot",
    label: "Texas DOT",
    state: "TX",
    city: null,
    utcOffset: "-06:00",
    enabled: true,
  },
  {
    subdomain: "cps",
    label: "Chicago Public Schools",
    state: "IL",
    city: "Chicago",
    utcOffset: "-06:00",
    enabled: true,
  },

  // --- Ready to enable (disabled until we have more cron capacity) ---
  {
    subdomain: "dallascityhall",
    label: "Dallas City Hall",
    state: "TX",
    city: "Dallas",
    utcOffset: "-06:00",
    enabled: false,
  },
  {
    subdomain: "detroit",
    label: "City of Detroit",
    state: "MI",
    city: "Detroit",
    utcOffset: "-05:00",
    enabled: false,
  },
  {
    subdomain: "cookcountyil",
    label: "Cook County, IL",
    state: "IL",
    city: null,
    utcOffset: "-06:00",
    enabled: false,
  },
  {
    subdomain: "columbus",
    label: "City of Columbus",
    state: "OH",
    city: "Columbus",
    utcOffset: "-05:00",
    enabled: false,
  },
  {
    subdomain: "palmcoastgov",
    label: "Palm Coast, FL",
    state: "FL",
    city: "Palm Coast",
    utcOffset: "-05:00",
    enabled: false,
  },
  {
    subdomain: "alleghenycounty",
    label: "Allegheny County (PA)",
    state: "PA",
    city: null,
    utcOffset: "-05:00",
    enabled: false,
  },
  {
    subdomain: "maricopa",
    label: "Maricopa County (AZ)",
    state: "AZ",
    city: null,
    utcOffset: "-07:00",
    enabled: false,
  },
  {
    subdomain: "crcog",
    label: "Capitol Region COG (CT)",
    state: "CT",
    city: null,
    utcOffset: "-05:00",
    enabled: false,
  },
  {
    subdomain: "cityofmilwaukee",
    label: "City of Milwaukee",
    state: "WI",
    city: "Milwaukee",
    utcOffset: "-06:00",
    enabled: false,
  },
  {
    subdomain: "deldot",
    label: "Delaware DOT",
    state: "DE",
    city: null,
    utcOffset: "-05:00",
    enabled: false,
  },
  {
    subdomain: "fcps",
    label: "Fairfax County Public Schools (VA)",
    state: "VA",
    city: null,
    utcOffset: "-05:00",
    enabled: false,
  },
  {
    subdomain: "hapgcprocurement",
    label: "Housing Authority PG County (MD)",
    state: "MD",
    city: null,
    utcOffset: "-05:00",
    enabled: false,
  },
  {
    subdomain: "hcpss",
    label: "Howard County Public Schools (MD)",
    state: "MD",
    city: null,
    utcOffset: "-05:00",
    enabled: false,
  },
];

/** Get all hubs that are enabled for scraping */
export function getEnabledHubs(): BonfireHub[] {
  return BONFIRE_HUBS.filter((h) => h.enabled);
}
