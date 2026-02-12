"use client";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  source: string;
  onSourceChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
}

export function FilterBar({ search, onSearchChange, source, onSourceChange, status, onStatusChange }: FilterBarProps) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <Input
          placeholder="Search opportunities..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
      <Select value={source} onValueChange={onSourceChange}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Source" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Sources</SelectItem>
          <SelectItem value="UTAH_BONFIRE">Utah Bonfire</SelectItem>
          <SelectItem value="STATE_BONFIRE">State Bonfire</SelectItem>
          <SelectItem value="SAM_GOV">SAM.gov</SelectItem>
          <SelectItem value="WORLD_BANK">World Bank</SelectItem>
          <SelectItem value="UNDP">UNDP</SelectItem>
          <SelectItem value="UNGM">UNGM</SelectItem>
          <SelectItem value="BIDNET">BidNet</SelectItem>
        </SelectContent>
      </Select>
      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger className="w-36">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="NEW">New</SelectItem>
          <SelectItem value="REVIEWING">Reviewing</SelectItem>
          <SelectItem value="PURSUING">Pursuing</SelectItem>
          <SelectItem value="PASSED">Passed</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
