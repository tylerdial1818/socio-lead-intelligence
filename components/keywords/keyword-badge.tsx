"use client";

import { cn } from "@/lib/utils";
import type { KeywordType } from "@/types";

interface KeywordBadgeProps {
  term: string;
  type: KeywordType;
  matchLocation?: string | null;
  onClick?: () => void;
  className?: string;
}

export function KeywordBadge({
  term,
  type,
  matchLocation,
  onClick,
  className,
}: KeywordBadgeProps) {
  const typeStyles: Record<KeywordType, string> = {
    INCLUDE:
      "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100",
    EXCLUDE: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex flex-col items-start rounded-md border px-2.5 py-1 text-xs transition-colors",
        typeStyles[type],
        onClick ? "cursor-pointer" : "cursor-default",
        className
      )}
    >
      <span className="font-medium">{term}</span>
      {matchLocation && (
        <span className="text-[10px] leading-tight opacity-70">
          {matchLocation}
        </span>
      )}
    </button>
  );
}
