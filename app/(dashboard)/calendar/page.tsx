import { Calendar } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/layout/header";

export default function CalendarPage() {
  return (
    <div>
      <PageHeader title="Calendar" description="Deadline-focused view of opportunities" />
      <EmptyState
        icon={<Calendar className="w-12 h-12" />}
        title="Calendar View Coming Soon"
        description="A deadline-focused view of your opportunities will be available here."
      />
    </div>
  );
}
