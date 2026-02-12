"use client";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FilterBar } from "@/components/opportunities/filter-bar";
import { OpportunityCard } from "@/components/dashboard/opportunity-card";
import { OpportunityModal } from "@/components/opportunities/opportunity-modal";
import { PageHeader } from "@/components/layout/header";
import { EmptyState } from "@/components/shared/empty-state";
import { OpportunityCardSkeleton } from "@/components/shared/loading-skeleton";
import { useOpportunities, useUpdateOpportunity } from "@/hooks/use-opportunities";
import { useTeam } from "@/hooks/use-team";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Flame } from "lucide-react";
import { toast } from "sonner";
import type { Opportunity } from "@/types";

export default function OpportunitiesPage() {
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [tier, setTier] = useState("all");
  const [search, setSearch] = useState("");
  const [source, setSource] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(0);
  const limit = 10;

  const { data, isLoading } = useOpportunities({
    tier: tier !== "all" ? tier : undefined,
    search: search || undefined,
    source: source !== "all" ? source : undefined,
    status: status !== "all" ? status : undefined,
    limit,
    offset: page * limit,
    sortBy: "score",
    sortOrder: "desc",
  });
  const { data: team } = useTeam();
  const updateOpportunity = useUpdateOpportunity();

  const totalPages = data ? Math.ceil(data.total / limit) : 0;

  const handlePursue = (id: string) => {
    updateOpportunity.mutate({ id, status: "PURSUING" }, { onSuccess: () => toast.success("Marked as pursuing") });
  };
  const handlePass = (id: string) => {
    updateOpportunity.mutate({ id, status: "PASSED" }, { onSuccess: () => toast.success("Marked as passed") });
  };
  const handleAssign = (oppId: string, memberId: string) => {
    updateOpportunity.mutate({ id: oppId, assignedToId: memberId }, { onSuccess: () => toast.success("Assigned successfully") });
  };
  const handleSaveNotes = (id: string, notes: string) => {
    updateOpportunity.mutate({ id, notes }, { onSuccess: () => toast.success("Notes saved") });
  };

  return (
    <div>
      <PageHeader title="Opportunities" description="Browse and filter all opportunities" />

      <Tabs value={tier} onValueChange={(v) => { setTier(v); setPage(0); }} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All {data ? `(${data.total})` : ""}</TabsTrigger>
          <TabsTrigger value="HOT">HOT</TabsTrigger>
          <TabsTrigger value="WARM">WARM</TabsTrigger>
          <TabsTrigger value="COOL">COOL</TabsTrigger>
        </TabsList>
      </Tabs>

      <FilterBar
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(0); }}
        source={source}
        onSourceChange={(v) => { setSource(v); setPage(0); }}
        status={status}
        onStatusChange={(v) => { setStatus(v); setPage(0); }}
      />

      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <OpportunityCardSkeleton key={i} />)
        ) : data?.data.length === 0 ? (
          <EmptyState
            icon={<Flame className="w-12 h-12" />}
            title="No opportunities found"
            description="Try adjusting your filters or check back later for new opportunities."
          />
        ) : (
          data?.data.map((opp) => (
            <OpportunityCard
              key={opp.id}
              opportunity={opp}
              variant="expanded"
              onOpenDetail={() => { setSelectedOpportunity(opp); setModalOpen(true); }}
              onPursue={() => handlePursue(opp.id)}
              onPass={() => handlePass(opp.id)}
              onAssign={(memberId) => handleAssign(opp.id, memberId)}
              teamMembers={team || []}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-zinc-500">
            Showing {page * limit + 1}-{Math.min((page + 1) * limit, data?.total || 0)} of {data?.total}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={page === 0}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm text-zinc-600">Page {page + 1} of {totalPages}</span>
            <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      <OpportunityModal
        opportunity={selectedOpportunity}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onPursue={() => selectedOpportunity && handlePursue(selectedOpportunity.id)}
        onPass={() => selectedOpportunity && handlePass(selectedOpportunity.id)}
        onAssign={(memberId) => selectedOpportunity && handleAssign(selectedOpportunity.id, memberId)}
        onSaveNotes={(notes) => selectedOpportunity && handleSaveNotes(selectedOpportunity.id, notes)}
        teamMembers={team || []}
      />
    </div>
  );
}
