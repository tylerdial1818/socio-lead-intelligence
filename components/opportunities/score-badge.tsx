import { cn } from "@/lib/utils";

interface ScoreBadgeProps {
  score: number;
  tier: "HOT" | "WARM" | "COOL" | "COLD";
  size?: "sm" | "md" | "lg";
}

export function ScoreBadge({ score, tier, size = "md" }: ScoreBadgeProps) {
  const styles = {
    HOT: "bg-red-100 text-red-600 border-red-200",
    WARM: "bg-orange-100 text-orange-600 border-orange-200",
    COOL: "bg-blue-100 text-blue-600 border-blue-200",
    COLD: "bg-zinc-100 text-zinc-600 border-zinc-200",
  };

  const sizes = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5",
  };

  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 font-mono font-medium border rounded-full",
      styles[tier],
      sizes[size]
    )}>
      {score}
      <span className="font-sans font-medium">{tier}</span>
    </span>
  );
}
