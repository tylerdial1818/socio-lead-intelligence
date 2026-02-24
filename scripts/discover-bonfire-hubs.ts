/**
 * Discovery script to find Bonfire procurement portals across the US.
 * Tests candidate subdomains by hitting the public API endpoint.
 *
 * Usage: npx tsx scripts/discover-bonfire-hubs.ts
 *
 * Output: List of valid Bonfire portals with opportunity counts.
 * Takes ~3-5 minutes to run through all candidates.
 */

// Candidate subdomains generated from:
// - US state names and abbreviations
// - Top 100 US cities by population
// - Common government naming patterns ({city}gov, cityof{city}, etc.)
// - Known portals from web research
const CANDIDATES: string[] = [
  // Known working portals (from research)
  "utah",
  "dallascityhall",
  "txdot",
  "pennbid",
  "detroit",
  "palmcoastgov",
  "cookcountyil",
  "crcog",
  "hapgcprocurement",
  "hcpss",

  // US States (full names and abbreviations)
  "alabama", "alaska", "arizona", "arkansas", "california",
  "colorado", "connecticut", "delaware", "florida", "georgia",
  "hawaii", "idaho", "illinois", "indiana", "iowa",
  "kansas", "kentucky", "louisiana", "maine", "maryland",
  "massachusetts", "michigan", "minnesota", "mississippi", "missouri",
  "montana", "nebraska", "nevada", "newhampshire", "newjersey",
  "newmexico", "newyork", "northcarolina", "northdakota", "ohio",
  "oklahoma", "oregon", "pennsylvania", "rhodeisland", "southcarolina",
  "southdakota", "tennessee", "texas", "vermont", "virginia",
  "washington", "westvirginia", "wisconsin", "wyoming",

  // State government patterns
  "stateofutah", "stateoforegon", "stateofmaine", "stateofohio",
  "stateofindiana", "stateofkansas", "stateofmontana",

  // Top US cities
  "newyorkcity", "losangeles", "chicago", "houston", "phoenix",
  "philadelphia", "sanantonio", "sandiego", "dallas", "sanjose",
  "austin", "jacksonville", "fortworth", "columbus", "charlotte",
  "indianapolis", "sanfrancisco", "seattle", "denver", "nashville",
  "oklahomacity", "elpaso", "boston", "portland", "lasvegas",
  "memphis", "louisville", "baltimore", "milwaukee", "albuquerque",
  "tucson", "fresno", "sacramento", "mesa", "kansascity",
  "atlanta", "omaha", "raleigh", "coloradosprings", "miami",
  "longbeach", "virginiabeach", "oakland", "minneapolis", "tulsa",
  "tampa", "arlington", "neworleans", "bakersfield", "anaheim",
  "honolulu", "aurora", "santaana", "stlouis", "stpaul",
  "pittsburgh", "greensboro", "anchorage", "plano", "lincoln",

  // City government patterns
  "cityofchicago", "cityofdetroit", "cityofboston", "cityofseattle",
  "cityofatlanta", "cityofdallas", "cityofhouston", "cityofphoenix",
  "cityofdenver", "cityofaustin", "cityofportland", "cityofmemphis",
  "cityofjacksonville", "cityofcharlotte", "cityofcolumbus",
  "cityofsanjose", "cityofelpaso", "cityoftampa", "cityofmilwaukee",
  "cityofomaha", "cityofraleigh", "cityoftulsa", "cityofmesa",
  "cityofoakland", "cityofmiami", "cityofnashville",

  // County patterns
  "cookcounty", "harriscounty", "maricopa", "losangelescounty",
  "sandiegocounty", "orangecounty", "kingcounty", "clarkecounty",
  "dallascounty", "waynecounty", "alleghenycounty", "mecklenburgcounty",
  "suffolkcounty", "middlesexcounty", "palmbeachcounty",
  "broomecounty", "monroecounty", "eriecounty",

  // DOT / Transportation
  "aldot", "adot", "ardot", "caltrans", "cdot", "ctdot",
  "deldot", "fdot", "gdot", "hdot", "idot", "indot", "iowadot",
  "kdot", "kytc", "ladotd", "mainedot", "mdot", "massdot",
  "mdot", "mndot", "msdot", "modot", "mdt", "ndot",
  "nhdot", "njdot", "nmdot", "nysdot", "ncdot", "nddot",
  "odot", "okdot", "ordot", "penndot", "ridot", "scdot",
  "sddot", "tdot", "udot", "vtrans", "vdot", "wsdot",
  "wvdot", "widot", "wydot",

  // School districts / Education
  "hcpss", "mcps", "fcps", "lcps", "dcps",
  "lausd", "nycdoe", "cps", "hisd", "miamidade",

  // Housing authorities
  "hapgc", "nycha", "hacc", "hacla", "hadc",

  // Other common patterns
  "procurement", "purchasing", "bidding", "bids",
  "govbids", "publicbids", "eprocurement",
];

// Deduplicate
const uniqueCandidates = Array.from(new Set(CANDIDATES));

async function validateHub(
  subdomain: string
): Promise<{ valid: boolean; projectCount: number; deptCount: number }> {
  try {
    const url = `https://${subdomain}.bonfirehub.com/PublicPortal/getOpenPublicOpportunitiesSectionData`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });

    if (!res.ok) return { valid: false, projectCount: 0, deptCount: 0 };

    const data = await res.json();
    if (!data.success || !data.payload?.projects) {
      return { valid: false, projectCount: 0, deptCount: 0 };
    }

    return {
      valid: true,
      projectCount: Object.keys(data.payload.projects).length,
      deptCount: Object.keys(data.payload.departments || {}).length,
    };
  } catch {
    return { valid: false, projectCount: 0, deptCount: 0 };
  }
}

async function main() {
  console.log(
    `Testing ${uniqueCandidates.length} candidate subdomains against Bonfire API...\n`
  );
  console.log("This will take a few minutes. Valid portals shown as found.\n");

  const results: {
    subdomain: string;
    projectCount: number;
    deptCount: number;
  }[] = [];

  // Process in batches of 8 with delays to avoid overwhelming servers
  for (let i = 0; i < uniqueCandidates.length; i += 8) {
    const batch = uniqueCandidates.slice(i, i + 8);
    const batchResults = await Promise.all(
      batch.map(async (subdomain) => {
        const result = await validateHub(subdomain);
        if (result.valid) {
          console.log(
            `  FOUND: ${subdomain}.bonfirehub.com (${result.projectCount} opportunities, ${result.deptCount} departments)`
          );
        }
        return { subdomain, ...result };
      })
    );

    for (const r of batchResults) {
      if (r.valid) {
        results.push({
          subdomain: r.subdomain,
          projectCount: r.projectCount,
          deptCount: r.deptCount,
        });
      }
    }

    // Progress indicator every 40 candidates
    if ((i + 8) % 40 < 8) {
      const pct = Math.min(
        100,
        Math.round(((i + 8) / uniqueCandidates.length) * 100)
      );
      process.stdout.write(`  ... ${pct}% checked\n`);
    }

    // Small delay between batches
    if (i + 8 < uniqueCandidates.length) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  console.log("\n\n========== VALID BONFIRE PORTALS ==========\n");
  console.log(
    `Found ${results.length} active portals out of ${uniqueCandidates.length} candidates:\n`
  );

  // Sort by opportunity count descending
  results.sort((a, b) => b.projectCount - a.projectCount);

  console.log("| Subdomain                      | Open Opportunities | Departments |");
  console.log("|--------------------------------|-------------------|-------------|");
  for (const r of results) {
    console.log(
      `| ${r.subdomain.padEnd(30)} | ${String(r.projectCount).padStart(17)} | ${String(r.deptCount).padStart(11)} |`
    );
  }

  const totalOpps = results.reduce((sum, r) => sum + r.projectCount, 0);
  console.log(`\nTotal: ${totalOpps} opportunities across ${results.length} portals`);
  console.log("\nTo add a portal, add it to lib/scraper/bonfire-hubs.ts");
}

main().catch((err) => {
  console.error("Discovery failed:", err);
  process.exit(1);
});
