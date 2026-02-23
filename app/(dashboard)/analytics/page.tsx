"use client";
import { PageHeader } from "@/components/layout/header";
import { useAnalytics } from "@/hooks/use-analytics";
import { Loader2, TrendingUp, Target, DollarSign, Globe } from "lucide-react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line, Legend,
} from "recharts";

const TIER_COLORS: Record<string, string> = {
  HOT: "#ef4444",
  WARM: "#f59e0b",
  COOL: "#3b82f6",
  COLD: "#6b7280",
};

const STATUS_COLORS: Record<string, string> = {
  NEW: "#8b5cf6",
  REVIEWING: "#3b82f6",
  PURSUING: "#10b981",
  PASSED: "#6b7280",
  WON: "#22c55e",
  LOST: "#ef4444",
};

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value}`;
}

function formatSource(source: string): string {
  return source.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function AnalyticsPage() {
  const { data, isLoading } = useAnalytics();

  if (isLoading || !data) {
    return (
      <div>
        <PageHeader title="Analytics" description="Pipeline metrics and trends" />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
        </div>
      </div>
    );
  }

  const tierData = Object.entries(data.byTier)
    .filter(([, count]) => count > 0)
    .map(([name, value]) => ({ name, value }));

  const sourceData = Object.entries(data.bySource).map(([name, value]) => ({
    name: formatSource(name),
    value,
  }));

  const statusData = Object.entries(data.byStatus).map(([name, value]) => ({
    name,
    value,
    fill: STATUS_COLORS[name] || "#6b7280",
  }));

  const weeklyData = data.weeklyTrend.map((w) => ({
    week: new Date(w.week).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    count: w.count,
  }));

  return (
    <div>
      <PageHeader title="Analytics" description="Pipeline metrics and trends" />

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-zinc-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-zinc-100 rounded-lg">
              <Target className="w-4 h-4 text-zinc-600" />
            </div>
            <span className="text-sm text-zinc-500">Total Opportunities</span>
          </div>
          <p className="text-3xl font-bold font-mono text-zinc-900">{data.totalCount}</p>
        </div>
        <div className="bg-white border border-zinc-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-zinc-100 rounded-lg">
              <TrendingUp className="w-4 h-4 text-zinc-600" />
            </div>
            <span className="text-sm text-zinc-500">Avg ICP Score</span>
          </div>
          <p className="text-3xl font-bold font-mono text-zinc-900">{data.avgScore}</p>
        </div>
        <div className="bg-white border border-zinc-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-zinc-100 rounded-lg">
              <DollarSign className="w-4 h-4 text-zinc-600" />
            </div>
            <span className="text-sm text-zinc-500">Pipeline Value</span>
          </div>
          <p className="text-3xl font-bold font-mono text-zinc-900">{formatCurrency(data.pipelineValue)}</p>
        </div>
        <div className="bg-white border border-zinc-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-zinc-100 rounded-lg">
              <Globe className="w-4 h-4 text-zinc-600" />
            </div>
            <span className="text-sm text-zinc-500">Active Sources</span>
          </div>
          <p className="text-3xl font-bold font-mono text-zinc-900">{data.activeSources}</p>
        </div>
      </div>

      {/* Row 2: Tier Donut + Source Bar */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-white border border-zinc-200 rounded-xl p-5">
          <h3 className="font-semibold text-zinc-900 mb-4">By Tier</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={tierData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {tierData.map((entry) => (
                  <Cell key={entry.name} fill={TIER_COLORS[entry.name] || "#6b7280"} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white border border-zinc-200 rounded-xl p-5">
          <h3 className="font-semibold text-zinc-900 mb-4">By Source</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={sourceData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 3: Status Bar + Team Assignments */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-white border border-zinc-200 rounded-xl p-5">
          <h3 className="font-semibold text-zinc-900 mb-4">By Status</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {statusData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white border border-zinc-200 rounded-xl p-5">
          <h3 className="font-semibold text-zinc-900 mb-4">Team Assignments</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.teamAssignments} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 4: Weekly Trend */}
      <div className="bg-white border border-zinc-200 rounded-xl p-5 mb-8">
        <h3 className="font-semibold text-zinc-900 mb-4">New Opportunities (Last 12 Weeks)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" tick={{ fontSize: 12 }} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 4 }}
              name="New Opportunities"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Score Distribution */}
      <div className="bg-white border border-zinc-200 rounded-xl p-5">
        <h3 className="font-semibold text-zinc-900 mb-4">ICP Score Distribution</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data.scoreDistribution}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="range" tick={{ fontSize: 12 }} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
