import { TrendingUp, Flame, DollarSign, Clock } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { DashboardStats } from "@/types";

interface MetricsRowProps {
  stats: DashboardStats;
}

export function MetricsRow({ stats }: MetricsRowProps) {
  const metrics = [
    {
      label: "Active Leads",
      value: stats.activeCount.toString(),
      icon: TrendingUp,
      iconColor: "text-zinc-600",
    },
    {
      label: "HOT",
      value: stats.hotCount.toString(),
      icon: Flame,
      iconColor: "text-red-500",
    },
    {
      label: "Pipeline Value",
      value: formatCurrency(stats.pipelineValue),
      icon: DollarSign,
      iconColor: "text-green-500",
    },
    {
      label: "Due Soon (7 days)",
      value: stats.dueSoonCount.toString(),
      icon: Clock,
      iconColor: "text-amber-500",
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-6 mb-8">
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className="bg-white border border-zinc-200 rounded-xl p-6 hover:border-zinc-300 hover:shadow-sm transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-zinc-500 font-medium">{metric.label}</span>
            <metric.icon className={`w-5 h-5 ${metric.iconColor}`} />
          </div>
          <p className="text-3xl font-bold text-zinc-900 font-mono">{metric.value}</p>
        </div>
      ))}
    </div>
  );
}
