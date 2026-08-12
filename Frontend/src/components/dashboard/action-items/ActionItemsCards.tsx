import { ActionItem } from "@/types/meeting";
import { ActionItemWithContext } from "./types";
import { getPriorityBadgeClass } from "./utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, Calendar, Edit, Trash2, Loader2 } from "lucide-react";

interface ActionItemsCardsProps {
  isLoading: boolean;
  isFetching: boolean;
  displayItems: ActionItemWithContext[];
  updatingItemId: string | null;
  onStatusChange: (id: string, newStatus: ActionItem["status"]) => void;
  onEdit: (item: ActionItemWithContext) => void;
  onDelete: (item: ActionItemWithContext) => void;
}

export function ActionItemsCards({
  isLoading,
  isFetching,
  displayItems,
  updatingItemId,
  onStatusChange,
  onEdit,
  onDelete,
}: ActionItemsCardsProps) {
  return (
    <div className="md:hidden space-y-3">
      {isLoading || isFetching ? (
        <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-500">
          <Loader2 className="h-6 w-6 animate-spin text-amber-500 mb-2" />
          <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Loading fresh action items...
          </span>
        </div>
      ) : displayItems.length === 0 ? (
        <div className="p-6 text-center bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-500">
          <p className="text-sm font-medium">No action items found matching your filters.</p>
          <p className="text-xs text-zinc-400 mt-1">Try clearing search parameters or overdue filter.</p>
        </div>
      ) : (
        displayItems.map((item) => (
          <div
            key={item.id}
            className={`p-4 rounded-xl border bg-white dark:bg-zinc-900 shadow-sm space-y-3 transition-colors ${
              item.isOverdue
                ? "border-red-200 dark:border-red-900/50 bg-red-50/20 dark:bg-red-950/10"
                : "border-zinc-200/80 dark:border-zinc-800/80"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-snug">
                {item.task}
              </p>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(item)}
                  className="h-7 w-7 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                >
                  <Edit className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(item)}
                  className="h-7 w-7 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              Meeting: <span className="text-zinc-800 dark:text-zinc-200">{item.meetingTitle}</span>
            </p>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-xs">
              <span className="flex items-center gap-1 text-zinc-600 dark:text-zinc-400">
                <User className="h-3.5 w-3.5 text-zinc-400" />
                {item.owner}
              </span>
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                <span className="text-zinc-600 dark:text-zinc-400">{item.dueDate}</span>
                {item.isOverdue && (
                  <Badge variant="destructive" className="text-[9px] px-1 py-0 font-bold ml-1">
                    OVERDUE
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-1">
              <Badge
                variant="outline"
                className={`text-xs font-medium rounded-md px-2 py-0.5 ${getPriorityBadgeClass(item.priority)}`}
              >
                Priority: {item.priority}
              </Badge>

              <Select
                value={item.status}
                disabled={updatingItemId === item.id}
                onValueChange={(val) =>
                  val && onStatusChange(item.id, val as ActionItem["status"])
                }
              >
                <SelectTrigger className="h-7 text-xs w-28 border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 flex items-center justify-between">
                  {updatingItemId === item.id ? (
                    <div className="flex items-center gap-1.5 text-amber-500 font-medium">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span className="text-[11px]">Updating...</span>
                    </div>
                  ) : (
                    <SelectValue />
                  )}
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Blocked">Blocked</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
