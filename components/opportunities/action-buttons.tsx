"use client";
import { Check, X, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { TeamMember } from "@/types";

interface ActionButtonsProps {
  onPursue: () => void;
  onPass: () => void;
  onAssign: (memberId: string) => void;
  teamMembers: TeamMember[];
  currentStatus?: string;
  assignedToId?: string | null;
}

export function ActionButtons({ onPursue, onPass, onAssign, teamMembers, currentStatus, assignedToId }: ActionButtonsProps) {
  return (
    <div className="flex gap-3" onClick={(e) => e.stopPropagation()}>
      <Button
        onClick={onPursue}
        size="sm"
        className={currentStatus === "PURSUING" ? "bg-green-600 hover:bg-green-700" : ""}
      >
        <Check className="w-4 h-4 mr-1" />
        {currentStatus === "PURSUING" ? "Pursuing" : "Pursue"}
      </Button>
      <Button
        variant="outline"
        onClick={onPass}
        size="sm"
        className={currentStatus === "PASSED" ? "bg-zinc-100" : ""}
      >
        <X className="w-4 h-4 mr-1" />
        {currentStatus === "PASSED" ? "Passed" : "Pass"}
      </Button>
      <Select onValueChange={onAssign} value={assignedToId || undefined}>
        <SelectTrigger className="w-40 h-9">
          <UserPlus className="w-4 h-4 mr-1" />
          <SelectValue placeholder="Assign to..." />
        </SelectTrigger>
        <SelectContent>
          {teamMembers.map(member => (
            <SelectItem key={member.id} value={member.id}>
              {member.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
