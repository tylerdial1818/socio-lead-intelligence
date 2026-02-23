"use client";
import { useState, useMemo } from "react";
import { PageHeader } from "@/components/layout/header";
import { useOpportunities } from "@/hooks/use-opportunities";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Opportunity, Tier } from "@/types";

const TIER_DOT_COLORS: Record<Tier, string> = {
  HOT: "bg-red-500",
  WARM: "bg-amber-500",
  COOL: "bg-blue-500",
  COLD: "bg-zinc-400",
};

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function formatMonthYear(year: number, month: number): string {
  return new Date(year, month).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function dateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export default function CalendarPage() {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const { data, isLoading } = useOpportunities({ limit: 1000 });

  const { byDate, noDeadline } = useMemo(() => {
    const opportunities = data?.data || [];
    const map: Record<string, Opportunity[]> = {};
    const noDeadlineList: Opportunity[] = [];

    for (const opp of opportunities) {
      if (opp.deadline) {
        const d = new Date(opp.deadline);
        const key = dateKey(d);
        if (!map[key]) map[key] = [];
        map[key].push(opp);
      } else {
        noDeadlineList.push(opp);
      }
    }

    return { byDate: map, noDeadline: noDeadlineList };
  }, [data]);

  const goToPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedDate(null);
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedDate(null);
  };

  const goToToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setSelectedDate(null);
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const todayKey = dateKey(today);

  const calendarDays: Array<{ day: number; key: string } | null> = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    calendarDays.push({ day: d, key });
  }

  const selectedOpps = selectedDate ? byDate[selectedDate] || [] : [];

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Calendar" description="Deadline-focused view of opportunities" />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Calendar" description="Deadline-focused view of opportunities" />

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToPrevMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h2 className="text-lg font-semibold text-zinc-900 min-w-[200px] text-center">
            {formatMonthYear(currentYear, currentMonth)}
          </h2>
          <Button variant="outline" size="sm" onClick={goToNextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        <Button variant="outline" size="sm" onClick={goToToday}>
          Today
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden mb-6">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-zinc-200">
          {DAY_NAMES.map((day) => (
            <div key={day} className="p-3 text-center text-sm font-medium text-zinc-500 bg-zinc-50">
              {day}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {calendarDays.map((cell, i) => {
            if (!cell) {
              return <div key={`empty-${i}`} className="min-h-[90px] border-b border-r border-zinc-100 bg-zinc-50/50" />;
            }

            const opps = byDate[cell.key] || [];
            const isToday = cell.key === todayKey;
            const isSelected = cell.key === selectedDate;
            const tierCounts: Record<string, number> = {};
            for (const o of opps) {
              if (o.tier) tierCounts[o.tier] = (tierCounts[o.tier] || 0) + 1;
            }

            return (
              <button
                key={cell.key}
                className={cn(
                  "min-h-[90px] border-b border-r border-zinc-100 p-2 text-left transition-colors hover:bg-zinc-50",
                  isSelected && "bg-blue-50 hover:bg-blue-50",
                  isToday && "ring-2 ring-inset ring-blue-500"
                )}
                onClick={() => setSelectedDate(isSelected ? null : cell.key)}
              >
                <span className={cn(
                  "text-sm font-medium",
                  isToday ? "text-blue-600" : "text-zinc-700"
                )}>
                  {cell.day}
                </span>
                {opps.length > 0 && (
                  <div className="mt-1">
                    <span className="text-xs font-medium text-zinc-500">{opps.length} opp{opps.length !== 1 ? "s" : ""}</span>
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {Object.entries(tierCounts).map(([tier, count]) => (
                        <span
                          key={tier}
                          className={cn("w-2 h-2 rounded-full", TIER_DOT_COLORS[tier as Tier])}
                          title={`${count} ${tier}`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Date Detail */}
      {selectedDate && (
        <div className="bg-white border border-zinc-200 rounded-xl p-5 mb-6">
          <h3 className="font-semibold text-zinc-900 mb-3">
            Deadlines on {new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
          </h3>
          {selectedOpps.length === 0 ? (
            <p className="text-sm text-zinc-500">No deadlines on this date.</p>
          ) : (
            <div className="space-y-3">
              {selectedOpps.map((opp) => (
                <div key={opp.id} className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-900 truncate">{opp.title}</p>
                    <p className="text-xs text-zinc-500">{opp.issuingOrg}</p>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    {opp.tier && (
                      <span className={cn(
                        "px-2 py-0.5 rounded text-xs font-medium",
                        opp.tier === "HOT" && "bg-red-100 text-red-700",
                        opp.tier === "WARM" && "bg-amber-100 text-amber-700",
                        opp.tier === "COOL" && "bg-blue-100 text-blue-700",
                        opp.tier === "COLD" && "bg-zinc-100 text-zinc-600",
                      )}>
                        {opp.tier}
                      </span>
                    )}
                    {opp.icpScore !== null && (
                      <span className="text-sm font-mono text-zinc-600">{opp.icpScore}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* No Deadline Section */}
      {noDeadline.length > 0 && (
        <div className="bg-white border border-zinc-200 rounded-xl p-5">
          <h3 className="font-semibold text-zinc-900 mb-3">
            No Deadline ({noDeadline.length})
          </h3>
          <div className="space-y-2">
            {noDeadline.slice(0, 10).map((opp) => (
              <div key={opp.id} className="flex items-center justify-between p-2 bg-zinc-50 rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-900 truncate">{opp.title}</p>
                  <p className="text-xs text-zinc-500">{opp.issuingOrg}</p>
                </div>
                {opp.tier && (
                  <span className={cn(
                    "px-2 py-0.5 rounded text-xs font-medium ml-4",
                    opp.tier === "HOT" && "bg-red-100 text-red-700",
                    opp.tier === "WARM" && "bg-amber-100 text-amber-700",
                    opp.tier === "COOL" && "bg-blue-100 text-blue-700",
                    opp.tier === "COLD" && "bg-zinc-100 text-zinc-600",
                  )}>
                    {opp.tier}
                  </span>
                )}
              </div>
            ))}
            {noDeadline.length > 10 && (
              <p className="text-sm text-zinc-500 text-center pt-2">
                + {noDeadline.length - 10} more without deadlines
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
