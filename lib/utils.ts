import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

export function formatSource(source: string): string {
  const map: Record<string, string> = {
    UTAH_BONFIRE: "Utah Bonfire",
    STATE_BONFIRE: "State Bonfire",
    BIDNET: "BidNet",
    SAM_GOV: "SAM.gov",
    WORLD_BANK: "World Bank",
    UNGM: "UNGM",
    UNDP: "UNDP",
  };
  return map[source] || source;
}
