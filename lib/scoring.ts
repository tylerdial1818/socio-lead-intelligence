const UTAH_NEIGHBORING_STATES = ["CO", "NV", "WY", "ID", "AZ", "NM"];

const HEALTH_EVALUATION_KEYWORDS = [
  "health",
  "healthcare",
  "medical",
  "evaluation",
  "assessment",
  "clinical",
  "public health",
  "behavioral health",
  "mental health",
  "epidemiology",
];

const SOCIAL_COMMUNITY_KEYWORDS = [
  "social",
  "community",
  "human services",
  "social services",
  "nonprofit",
  "welfare",
  "housing",
  "homelessness",
  "workforce",
];

const EDUCATION_KEYWORDS = [
  "education",
  "school",
  "university",
  "training",
  "curriculum",
  "academic",
  "student",
  "learning",
];

export type ScoringTier = "HOT" | "WARM" | "COOL" | "COLD";

export interface ScoreBreakdown {
  budget: number;
  sector: number;
  geography: number;
  timing: number;
}

export interface IcpScoreResult {
  score: number;
  breakdown: ScoreBreakdown;
  tier: ScoringTier;
  isUtah: boolean;
}

interface OpportunityInput {
  estimatedValue?: number | null;
  title?: string | null;
  description?: string | null;
  state?: string | null;
  country?: string | null;
  dueDate?: Date | string | null;
}

function scoreBudget(estimatedValue?: number | null): number {
  if (!estimatedValue) return 50;
  if (estimatedValue > 200_000) return 95;
  if (estimatedValue > 100_000) return 85;
  if (estimatedValue > 50_000) return 70;
  return 50;
}

function matchesKeywords(text: string, keywords: string[]): boolean {
  const lower = text.toLowerCase();
  return keywords.some((kw) => lower.includes(kw.toLowerCase()));
}

function scoreSector(title?: string | null, description?: string | null): number {
  const text = [title, description].filter(Boolean).join(" ");
  if (!text) return 60;

  if (matchesKeywords(text, HEALTH_EVALUATION_KEYWORDS)) return 95;
  if (matchesKeywords(text, SOCIAL_COMMUNITY_KEYWORDS)) return 85;
  if (matchesKeywords(text, EDUCATION_KEYWORDS)) return 75;
  return 60;
}

function scoreGeography(
  state?: string | null,
  country?: string | null
): { score: number; isUtah: boolean } {
  const normalizedState = state?.trim().toUpperCase();
  const normalizedCountry = country?.trim().toUpperCase();

  if (normalizedState === "UT" || normalizedState === "UTAH") {
    return { score: 100, isUtah: true };
  }

  if (
    normalizedState &&
    UTAH_NEIGHBORING_STATES.includes(normalizedState)
  ) {
    return { score: 60, isUtah: false };
  }

  if (
    normalizedCountry === "US" ||
    normalizedCountry === "USA" ||
    normalizedCountry === "UNITED STATES"
  ) {
    return { score: 50, isUtah: false };
  }

  if (normalizedCountry) {
    return { score: 40, isUtah: false };
  }

  return { score: 50, isUtah: false };
}

function scoreTiming(dueDate?: Date | string | null): number {
  if (!dueDate) return 50;

  const due = typeof dueDate === "string" ? new Date(dueDate) : dueDate;
  const now = new Date();
  const daysUntilDue = Math.ceil(
    (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysUntilDue > 30) return 90;
  if (daysUntilDue > 14) return 70;
  if (daysUntilDue > 7) return 50;
  return 30;
}

function determineTier(score: number): ScoringTier {
  if (score >= 80) return "HOT";
  if (score >= 60) return "WARM";
  if (score >= 40) return "COOL";
  return "COLD";
}

export function calculateIcpScore(opportunity: OpportunityInput): IcpScoreResult {
  const budget = scoreBudget(opportunity.estimatedValue);
  const sector = scoreSector(opportunity.title, opportunity.description);
  const { score: geography, isUtah } = scoreGeography(
    opportunity.state,
    opportunity.country
  );
  const timing = scoreTiming(opportunity.dueDate);

  const rawScore = (budget + sector + geography + timing) / 4;

  const finalScore = isUtah
    ? Math.min(100, rawScore * 1.5)
    : rawScore;

  const score = Math.round(finalScore * 100) / 100;

  return {
    score,
    breakdown: { budget, sector, geography, timing },
    tier: determineTier(score),
    isUtah,
  };
}
