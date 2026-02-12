"use client";
import { differenceInDays, format } from "date-fns";
import { ScoreBadge } from "@/components/opportunities/score-badge";
import { UtahBadge } from "@/components/opportunities/utah-badge";
import { ActionButtons } from "@/components/opportunities/action-buttons";
import { formatCurrency } from "@/lib/utils";
import { KeywordBadge } from "@/components/keywords/keyword-badge";
import type { Opportunity, TeamMember } from "@/types";

interface OpportunityCardProps {
  opportunity: Opportunity;
  variant: "expanded" | "compact";
  onOpenDetail: () => void;
  onPursue: () => void;
  onPass: () => void;
  onAssign: (memberId: string) => void;
  teamMembers: TeamMember[];
}

export function OpportunityCard({
  opportunity, variant, onOpenDetail, onPursue, onPass, onAssign, teamMembers
}: OpportunityCardProps) {
  const daysUntilDeadline = opportunity.deadline
    ? differenceInDays(new Date(opportunity.deadline), new Date())
    : null;

  if (variant === "compact") {
    return (
      <div
        className="flex items-center justify-between py-3 px-4 hover:bg-zinc-50 cursor-pointer border-b border-zinc-100 last:border-b-0 transition-colors"
        onClick={onOpenDetail}
      >
        <div className="flex items-center gap-3 min-w-0">
          {opportunity.isUtah && <UtahBadge />}
          <span className="font-medium truncate">{opportunity.title}</span>
          {opportunity.issuingOrg && (
            <span className="text-sm text-zinc-500 truncate hidden lg:inline">
              {opportunity.issuingOrg}
            </span>
          )}
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <ScoreBadge score={opportunity.icpScore!} tier={opportunity.tier!} size="sm" />
          {opportunity.estimatedValue && (
            <span className="text-sm text-zinc-500 w-16 text-right">
              {formatCurrency(opportunity.estimatedValue)}
            </span>
          )}
          {opportunity.deadline && (
            <span className="text-sm text-zinc-500 w-20 text-right">
              {format(new Date(opportunity.deadline), "MMM d")}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-white border border-zinc-200 rounded-xl p-6 hover:border-zinc-300 hover:shadow-md transition-all cursor-pointer"
      onClick={onOpenDetail}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-semibold text-lg text-zinc-900 flex items-center gap-2">
            {opportunity.isUtah && <UtahBadge />}
            {opportunity.title}
          </h3>
          <p className="text-zinc-600 mt-1">{opportunity.issuingOrg}</p>
        </div>
        <ScoreBadge score={opportunity.icpScore!} tier={opportunity.tier!} />
      </div>

      <div className="flex items-center gap-6 text-sm text-zinc-700 mb-4">
        {opportunity.estimatedValue && (
          <span className="font-medium">{formatCurrency(opportunity.estimatedValue)}</span>
        )}
        {opportunity.deadline && (
          <>
            <span>Due {format(new Date(opportunity.deadline), "MMM d")}</span>
            <span className="text-zinc-400">|</span>
            <span>{daysUntilDeadline} days left</span>
          </>
        )}
      </div>

      {/* Matched Keywords */}
      {opportunity.matchedKeywords && opportunity.matchedKeywords.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {opportunity.matchedKeywords.slice(0, 5).map((mk) =>
            mk.keyword ? (
              <KeywordBadge
                key={mk.id}
                term={mk.keyword.term}
                type={mk.keyword.type}
                matchLocation={mk.matchLocation}
              />
            ) : null
          )}
          {opportunity.matchedKeywords.length > 5 && (
            <span className="text-xs text-zinc-400 self-center">
              +{opportunity.matchedKeywords.length - 5} more
            </span>
          )}
        </div>
      )}

      <ActionButtons
        onPursue={onPursue}
        onPass={onPass}
        onAssign={onAssign}
        teamMembers={teamMembers}
        currentStatus={opportunity.status}
        assignedToId={opportunity.assignedToId}
      />
    </div>
  );
}
