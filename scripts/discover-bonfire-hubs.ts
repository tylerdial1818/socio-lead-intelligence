/**
 * Discovery script to find Bonfire procurement portals via certificate transparency logs.
 * Queries crt.sh for all subdomains of bonfirehub.com, then validates each by hitting
 * the public API endpoint.
 *
 * Usage: npx tsx scripts/discover-bonfire-hubs.ts
 *
 * Output: List of valid Bonfire portals with opportunity counts.
 */

interface CrtShEntry {
  common_name: string;
  name_value: string;
}

async function discoverSubdomains(): Promise<string[]> {
  console.log("Querying crt.sh for bonfirehub.com subdomains...\n");

  const res = await fetch(
    "https://crt.sh/?q=%.bonfirehub.com&output=json",
    { signal: AbortSignal.timeout(30000) }
  );

  if (!res.ok) {
    throw new Error(`crt.sh returned ${res.status}`);
  }

  const entries: CrtShEntry[] = await res.json();

  // Extract unique subdomains from certificate names
  const subdomains = new Set<string>();
  for (const entry of entries) {
    const names = entry.name_value.split("\n");
    for (const name of names) {
      const match = name.trim().match(/^([a-z0-9-]+)\.bonfirehub\.com$/i);
      if (match) {
        subdomains.add(match[1].toLowerCase());
      }
    }
  }

  // Filter out known non-portal subdomains
  const excluded = new Set([
    "www",
    "api",
    "vendor",
    "mail",
    "smtp",
    "app",
    "cdn",
    "static",
    "docs",
    "help",
    "support",
    "status",
    "staging",
    "dev",
    "test",
  ]);

  return Array.from(subdomains)
    .filter((s) => !excluded.has(s))
    .sort();
}

async function validateHub(
  subdomain: string
): Promise<{ valid: boolean; projectCount: number; deptCount: number }> {
  try {
    const url = `https://${subdomain}.bonfirehub.com/PublicPortal/getOpenPublicOpportunitiesSectionData`;
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });

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
  const subdomains = await discoverSubdomains();
  console.log(`Found ${subdomains.length} candidate subdomains.\n`);
  console.log("Validating each portal (this may take a few minutes)...\n");

  const results: {
    subdomain: string;
    projectCount: number;
    deptCount: number;
  }[] = [];

  // Process in batches of 5 to avoid overwhelming servers
  for (let i = 0; i < subdomains.length; i += 5) {
    const batch = subdomains.slice(i, i + 5);
    const batchResults = await Promise.all(
      batch.map(async (subdomain) => {
        const result = await validateHub(subdomain);
        const status = result.valid
          ? `${result.projectCount} open opportunities`
          : "no API / inactive";
        process.stdout.write(
          `  [${i + batch.indexOf(subdomain) + 1}/${subdomains.length}] ${subdomain}: ${status}\n`
        );
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

    // Small delay between batches
    if (i + 5 < subdomains.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  console.log("\n\n========== VALID BONFIRE PORTALS ==========\n");
  console.log(
    `Found ${results.length} active portals out of ${subdomains.length} candidates:\n`
  );

  // Sort by opportunity count descending
  results.sort((a, b) => b.projectCount - a.projectCount);

  console.log(
    "| Subdomain | Open Opportunities | Departments |"
  );
  console.log(
    "|-----------|-------------------|-------------|"
  );
  for (const r of results) {
    console.log(
      `| ${r.subdomain.padEnd(30)} | ${String(r.projectCount).padStart(17)} | ${String(r.deptCount).padStart(11)} |`
    );
  }

  console.log("\nTo add a portal, add it to lib/scraper/bonfire-hubs.ts");
}

main().catch((err) => {
  console.error("Discovery failed:", err);
  process.exit(1);
});
