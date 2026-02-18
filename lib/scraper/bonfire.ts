import type { ScraperFetchResult, RawOpportunity } from "./types";

const UTAH_BONFIRE_URL =
  "https://utah.bonfirehub.com/PublicPortal/getOpenPublicOpportunitiesSectionData";

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

function parseBonfireDate(dateStr: string | null | undefined): Date | null {
  if (!dateStr) return null;
  // Bonfire dates are in "YYYY-MM-DD HH:mm:ss" format (Mountain Time)
  const d = new Date(dateStr.replace(" ", "T") + "-07:00");
  return isNaN(d.getTime()) ? null : d;
}

function buildOpportunityUrl(project: BonfireProject): string {
  if (project.ProjectVisibilityID === "1") {
    return `https://utah.bonfirehub.com/opportunities/${project.ProjectID}`;
  }
  return `https://utah.bonfirehub.com/opportunities/private/${project.PrivateProjectID}`;
}

function transformBonfireProject(
  project: BonfireProject,
  departments: Record<string, BonfireDepartment>
): RawOpportunity {
  const dept = departments[project.DepartmentID];
  const deptName = dept?.DepartmentName || null;

  return {
    source: "UTAH_BONFIRE",
    sourceId: project.ProjectID,
    sourceUrl: buildOpportunityUrl(project),
    title: project.ProjectName,
    description: deptName
      ? `${project.ProjectName} — Issued by ${deptName}. Reference: ${project.ReferenceID}`
      : null,
    issuingOrg: deptName,
    category: null,
    postedDate: null, // Not provided by Bonfire listing API
    deadline: parseBonfireDate(project.DateClose),
    estimatedValue: null, // Not provided
    estimatedValueLow: null,
    estimatedValueHigh: null,
    locationState: "UT",
    locationCity: null,
    locationCountry: "USA",
    contactName: null,
    contactEmail: null,
    contactPhone: null,
    rawData: project as unknown as Record<string, unknown>,
  };
}

/**
 * Fetch all open opportunities from the Utah Bonfire portal.
 * No auth required. Single request returns all open listings.
 */
export async function fetchBonfireOpportunities(): Promise<ScraperFetchResult> {
  const opportunities: RawOpportunity[] = [];
  const errors: string[] = [];
  let totalAvailable = 0;

  try {
    const response = await fetch(UTAH_BONFIRE_URL, {
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      const body = await response.text();
      return {
        opportunities: [],
        totalAvailable: 0,
        errors: [`Bonfire API returned ${response.status}: ${body.slice(0, 500)}`],
      };
    }

    const data: BonfireApiResponse = await response.json();

    if (!data.success || !data.payload?.projects) {
      return {
        opportunities: [],
        totalAvailable: 0,
        errors: [`Bonfire API returned unsuccessful response: ${data.message}`],
      };
    }

    const projects = Object.values(data.payload.projects);
    totalAvailable = projects.length;

    for (const project of projects) {
      try {
        opportunities.push(
          transformBonfireProject(project, data.payload.departments)
        );
      } catch (err) {
        errors.push(
          `Failed to transform Bonfire project ${project.ProjectID}: ${err instanceof Error ? err.message : String(err)}`
        );
      }
    }
  } catch (err) {
    errors.push(
      `Bonfire fetch failed: ${err instanceof Error ? err.message : String(err)}`
    );
  }

  return { opportunities, totalAvailable, errors };
}
