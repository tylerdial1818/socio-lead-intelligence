import { BarChart3 } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/layout/header";

export default function AnalyticsPage() {
  return (
    <div>
      <PageHeader title="Analytics" description="Metrics and trends" />
      <EmptyState
        icon={<BarChart3 className="w-12 h-12" />}
        title="Analytics Coming Soon"
        description="Pipeline metrics and trend analysis will be available here."
      />
    </div>
  );
}
