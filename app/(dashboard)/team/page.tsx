"use client";
import { useState } from "react";
import { UserPlus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/header";
import { TeamTable } from "@/components/team/team-table";
import { MemberDialog } from "@/components/team/member-dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/shared/loading-skeleton";
import { useTeam, useCreateTeamMember, useUpdateTeamMember, useDeleteTeamMember } from "@/hooks/use-team";
import { toast } from "sonner";
import type { TeamMember } from "@/types";

export default function TeamPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [deletingMember, setDeletingMember] = useState<TeamMember | null>(null);

  const { data: members, isLoading } = useTeam();
  const createMember = useCreateTeamMember();
  const updateMember = useUpdateTeamMember();
  const deleteMember = useDeleteTeamMember();

  const handleAdd = () => {
    setEditingMember(null);
    setDialogOpen(true);
  };

  const handleEdit = (member: TeamMember) => {
    setEditingMember(member);
    setDialogOpen(true);
  };

  const handleSubmit = async (data: { name: string; email: string }) => {
    try {
      if (editingMember) {
        await updateMember.mutateAsync({ id: editingMember.id, ...data });
        toast.success("Team member updated");
      } else {
        await createMember.mutateAsync(data);
        toast.success("Team member added");
      }
      setDialogOpen(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      toast.error(message);
    }
  };

  const handleDelete = async () => {
    if (!deletingMember) return;
    try {
      await deleteMember.mutateAsync(deletingMember.id);
      toast.success("Team member removed");
      setDeletingMember(null);
    } catch {
      toast.error("Failed to delete team member");
    }
  };

  return (
    <div>
      <PageHeader
        title="Team Members"
        description="Manage your team to enable opportunity assignment."
        action={
          <Button onClick={handleAdd}>
            <UserPlus className="w-4 h-4 mr-2" />
            Add Team Member
          </Button>
        }
      />

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : members && members.length > 0 ? (
        <TeamTable
          members={members}
          onEdit={handleEdit}
          onDelete={(member) => setDeletingMember(member)}
        />
      ) : (
        <EmptyState
          icon={<Users className="w-12 h-12" />}
          title="No team members yet"
          description="Add team members to enable opportunity assignment."
          action={
            <Button onClick={handleAdd}>
              <UserPlus className="w-4 h-4 mr-2" />
              Add Team Member
            </Button>
          }
        />
      )}

      <MemberDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        member={editingMember}
        onSubmit={handleSubmit}
        isLoading={createMember.isPending || updateMember.isPending}
      />

      <ConfirmDialog
        open={!!deletingMember}
        onOpenChange={(open) => !open && setDeletingMember(null)}
        title="Delete Team Member"
        description={`Are you sure you want to remove ${deletingMember?.name}? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
}
