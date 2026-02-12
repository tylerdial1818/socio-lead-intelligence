"use client";

import { Eye, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Keyword, KeywordTier } from "@/types";

interface KeywordTableProps {
  keywords: Keyword[];
  onEdit: (keyword: Keyword) => void;
  onView: (keyword: Keyword) => void;
  onToggleStatus: (id: string, isActive: boolean) => void;
}

const tierStyles: Record<KeywordTier, string> = {
  HIGH: "bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-100",
  MEDIUM: "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100",
  LOW: "bg-zinc-100 text-zinc-700 border-zinc-200 hover:bg-zinc-100",
};

export function KeywordTable({
  keywords,
  onEdit,
  onView,
  onToggleStatus,
}: KeywordTableProps) {
  return (
    <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-semibold">Keyword</TableHead>
            <TableHead className="font-semibold">Tier</TableHead>
            <TableHead className="font-semibold">Category</TableHead>
            <TableHead className="font-semibold text-right">Matches</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {keywords.map((keyword) => (
            <TableRow
              key={keyword.id}
              className={cn(!keyword.isActive && "opacity-50")}
            >
              <TableCell className="font-mono font-medium">
                {keyword.term}
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={cn("text-xs", tierStyles[keyword.tier])}
                >
                  {keyword.tier}
                </Badge>
              </TableCell>
              <TableCell className="text-zinc-500">
                {keyword.category ?? "--"}
              </TableCell>
              <TableCell className="font-mono text-right">
                {keyword.matchCount}
              </TableCell>
              <TableCell>
                <Switch
                  checked={keyword.isActive}
                  onCheckedChange={(checked) =>
                    onToggleStatus(keyword.id, checked)
                  }
                  aria-label={`Toggle ${keyword.term}`}
                />
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onView(keyword)}
                    aria-label={`View ${keyword.term}`}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(keyword)}
                    aria-label={`Edit ${keyword.term}`}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
