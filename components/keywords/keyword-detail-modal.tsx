"use client";

import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { Keyword, KeywordTier, KeywordType } from "@/types";

interface KeywordDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  keyword: Keyword | null;
  onEdit: (keyword: Keyword) => void;
  onToggleStatus: (id: string, isActive: boolean) => void;
}

const tierStyles: Record<KeywordTier, string> = {
  HIGH: "bg-purple-100 text-purple-700 border-purple-200",
  MEDIUM: "bg-blue-100 text-blue-700 border-blue-200",
  LOW: "bg-zinc-100 text-zinc-700 border-zinc-200",
};

const typeStyles: Record<KeywordType, string> = {
  INCLUDE: "bg-emerald-100 text-emerald-700 border-emerald-200",
  EXCLUDE: "bg-red-100 text-red-700 border-red-200",
};

export function KeywordDetailModal({
  open,
  onOpenChange,
  keyword,
  onEdit,
  onToggleStatus,
}: KeywordDetailModalProps) {
  if (!keyword) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-mono text-lg">
            {keyword.term}
          </DialogTitle>
          <DialogDescription>
            Keyword details and matched opportunities.
          </DialogDescription>
        </DialogHeader>

        {/* Badges row */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className={cn("text-xs", typeStyles[keyword.type])}
          >
            {keyword.type}
          </Badge>
          <Badge
            variant="outline"
            className={cn("text-xs", tierStyles[keyword.tier])}
          >
            {keyword.tier}
          </Badge>
          <Badge
            variant="outline"
            className={cn(
              "text-xs",
              keyword.isActive
                ? "bg-green-100 text-green-700 border-green-200"
                : "bg-zinc-100 text-zinc-500 border-zinc-200"
            )}
          >
            {keyword.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>

        {/* Detail fields */}
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Category</span>
            <span className="font-medium">
              {keyword.category ?? "Uncategorized"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Matches</span>
            <span className="font-mono font-medium">{keyword.matchCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Created</span>
            <span className="font-medium">
              {format(new Date(keyword.createdAt), "MMM d, yyyy")}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Last Match</span>
            <span className="font-medium">
              {keyword.lastMatchAt
                ? format(new Date(keyword.lastMatchAt), "MMM d, yyyy")
                : "Never"}
            </span>
          </div>
        </div>

        {/* Matched opportunities placeholder */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Matched Opportunities
          </h4>
          <div className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-6 text-center">
            <p className="text-sm text-muted-foreground">
              {keyword.matchCount > 0
                ? `${keyword.matchCount} matched opportunities will appear here.`
                : "No matched opportunities yet."}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-end gap-2 pt-2">
          <Button
            variant="outline"
            onClick={() => onToggleStatus(keyword.id, !keyword.isActive)}
          >
            {keyword.isActive ? "Deactivate" : "Activate"}
          </Button>
          <Button onClick={() => onEdit(keyword)}>Edit Keyword</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
