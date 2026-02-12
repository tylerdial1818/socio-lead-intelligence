import { RefreshCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface SyncStatusProps {
  lastSyncAt: string | null;
}

export function SyncStatus({ lastSyncAt }: SyncStatusProps) {
  return (
    <div className="flex items-center gap-2 text-sm text-zinc-500">
      <RefreshCw className="w-4 h-4" />
      <span>
        Last synced: {lastSyncAt ? formatDistanceToNow(new Date(lastSyncAt), { addSuffix: true }) : "Never"}
      </span>
    </div>
  );
}
