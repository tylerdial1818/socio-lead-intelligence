"use client";
import { useQuery } from "@tanstack/react-query";
import type { DashboardStats } from "@/types";

export function useStats() {
  return useQuery<DashboardStats>({
    queryKey: ["stats"],
    queryFn: async () => {
      const res = await fetch("/api/stats");
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
}
