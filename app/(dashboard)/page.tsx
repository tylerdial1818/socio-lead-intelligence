"use client";
import { useState } from "react";
import { MetricsRow } from "@/components/dashboard/metrics-row";
import { OpportunityCard } from "@/components/dashboard/opportunity-card";
import { TierSection } from "@/components/dashboard/tier-section";
import { OpportunityModal } from "@/components/opportunities/opportunity-modal";
import { SyncStatus } from "@/components/dashboard/sync-status";
import { MetricsSkeleton, OpportunityCardSkeleton } from "@/components/shared/loading-skeleton";
import { PageHeader } from "@/components/layout/header";
import { useStats } from "@/hooks/use-stats";
import { useOpportunities, useUpdateOpportunity } from "@/hooks/use-opportunities";
import { useTeam } from "@/hooks/use-team";
import { toast } from "sonner";
import type { Opportunity } from "@/types";

export default function DashboardPage() {
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: hotOpps, isLoading: hotLoading } = useOpportunities({ tier: "HOT", limit: 5, sortBy: "score", sortOrder: "desc" });
  const { data: warmOpps, isLoading: warmLoading } = useOpportunities({ tier: "WARM", limit: 5, sortBy: "score", sortOrder: "desc" });
  const { data: team } = useTeam();
  const updateOpportunity = useUpdateOpportunity();

  const handleOpenDetail = (opp: Opportunity) => {
    setSelectedOpportunity(opp);
    setModalOpen(true);
  };

  const handlePursue = (id: string) => {
    updateOpportunity.mutate(
      { id, status: "PURSUING" },
      { onSuccess: () => toast.success("Marked as pursuing") }
    );
  };

  const handlePass = (id: string) => {
    updateOpportunity.mutate(
      { id, status: "PASSED" },
      { onSuccess: () => toast.success("Marked as passed") }
    );
  };

  const handleAssign = (oppId: string, memberId: string) => {
    updateOpportunity.mutate(
      { id: oppId, assignedToId: memberId },
      { onSuccess: () => toast.success("Assigned successfully") }
    );
  };

  const handleSaveNotes = (id: string, notes: string) => {
    updateOpportunity.mutate(
      { id, notes },
      { onSuccess: () => toast.success("Notes saved") }
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <PageHeader title="Dashboard" />
        {stats && <SyncStatus lastSyncAt={stats.lastSyncAt} />}
      </div>

      {statsLoading ? <MetricsSkeleton /> : stats && <MetricsRow stats={stats} />}

      {/* HOT Opportunities */}
      <TierSection title="HOT Opportunities" count={hotOpps?.total} tier="HOT">
        {hotLoading ? (
          <>
            <OpportunityCardSkeleton />
            <OpportunityCardSkeleton />
          </>
        ) : (
          hotOpps?.data.map((opp) => (
            <OpportunityCard
              key={opp.id}
              opportunity={opp}
              variant="expanded"
              onOpenDetail={() => handleOpenDetail(opp)}
              onPursue={() => handlePursue(opp.id)}
              onPass={() => handlePass(opp.id)}
              onAssign={(memberId) => handleAssign(opp.id, memberId)}
              teamMembers={team || []}
            />
          ))
        )}
      </TierSection>

      {/* WARM Opportunities */}
      <TierSection title="WARM Opportunities" count={warmOpps?.total} tier="WARM">
        {warmLoading ? (
          <OpportunityCardSkeleton />
        ) : (
          <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
            {warmOpps?.data.map((opp) => (
              <OpportunityCard
                key={opp.id}
                opportunity={opp}
                variant="compact"
                onOpenDetail={() => handleOpenDetail(opp)}
                onPursue={() => handlePursue(opp.id)}
                onPass={() => handlePass(opp.id)}
                onAssign={(memberId) => handleAssign(opp.id, memberId)}
                teamMembers={team || []}
              />
            ))}
          </div>
        )}
      </TierSection>

      {/* Detail Modal */}
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
