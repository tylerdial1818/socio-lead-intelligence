import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("animate-pulse rounded-lg bg-zinc-100", className)} {...props} />
  );
}

export function MetricsSkeleton() {
  return (
    <div className="grid grid-cols-4 gap-6 mb-8">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white border border-zinc-200 rounded-xl p-6">
          <Skeleton className="h-4 w-20 mb-3" />
          <Skeleton className="h-8 w-16" />
        </div>
      ))}
    </div>
  );
}

export function OpportunityCardSkeleton() {
  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-6">
      <div className="flex justify-between mb-4">
        <div className="space-y-2">
          <Skeleton className="h-5 w-64" />
          <Skeleton className="h-4 w-40" />
        </div>
        <Skeleton className="h-7 w-20 rounded-full" />
      </div>
      <Skeleton className="h-4 w-48 mb-4" />
      <div className="flex gap-3">
        <Skeleton className="h-9 w-20 rounded-lg" />
        <Skeleton className="h-9 w-20 rounded-lg" />
        <Skeleton className="h-9 w-32 rounded-lg" />
      </div>
    </div>
  );
}
