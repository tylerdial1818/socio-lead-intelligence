import { Settings } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/layout/header";

export default function SettingsPage() {
  return (
    <div>
      <PageHeader title="Settings" description="Configuration" />
      <EmptyState
        icon={<Settings className="w-12 h-12" />}
        title="Settings Coming Soon"
        description="Application configuration and preferences will be available here."
      />
    </div>
  );
}
