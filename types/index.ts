export type Tier = "HOT" | "WARM" | "COOL" | "COLD";
export type Status = "NEW" | "REVIEWING" | "PURSUING" | "PASSED" | "WON" | "LOST";
export type Source = "UTAH_BONFIRE" | "STATE_BONFIRE" | "BIDNET" | "SAM_GOV" | "WORLD_BANK" | "UNGM" | "UNDP";

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface ScoreBreakdown {
  budget: number;
  sector: number;
  geography: number;
  timing: number;
}

export interface AIBrief {
  summary: string;
  fitAnalysis: string;
  strengths: string[];
  concerns: string[];
  recommendation: "PURSUE" | "CONSIDER" | "PASS";
}

export interface Opportunity {
  id: string;
  source: Source;
  sourceId: string;
  sourceUrl: string | null;
  title: string;
  description: string | null;
  issuingOrg: string | null;
  category: string | null;
  postedDate: string | null;
  deadline: string | null;
  estimatedValue: number | null;
  estimatedValueLow: number | null;
  estimatedValueHigh: number | null;
  locationState: string | null;
  locationCity: string | null;
  locationCountry: string;
  isUtah: boolean;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  icpScore: number | null;
  scoreBreakdown: ScoreBreakdown | null;
  tier: Tier | null;
  aiBrief: AIBrief | null;
  aiGeneratedAt: string | null;
  keywordsMatched: string[];
  status: Status;
  decision: string | null;
  assignedTo: TeamMember | null;
  assignedToId: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  activeCount: number;
  hotCount: number;
  warmCount: number;
  pipelineValue: number;
  dueSoonCount: number;
  lastSyncAt: string | null;
  lastSyncStatus: string | null;
}

export interface OpportunitiesResponse {
  data: Opportunity[];
  total: number;
}
