import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Loader2 } from "lucide-react";

interface ActionItemsHeaderProps {
  isSyncing: boolean;
  onAddClick: () => void;
}

export function ActionItemsHeader({ isSyncing, onAddClick }: ActionItemsHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-zinc-200 dark:border-zinc-800 pb-5 gap-4">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Action Tracker
          </h1>
          {isSyncing && (
            <Badge
              variant="outline"
              className="flex items-center gap-1 text-[11px] font-normal border-amber-300 text-amber-700 bg-amber-50/50 dark:border-amber-800 dark:text-amber-300 dark:bg-amber-950/30"
            >
              <Loader2 className="h-3 w-3 animate-spin text-amber-500" />
              <span>Syncing live API...</span>
            </Badge>
          )}
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Manage, filter, and track deliverables extracted across all meeting notes.
        </p>
      </div>

      <Button
        onClick={onAddClick}
        className="flex items-center gap-2 shadow-sm bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 font-medium"
      >
        <Plus className="h-5 w-5" />
        Add Action Item
      </Button>
    </div>
  );
}
