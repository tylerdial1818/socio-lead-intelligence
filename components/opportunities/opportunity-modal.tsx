"use client";
import { ExternalLink, Mail, Phone } from "lucide-react";
import { format } from "date-fns";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ScoreBadge } from "./score-badge";
import { UtahBadge } from "./utah-badge";
import { AIBrief } from "./ai-brief";
import { ScoreBreakdown } from "./score-breakdown";
import { ActionButtons } from "./action-buttons";
import { KeywordBadge } from "@/components/keywords/keyword-badge";
import { formatCurrency, formatSource } from "@/lib/utils";
import type { Opportunity, TeamMember } from "@/types";
import { useState } from "react";

interface OpportunityModalProps {
  opportunity: Opportunity | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPursue: () => void;
  onPass: () => void;
  onAssign: (memberId: string) => void;
  onSaveNotes: (notes: string) => void;
  teamMembers: TeamMember[];
}

export function OpportunityModal({
  opportunity, open, onOpenChange, onPursue, onPass, onAssign, onSaveNotes, teamMembers,
}: OpportunityModalProps) {
  const [notes, setNotes] = useState(opportunity?.notes || "");
  const [showFullDescription, setShowFullDescription] = useState(false);

  if (!opportunity) return null;

  const daysUntilDeadline = opportunity.deadline
    ? Math.ceil((new Date(opportunity.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-zinc-900 font-heading flex items-center gap-2 mb-1">
              {opportunity.isUtah && <UtahBadge />}
              {opportunity.title}
            </h2>
            <p className="text-zinc-600">{opportunity.issuingOrg}</p>
            <div className="flex items-center gap-3 mt-2 text-sm text-zinc-500">
              <span>Source: {formatSource(opportunity.source)}</span>
              {opportunity.postedDate && (
                <>
                  <span>|</span>
                  <span>Posted {format(new Date(opportunity.postedDate), "MMM d, yyyy")}</span>
                </>
              )}
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-zinc-50 rounded-xl p-4 text-center">
              <ScoreBadge score={opportunity.icpScore!} tier={opportunity.tier!} size="lg" />
            </div>
            <div className="bg-zinc-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-zinc-900 font-mono">
                {opportunity.estimatedValue ? formatCurrency(opportunity.estimatedValue) : "TBD"}
              </p>
              <p className="text-xs text-zinc-500 mt-1">Est. Value</p>
            </div>
            <div className="bg-zinc-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-zinc-900 font-mono">
                {daysUntilDeadline !== null ? `${daysUntilDeadline}` : "\u2014"}
              </p>
              <p className="text-xs text-zinc-500 mt-1">days until due</p>
            </div>
          </div>

          {/* AI Brief */}
          {opportunity.aiBrief && (
            <AIBrief
              brief={opportunity.aiBrief}
              generatedAt={opportunity.aiGeneratedAt}
            />
          )}

          {/* Score Breakdown */}
          {opportunity.scoreBreakdown && (
            <div className="mb-6">
              <ScoreBreakdown
                breakdown={opportunity.scoreBreakdown}
                finalScore={opportunity.icpScore!}
                isUtah={opportunity.isUtah}
              />
            </div>
          )}

          {/* Description */}
          {opportunity.description && (
            <div className="mb-6">
              <h4 className="font-semibold mb-2">Description</h4>
              <div className="bg-white border border-zinc-200 rounded-xl p-4">
                <p className="text-sm text-zinc-700 whitespace-pre-wrap">
                  {showFullDescription
                    ? opportunity.description
                    : opportunity.description.slice(0, 300)}
                  {!showFullDescription && opportunity.description.length > 300 && "..."}
                </p>
                {opportunity.description.length > 300 && (
                  <button
                    className="text-sm text-zinc-500 hover:text-zinc-900 mt-2 font-medium"
                    onClick={() => setShowFullDescription(!showFullDescription)}
                  >
                    {showFullDescription ? "Show less" : "Show more"}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Matched Keywords */}
          {opportunity.matchedKeywords && opportunity.matchedKeywords.length > 0 && (
            <div className="mb-6">
              <h4 className="font-semibold mb-2">Matched Keywords</h4>
              <div className="flex flex-wrap gap-2">
                {opportunity.matchedKeywords.map((mk) =>
                  mk.keyword ? (
                    <KeywordBadge
                      key={mk.id}
                      term={mk.keyword.term}
                      type={mk.keyword.type}
                      matchLocation={mk.matchLocation}
                    />
                  ) : null
                )}
              </div>
            </div>
          )}

          {/* Contact & Links */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {(opportunity.contactName || opportunity.contactEmail) && (
              <div className="bg-white border border-zinc-200 rounded-xl p-4">
                <h4 className="font-semibold mb-2 text-sm">Contact</h4>
                {opportunity.contactName && (
                  <p className="text-sm text-zinc-700">{opportunity.contactName}</p>
                )}
                {opportunity.contactEmail && (
                  <a href={`mailto:${opportunity.contactEmail}`} className="text-sm text-zinc-500 hover:text-zinc-900 flex items-center gap-1 mt-1">
                    <Mail className="w-3 h-3" /> {opportunity.contactEmail}
                  </a>
                )}
                {opportunity.contactPhone && (
                  <p className="text-sm text-zinc-500 flex items-center gap-1 mt-1">
                    <Phone className="w-3 h-3" /> {opportunity.contactPhone}
                  </p>
                )}
              </div>
            )}
            {opportunity.sourceUrl && (
              <div className="bg-white border border-zinc-200 rounded-xl p-4">
                <h4 className="font-semibold mb-2 text-sm">Documents</h4>
                <a
                  href={opportunity.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-zinc-500 hover:text-zinc-900 flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" /> View on {formatSource(opportunity.source)}
                </a>
              </div>
            )}
          </div>

          <Separator className="my-6" />

          {/* Notes */}
          <div className="mb-6">
            <h4 className="font-semibold mb-2">Notes</h4>
            <Textarea
              placeholder="Add internal notes about this opportunity..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="resize-none"
            />
            {notes !== (opportunity.notes || "") && (
              <Button size="sm" className="mt-2" onClick={() => onSaveNotes(notes)}>
                Save Notes
              </Button>
            )}
          </div>

          {/* Actions */}
          <ActionButtons
            onPursue={onPursue}
            onPass={onPass}
            onAssign={onAssign}
            teamMembers={teamMembers}
            currentStatus={opportunity.status}
            assignedToId={opportunity.assignedToId}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
