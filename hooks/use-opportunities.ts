"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Opportunity, OpportunitiesResponse } from "@/types";

interface OpportunityFilters {
  tier?: string;
  status?: string;
  source?: string;
  search?: string;
  isUtah?: boolean;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: string;
}

export function useOpportunities(filters: OpportunityFilters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "" && value !== "all") {
      params.set(key, String(value));
    }
  });

  return useQuery<OpportunitiesResponse>({
    queryKey: ["opportunities", filters],
    queryFn: async () => {
      const res = await fetch(`/api/opportunities?${params}`);
      if (!res.ok) throw new Error("Failed to fetch opportunities");
      return res.json();
    },
  });
}

export function useOpportunity(id: string | null) {
  return useQuery<Opportunity>({
    queryKey: ["opportunity", id],
    queryFn: async () => {
      const res = await fetch(`/api/opportunities/${id}`);
      if (!res.ok) throw new Error("Failed to fetch opportunity");
      return res.json();
    },
    enabled: !!id,
  });
}

export function useUpdateOpportunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; status?: string; assignedToId?: string; notes?: string; decision?: string }) => {
      const res = await fetch(`/api/opportunities/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update opportunity");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["opportunities"] });
      queryClient.invalidateQueries({ queryKey: ["opportunity"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}
