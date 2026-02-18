import { prisma } from "@/lib/db";

interface KeywordRecord {
  id: string;
  term: string;
  type: "INCLUDE" | "EXCLUDE";
  tier: "HIGH" | "MEDIUM" | "LOW";
}

export interface KeywordMatch {
  keywordId: string;
  term: string;
  type: "INCLUDE" | "EXCLUDE";
  tier: "HIGH" | "MEDIUM" | "LOW";
  matchLocation: "title" | "description" | "both";
}

export interface KeywordMatchResult {
  matched: KeywordMatch[];
  includeTerms: string[];
  hasExcludeMatch: boolean;
}

export async function loadActiveKeywords(): Promise<KeywordRecord[]> {
  return prisma.keyword.findMany({
    where: { isActive: true },
    select: { id: true, term: true, type: true, tier: true },
  });
}

export function matchKeywords(
  title: string | null,
  description: string | null,
  keywords: KeywordRecord[]
): KeywordMatchResult {
  const titleLower = (title || "").toLowerCase();
  const descLower = (description || "").toLowerCase();
  const matched: KeywordMatch[] = [];

  for (const kw of keywords) {
    const termLower = kw.term.toLowerCase();
    const inTitle = titleLower.includes(termLower);
    const inDesc = descLower.includes(termLower);

    if (inTitle || inDesc) {
      matched.push({
        keywordId: kw.id,
        term: kw.term,
        type: kw.type as "INCLUDE" | "EXCLUDE",
        tier: kw.tier as "HIGH" | "MEDIUM" | "LOW",
        matchLocation: inTitle && inDesc ? "both" : inTitle ? "title" : "description",
      });
    }
  }

  return {
    matched,
    includeTerms: matched.filter((m) => m.type === "INCLUDE").map((m) => m.term),
    hasExcludeMatch: matched.some((m) => m.type === "EXCLUDE"),
  };
}
