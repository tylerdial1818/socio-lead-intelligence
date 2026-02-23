"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Opportunity } from "@/types";

export function useGenerateBrief() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (opportunityId: string): Promise<Opportunity> => {
      const res = await fetch(`/api/opportunities/${opportunityId}/brief`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to generate brief");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["opportunities"] });
      queryClient.invalidateQueries({ queryKey: ["opportunity"] });
    },
  });
}
