"use client";
import { useQuery } from "@tanstack/react-query";

export interface AnalyticsData {
  totalCount: number;
  avgScore: number;
  pipelineValue: number;
  activeSources: number;
  byTier: Record<string, number>;
  bySource: Record<string, number>;
  byStatus: Record<string, number>;
  teamAssignments: Array<{ name: string; count: number }>;
  weeklyTrend: Array<{ week: string; count: number }>;
  scoreDistribution: Array<{ range: string; count: number }>;
}

export function useAnalytics() {
  return useQuery<AnalyticsData>({
    queryKey: ["analytics"],
    queryFn: async () => {
      const res = await fetch("/api/analytics");
      if (!res.ok) throw new Error("Failed to fetch analytics");
      return res.json();
    },
  });
}
