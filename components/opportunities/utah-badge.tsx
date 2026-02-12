import { cn } from "@/lib/utils";

interface UtahBadgeProps {
  className?: string;
}

export function UtahBadge({ className }: UtahBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-1.5 py-0.5 rounded text-xs font-mono font-medium",
        "bg-amber-100 text-amber-700 border border-amber-200",
        className
      )}
      title="Utah opportunity (priority market)"
    >
      UT
    </span>
  );
}
