import { ActionItem } from "@/types/meeting";
import { ActionItemWithContext } from "./types";
import { getPriorityBadgeClass } from "./utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, Calendar, Edit, Trash2, Loader2 } from "lucide-react";

interface ActionItemsTableProps {
  isLoading: boolean;
  isFetching: boolean;
  displayItems: ActionItemWithContext[];
  updatingItemId: string | null;
  onStatusChange: (id: string, newStatus: ActionItem["status"]) => void;
  onEdit: (item: ActionItemWithContext) => void;
  onDelete: (item: ActionItemWithContext) => void;
}

export function ActionItemsTable({
  isLoading,
  isFetching,
  displayItems,
  updatingItemId,
  onStatusChange,
  onEdit,
  onDelete,
}: ActionItemsTableProps) {
  return (
    <div className="hidden md:block bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 overflow-x-auto shadow-sm">
      <Table className="w-full min-w-[900px]">
        <TableHeader>
          <TableRow className="border-b border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30 hover:bg-transparent">
            <TableHead className="w-[35%] min-w-[280px] font-semibold text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider pl-6 py-3.5">
              Task Description
            </TableHead>
            <TableHead className="w-[18%] min-w-[140px] font-semibold text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider py-3.5">
              Meeting Context
            </TableHead>
            <TableHead className="w-[13%] min-w-[120px] font-semibold text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider py-3.5">
              Owner
            </TableHead>
            <TableHead className="w-[14%] min-w-[130px] font-semibold text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider py-3.5">
              Due Date
            </TableHead>
            <TableHead className="w-[10%] min-w-[90px] font-semibold text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider py-3.5">
              Priority
            </TableHead>
            <TableHead className="w-[10%] min-w-[110px] font-semibold text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider py-3.5">
              Status
            </TableHead>
            <TableHead className="text-right min-w-[80px] font-semibold text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider pr-6 py-3.5">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading || isFetching ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-16">
                <div className="flex flex-col items-center justify-center gap-2 text-zinc-500">
                  <Loader2 className="h-7 w-7 animate-spin text-amber-500" />
                  <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    Loading fresh action items...
                  </span>
                </div>
              </TableCell>
            </TableRow>
          ) : displayItems.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-center py-12 text-zinc-500 dark:text-zinc-400"
              >
                <p className="text-sm font-medium">No action items found matching your filters.</p>
                <p className="text-xs text-zinc-400 mt-1">Try clearing search parameters or overdue filter.</p>
              </TableCell>
            </TableRow>
          ) : (
            displayItems.map((item) => (
              <TableRow
                key={item.id}
                className={`border-b border-zinc-100 dark:border-zinc-800/50 transition-colors ${
                  item.isOverdue
                    ? "bg-red-50/40 dark:bg-red-950/20 hover:bg-red-50/60 dark:hover:bg-red-950/30"
                    : "hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40"
                }`}
              >
                {/* Task Description */}
                <TableCell className="font-medium min-w-[280px] max-w-[380px] pl-6 py-3.5">
                  <div className="flex items-start gap-2.5">
                    <span className="h-2 w-2 rounded-full bg-zinc-400 dark:bg-zinc-500 mt-1.5 shrink-0" />
                    <span className="text-xs leading-relaxed text-zinc-900 dark:text-zinc-100 break-words whitespace-normal font-medium">
                      {item.task}
                    </span>
                  </div>
                </TableCell>

                {/* Meeting Context */}
                <TableCell className="text-xs text-zinc-500 dark:text-zinc-400 min-w-[140px] max-w-[180px] py-3.5">
                  <span className="truncate block font-medium" title={item.meetingTitle}>
                    {item.meetingTitle}
                  </span>
                </TableCell>

                {/* Owner */}
                <TableCell className="min-w-[120px] py-3.5">
                  <span className="flex items-center gap-1.5 text-xs text-zinc-700 dark:text-zinc-300 font-medium">
                    <User className="h-4.5 w-4.5 text-zinc-400 shrink-0" />
                    <span className="truncate">{item.owner}</span>
                  </span>
                </TableCell>

                {/* Due Date & Overdue Highlight */}
                <TableCell className="min-w-[130px] py-3.5">
                  <div className="flex flex-col gap-1">
                    <span className="flex items-center gap-1 text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                      <Calendar className="h-4.5 w-4.5 text-zinc-400 shrink-0" />
                      <span>{item.dueDate}</span>
                    </span>
                    {item.isOverdue && (
                      <Badge variant="destructive" className="text-[9px] px-1.5 py-0 w-fit font-bold rounded-sm">
                        OVERDUE
                      </Badge>
                    )}
                  </div>
                </TableCell>

                {/* Priority */}
                <TableCell className="min-w-[90px] py-3.5">
                  <Badge
                    variant="outline"
                    className={`text-xs font-medium rounded-md px-2 py-0.5 ${getPriorityBadgeClass(item.priority)}`}
                  >
                    {item.priority}
                  </Badge>
                </TableCell>

                {/* Status Dropdown */}
                <TableCell className="min-w-[110px] py-3.5">
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
                </TableCell>

                {/* Actions */}
                <TableCell className="text-right min-w-[80px] pr-6 py-3.5">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(item)}
                      className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-md"
                      title="Edit Action Item"
                    >
                      <Edit className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(item)}
                      className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md"
                      title="Delete Action Item"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
