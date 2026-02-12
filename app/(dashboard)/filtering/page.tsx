"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/header";
import { KeywordTable } from "@/components/keywords/keyword-table";
import { AddKeywordDialog } from "@/components/keywords/add-keyword-dialog";
import { KeywordDetailModal } from "@/components/keywords/keyword-detail-modal";
import { ScoringWeights } from "@/components/filtering/scoring-weights";
import { Skeleton } from "@/components/shared/loading-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useKeywords,
  useCreateKeyword,
  useUpdateKeyword,
  useKeywordCategories,
} from "@/hooks/use-keywords";
import { toast } from "sonner";
import { Plus, Search, Tag } from "lucide-react";
import type { Keyword, KeywordFormData, KeywordType } from "@/types";

export default function FilteringPage() {
  const [topTab, setTopTab] = useState("keywords");

  // Keyword state
  const [activeKeywordTab, setActiveKeywordTab] = useState<KeywordType>("INCLUDE");
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingKeyword, setEditingKeyword] = useState<Keyword | null>(null);

  const [detailOpen, setDetailOpen] = useState(false);
  const [viewingKeyword, setViewingKeyword] = useState<Keyword | null>(null);

  const { data, isLoading } = useKeywords({
    type: activeKeywordTab,
    tier: tierFilter !== "all" ? tierFilter : undefined,
    category: categoryFilter !== "all" ? categoryFilter : undefined,
    isActive:
      statusFilter === "active"
        ? true
        : statusFilter === "paused"
          ? false
          : undefined,
    search: search || undefined,
  });

  const { data: categories } = useKeywordCategories();
  const createKeyword = useCreateKeyword();
  const updateKeyword = useUpdateKeyword();

  const includeCount =
    (data?.includeCounts.active ?? 0) + (data?.includeCounts.paused ?? 0);
  const excludeCount =
    (data?.excludeCounts.active ?? 0) + (data?.excludeCounts.paused ?? 0);

  const handleAdd = () => {
    setEditingKeyword(null);
    setDialogOpen(true);
  };

  const handleEdit = (keyword: Keyword) => {
    setEditingKeyword(keyword);
    setDialogOpen(true);
  };

  const handleView = (keyword: Keyword) => {
    setViewingKeyword(keyword);
    setDetailOpen(true);
  };

  const handleSubmit = async (formData: KeywordFormData) => {
    try {
      if (editingKeyword) {
        await updateKeyword.mutateAsync({ id: editingKeyword.id, ...formData });
        toast.success("Keyword updated");
      } else {
        await createKeyword.mutateAsync(formData);
        toast.success("Keyword added");
      }
      setDialogOpen(false);
      setEditingKeyword(null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      toast.error(message);
    }
  };

  const handleToggleStatus = async (id: string, isActive: boolean) => {
    try {
      await updateKeyword.mutateAsync({ id, isActive });
      toast.success(isActive ? "Keyword activated" : "Keyword paused");
    } catch {
      toast.error("Failed to update keyword status");
    }
  };

  const handleDetailEdit = (keyword: Keyword) => {
    setDetailOpen(false);
    setViewingKeyword(null);
    handleEdit(keyword);
  };

  return (
    <div>
      <PageHeader
        title="Filtering"
        description="Configure keywords and scoring weights that control how opportunities are matched and ranked."
        action={
          topTab === "keywords" ? (
            <Button onClick={handleAdd}>
              <Plus className="w-4 h-4 mr-2" />
              Add Keyword
            </Button>
          ) : undefined
        }
      />

      {/* Top-level tabs: Keywords vs Scoring Weights */}
      <Tabs value={topTab} onValueChange={setTopTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="keywords">Keywords</TabsTrigger>
          <TabsTrigger value="scoring">Scoring Weights</TabsTrigger>
        </TabsList>

        {/* Keywords Tab Content */}
        <TabsContent value="keywords" className="mt-6">
          {/* Include/Exclude sub-tabs */}
          <Tabs
            value={activeKeywordTab}
            onValueChange={(v) => setActiveKeywordTab(v as KeywordType)}
            className="mb-6"
          >
            <TabsList>
              <TabsTrigger value="INCLUDE">
                Include ({includeCount})
              </TabsTrigger>
              <TabsTrigger value="EXCLUDE">
                Exclude ({excludeCount})
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Filters */}
          <div className="flex items-center gap-3 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <Input
                placeholder="Search keywords..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={tierFilter} onValueChange={setTierFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                <SelectItem value="HIGH">HIGH</SelectItem>
                <SelectItem value="MEDIUM">MEDIUM</SelectItem>
                <SelectItem value="LOW">LOW</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {(categories ?? []).map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Keyword Content */}
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : data?.data.length === 0 ? (
            <EmptyState
              icon={<Tag className="w-12 h-12" />}
              title="No keywords found"
              description="Add keywords to start matching opportunities, or adjust your filters."
              action={
                <Button onClick={handleAdd}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Keyword
                </Button>
              }
            />
          ) : (
            <KeywordTable
              keywords={data?.data ?? []}
              onEdit={handleEdit}
              onView={handleView}
              onToggleStatus={handleToggleStatus}
            />
          )}
        </TabsContent>

        {/* Scoring Weights Tab Content */}
        <TabsContent value="scoring" className="mt-6">
          <ScoringWeights />
        </TabsContent>
      </Tabs>

      {/* Keyword Dialogs (always mounted) */}
      <AddKeywordDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingKeyword(null);
        }}
        onSubmit={handleSubmit}
        existingKeyword={editingKeyword}
        categories={categories ?? []}
      />

      <KeywordDetailModal
        open={detailOpen}
        onOpenChange={(open) => {
          setDetailOpen(open);
          if (!open) setViewingKeyword(null);
        }}
        keyword={viewingKeyword}
        onEdit={handleDetailEdit}
        onToggleStatus={handleToggleStatus}
      />
    </div>
  );
}
