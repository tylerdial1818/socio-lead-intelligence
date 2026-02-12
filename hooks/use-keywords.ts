import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  Keyword,
  KeywordsResponse,
  KeywordFormData,
  KeywordStats,
  OpportunityKeyword,
  Opportunity,
} from "@/types";

interface KeywordFilters {
  type?: string;
  tier?: string;
  category?: string;
  isActive?: boolean;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
}

interface KeywordDetailResponse {
  keyword: Keyword;
  opportunities: Array<Opportunity & { matchedKeywords: OpportunityKeyword[] }>;
}

export function useKeywords(filters: KeywordFilters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "" && value !== "all") {
      params.set(key, String(value));
    }
  });

  return useQuery<KeywordsResponse>({
    queryKey: ["keywords", filters],
    queryFn: async () => {
      const res = await fetch(`/api/keywords?${params}`);
      if (!res.ok) throw new Error("Failed to fetch keywords");
      return res.json() as Promise<KeywordsResponse>;
    },
  });
}

export function useKeyword(id: string | null) {
  return useQuery<KeywordDetailResponse>({
    queryKey: ["keyword", id],
    queryFn: async () => {
      const res = await fetch(`/api/keywords/${id}`);
      if (!res.ok) throw new Error("Failed to fetch keyword");
      return res.json() as Promise<KeywordDetailResponse>;
    },
    enabled: !!id,
  });
}

export function useCreateKeyword() {
  const queryClient = useQueryClient();

  return useMutation<Keyword, Error, KeywordFormData>({
    mutationFn: async (data) => {
      const res = await fetch("/api/keywords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create keyword");
      return res.json() as Promise<Keyword>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["keywords"] });
    },
  });
}

export function useUpdateKeyword() {
  const queryClient = useQueryClient();

  return useMutation<Keyword, Error, Partial<KeywordFormData> & { id: string; isActive?: boolean }>({
    mutationFn: async ({ id, ...data }) => {
      const res = await fetch(`/api/keywords/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update keyword");
      return res.json() as Promise<Keyword>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["keywords"] });
    },
  });
}

export function useDeleteKeyword() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      const res = await fetch(`/api/keywords/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete keyword");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["keywords"] });
    },
  });
}

export function useKeywordCategories() {
  return useQuery<string[]>({
    queryKey: ["keywords", "categories"],
    queryFn: async () => {
      const res = await fetch("/api/keywords/categories");
      if (!res.ok) throw new Error("Failed to fetch keyword categories");
      return res.json() as Promise<string[]>;
    },
  });
}

export function useKeywordStats() {
  return useQuery<KeywordStats>({
    queryKey: ["keywords", "stats"],
    queryFn: async () => {
      const res = await fetch("/api/keywords/stats");
      if (!res.ok) throw new Error("Failed to fetch keyword stats");
      return res.json() as Promise<KeywordStats>;
    },
  });
}
