import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ScoringConfig } from "@/types";

export function useScoringConfig() {
  return useQuery<ScoringConfig>({
    queryKey: ["scoring-config"],
    queryFn: async () => {
      const res = await fetch("/api/scoring-config");
      if (!res.ok) throw new Error("Failed to fetch scoring config");
      return res.json() as Promise<ScoringConfig>;
    },
  });
}

export function useUpdateScoringConfig() {
  const queryClient = useQueryClient();

  return useMutation<ScoringConfig, Error, Partial<Omit<ScoringConfig, "id" | "updatedAt">>>({
    mutationFn: async (data) => {
      const res = await fetch("/api/scoring-config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update scoring config");
      return res.json() as Promise<ScoringConfig>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scoring-config"] });
    },
  });
}
