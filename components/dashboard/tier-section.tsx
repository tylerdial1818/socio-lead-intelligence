import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface TierSectionProps {
  title: string;
  count?: number;
  tier: "HOT" | "WARM" | "COOL";
  children: React.ReactNode;
}

export function TierSection({ title, count, tier, children }: TierSectionProps) {
  const tierStyles = {
    HOT: "text-red-600",
    WARM: "text-orange-600",
    COOL: "text-blue-600",
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
          <span className={cn("font-bold", tierStyles[tier])}>{title}</span>
          {count !== undefined && (
            <span className="text-sm font-normal text-zinc-400">({count})</span>
          )}
        </h2>
        <Link
          href={`/opportunities?tier=${tier}`}
          className="text-sm text-zinc-500 hover:text-zinc-900 flex items-center gap-1 transition-colors"
        >
          View all
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}
