import type { Source } from "@/lib/generated/prisma/client";
import type { ScraperFetchResult, RawOpportunity } from "./types";
import type { BonfireHub } from "./bonfire-hubs";

// ---------- Bonfire API types ----------

interface BonfireProject {
  ProjectID: string;
  PrivateProjectID: string;
  ReferenceID: string;
  ProjectStatusID: string;
  ProjectSubStatusID: string;
  ProjectVisibilityID: string;
  ProjectName: string;
  DateClose: string; // "2026-02-18 17:00:00"
  DepartmentID: string;
}

interface BonfireDepartment {
  DepartmentName: string;
}

interface BonfireApiResponse {
  success: number;
  message: string;
  payload: {
    projects: Record<string, BonfireProject>;
    departments: Record<string, BonfireDepartment>;
  };
}

// ---------- Generic helpers ----------

function parseBonfireDateWithOffset(
  dateStr: string | null | undefined,
  utcOffset: string
): Date | null {
  if (!dateStr) return null;
  const d = new Date(dateStr.replace(" ", "T") + utcOffset);
  return isNaN(d.getTime()) ? null : d;
}

function buildOpportunityUrlForHub(
  project: BonfireProject,
  subdomain: string
): string {
  if (project.ProjectVisibilityID === "1") {
    return `https://${subdomain}.bonfirehub.com/opportunities/${project.ProjectID}`;
  }
  return `https://${subdomain}.bonfirehub.com/opportunities/private/${project.PrivateProjectID}`;
}

function transformProject(
  project: BonfireProject,
  departments: Record<string, BonfireDepartment>,
  config: {
    source: Source;
    subdomain: string;
    sourceIdPrefix: string | null;
    state: string;
    city: string | null;
    utcOffset: string;
  }
): RawOpportunity {
  const dept = departments[project.DepartmentID];
  const deptName = dept?.DepartmentName || null;
  const sourceId = config.sourceIdPrefix
    ? `${config.sourceIdPrefix}-${project.ProjectID}`
    : project.ProjectID;

  return {
    source: config.source,
    sourceId,
    sourceUrl: buildOpportunityUrlForHub(project, config.subdomain),
    title: project.ProjectName,
    description: deptName
      ? `${project.ProjectName} — Issued by ${deptName}. Reference: ${project.ReferenceID}`
      : null,
    issuingOrg: deptName,
    category: null,
    postedDate: null,
    deadline: parseBonfireDateWithOffset(project.DateClose, config.utcOffset),
    estimatedValue: null,
    estimatedValueLow: null,
    estimatedValueHigh: null,
    locationState: config.state,
    locationCity: config.city,
    locationCountry: "USA",
    contactName: null,
    contactEmail: null,
    contactPhone: null,
    rawData: project as unknown as Record<string, unknown>,
  };
}

/** Generic fetch for any Bonfire hub. */
async function fetchHub(
  subdomain: string,
  label: string,
  transformConfig: {
    source: Source;
    sourceIdPrefix: string | null;
    state: string;
    city: string | null;
    utcOffset: string;
  }
): Promise<ScraperFetchResult> {
  const url = `https://${subdomain}.bonfirehub.com/PublicPortal/getOpenPublicOpportunitiesSectionData`;
  const opportunities: RawOpportunity[] = [];
  const errors: string[] = [];
  let totalAvailable = 0;

  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      const body = await response.text();
      return {
        opportunities: [],
        totalAvailable: 0,
        errors: [
          `${label} Bonfire API returned ${response.status}: ${body.slice(0, 500)}`,
        ],
      };
    }

    const data: BonfireApiResponse = await response.json();

    if (!data.success || !data.payload?.projects) {
      return {
        opportunities: [],
        totalAvailable: 0,
        errors: [
          `${label} Bonfire API returned unsuccessful response: ${data.message}`,
        ],
      };
    }

    const projects = Object.values(data.payload.projects);
    totalAvailable = projects.length;

    for (const project of projects) {
      try {
        opportunities.push(
          transformProject(project, data.payload.departments, {
            ...transformConfig,
            subdomain,
          })
        );
      } catch (err) {
        errors.push(
          `Failed to transform ${label} project ${project.ProjectID}: ${err instanceof Error ? err.message : String(err)}`
        );
      }
    }
  } catch (err) {
    errors.push(
      `${label} fetch failed: ${err instanceof Error ? err.message : String(err)}`
    );
  }

  return { opportunities, totalAvailable, errors };
}

// ---------- Public API ----------

/**
 * Fetch all open opportunities from the Utah Bonfire portal.
 * Backward-compatible: uses UTAH_BONFIRE source, no sourceId prefix.
 */
export async function fetchBonfireOpportunities(): Promise<ScraperFetchResult> {
  return fetchHub("utah", "Utah", {
    source: "UTAH_BONFIRE",
    sourceIdPrefix: null,
    state: "UT",
    city: null,
    utcOffset: "-07:00",
  });
}

/**
 * Fetch all open opportunities from any Bonfire hub.
 * Uses STATE_BONFIRE source with subdomain-prefixed sourceIds.
 */
export async function fetchBonfireHub(
  hub: BonfireHub
): Promise<ScraperFetchResult> {
  return fetchHub(hub.subdomain, hub.label, {
    source: "STATE_BONFIRE",
    sourceIdPrefix: hub.subdomain,
    state: hub.state,
    city: hub.city,
    utcOffset: hub.utcOffset,
  });
}
