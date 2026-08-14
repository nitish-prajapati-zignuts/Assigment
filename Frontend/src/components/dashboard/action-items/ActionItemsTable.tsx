"use client";

import { useState } from "react";
import { ActionItem } from "@/types/meeting";
import { ActionItemWithContext } from "./types";
import { getPriorityBadgeClass } from "./utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  User,
  Calendar,
  Edit,
  Trash2,
  Loader2,
  FileSpreadsheet,
  X,
  CheckCircle2,
  Clock,
  AlertOctagon,
} from "lucide-react";
import { exportActionItemsToCSV } from "@/lib/exportUtils";
import { triggerTaskCompletionConfetti } from "@/lib/confetti";
import { EmptyActionItemsIllustration } from "@/components/ui/illustrations";
import { toast } from "sonner";

interface ActionItemsTableProps {
  isLoading: boolean;
  isFetching?: boolean;
  displayItems: ActionItemWithContext[];
  updatingItemId: string | null;
  onStatusChange: (id: string, newStatus: ActionItem["status"]) => void;
  onEdit: (item: ActionItemWithContext) => void;
  onDelete: (item: ActionItemWithContext) => void;
  onBulkStatusChange?: (ids: string[], newStatus: ActionItem["status"]) => void;
  onBulkDelete?: (ids: string[]) => void;
}

export function ActionItemsTable({
  isLoading,
  displayItems,
  updatingItemId,
  onStatusChange,
  onEdit,
  onDelete,
  onBulkStatusChange,
  onBulkDelete,
}: ActionItemsTableProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const BADGE_COLORS = [
    "bg-indigo-50 text-indigo-700 border-indigo-200/80 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800/80",
    "bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/80",
    "bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/80",
    "bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800/80",
    "bg-purple-50 text-purple-700 border-purple-200/80 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800/80",
    "bg-cyan-50 text-cyan-700 border-cyan-200/80 dark:bg-cyan-950/50 dark:text-cyan-300 dark:border-cyan-800/80",
  ];

  function getRandomBadgeColor() {
    return BADGE_COLORS[Math.floor(Math.random() * BADGE_COLORS.length)];
  }

  const isAllSelected = displayItems.length > 0 && displayItems.every((item) => selectedIds.includes(item.id));

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(displayItems.map((item) => item.id));
    }
  };

  const handleToggleSelectRow = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const handleBulkStatus = (newStatus: ActionItem["status"]) => {
    if (selectedIds.length === 0) return;
    if (onBulkStatusChange) {
      onBulkStatusChange(selectedIds, newStatus);
    } else {
      selectedIds.forEach((id) => onStatusChange(id, newStatus));
    }

    if (newStatus === "Completed") {
      triggerTaskCompletionConfetti();
      toast.success(`Marked ${selectedIds.length} task(s) as Completed! 🎉`);
    } else {
      toast.success(`Updated status for ${selectedIds.length} item(s)`);
    }

    setSelectedIds([]);
  };

  const handleBulkExport = () => {
    const selectedItems = displayItems.filter((i) => selectedIds.includes(i.id));
    exportActionItemsToCSV(selectedItems);
    toast.success(`Exported ${selectedItems.length} item(s) to CSV`);
  };

  const handleBulkDeleteAction = () => {
    if (selectedIds.length === 0) return;
    if (onBulkDelete) {
      onBulkDelete(selectedIds);
    } else {
      selectedIds.forEach((id) => {
        const item = displayItems.find((i) => i.id === id);
        if (item) onDelete(item);
      });
    }
    toast.error(`Deleted ${selectedIds.length} action item(s)`);
    setSelectedIds([]);
  };

  return (
    <div className="space-y-3">
      {/* Floating Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between p-3 rounded-2xl bg-indigo-600 text-white shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold px-2.5 py-1 bg-white/20 rounded-lg backdrop-blur-md">
              {selectedIds.length} Selected
            </span>
            <span className="text-xs hidden sm:inline text-indigo-100 font-medium">
              Perform bulk status update, CSV export, or batch deletion.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleBulkStatus("Completed")}
              className="h-8 text-xs bg-emerald-500 hover:bg-emerald-600 text-white border-0 gap-1"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Complete</span>
            </Button>

            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleBulkStatus("In Progress")}
              className="h-8 text-xs bg-blue-500 hover:bg-blue-600 text-white border-0 gap-1"
            >
              <Clock className="h-3.5 w-3.5" />
              <span>In Progress</span>
            </Button>

            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleBulkStatus("Blocked")}
              className="h-8 text-xs bg-red-500 hover:bg-red-600 text-white border-0 gap-1"
            >
              <AlertOctagon className="h-3.5 w-3.5" />
              <span>Block</span>
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={handleBulkExport}
              className="h-8 text-xs bg-white/10 hover:bg-white/20 text-white border-white/20 gap-1"
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Export CSV</span>
            </Button>

            <Button size="sm" variant="destructive" onClick={handleBulkDeleteAction} className="h-8 text-xs gap-1">
              <Trash2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Delete</span>
            </Button>

            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="p-1 rounded-lg hover:bg-white/20 transition-colors ml-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Action Items Table */}
      <div className="hidden md:block bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 overflow-x-auto shadow-sm">
        <Table className="w-full max-w-8xl">
          <TableHeader>
            <TableRow className="border-b border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30 hover:bg-transparent">
              <TableHead className="w-10 pl-4 py-3.5">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={handleToggleSelectAll}
                  className="rounded border-zinc-300 dark:border-zinc-700 text-indigo-600 focus:ring-indigo-500 h-4 w-4 cursor-pointer"
                />
              </TableHead>
              <TableHead className="w-[20%] font-semibold text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider py-3.5">
                Task Description
              </TableHead>
              {/* <TableHead className="w-[15%] font-semibold text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider py-3.5">
                Meeting Context
              </TableHead> */}
              <TableHead className="w-[14%] font-semibold text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider py-3.5">
                Owner
              </TableHead>
              <TableHead className="w-[15%] font-semibold text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider py-3.5">
                Due Date
              </TableHead>
              <TableHead className="w-[10%] font-semibold text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider py-3.5">
                Priority
              </TableHead>
              <TableHead className="w-[11%] font-semibold text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider py-3.5">
                Status
              </TableHead>
              <TableHead className="text-right w-[5%] font-semibold text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider pr-6 py-3.5">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <TableRow key={idx} className="border-b border-zinc-100 dark:border-zinc-800/50">
                  <TableCell className="pl-4 py-4">
                    <Skeleton className="h-4 w-4 rounded" />
                  </TableCell>
                  <TableCell className="py-4">
                    <Skeleton className="h-4 w-60 rounded-md" />
                  </TableCell>
                  <TableCell className="py-4">
                    <Skeleton className="h-4 w-28 rounded-md" />
                  </TableCell>
                  <TableCell className="py-4">
                    <Skeleton className="h-4 w-24 rounded-md" />
                  </TableCell>
                  <TableCell className="py-4">
                    <Skeleton className="h-4 w-24 rounded-md" />
                  </TableCell>
                  <TableCell className="py-4">
                    <Skeleton className="h-4 w-16 rounded-md" />
                  </TableCell>
                  <TableCell className="py-4">
                    <Skeleton className="h-6 w-24 rounded-md" />
                  </TableCell>
                  <TableCell className="pr-6 py-4 text-right">
                    <Skeleton className="h-6 w-16 rounded-md ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : displayItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-16 text-center text-zinc-500 dark:text-zinc-400">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <EmptyActionItemsIllustration className="w-24 h-24 text-zinc-400" />
                    <div>
                      <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">No action items match the active filters.</p>
                      <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">Try clearing search parameters or adjusting active filters.</p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              displayItems.map((item) => {
                const isSelected = selectedIds.includes(item.id);
                return (
                  <TableRow
                    key={item.id}
                    className={`border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50/80 dark:hover:bg-zinc-800/50 transition-colors ${isSelected ? "bg-indigo-50/50 dark:bg-indigo-950/30" : ""
                      }`}
                  >
                    <TableCell className="pl-4 py-3.5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelectRow(item.id)}
                        className="rounded border-zinc-300 dark:border-zinc-700 text-indigo-600 focus:ring-indigo-500 h-4 w-4 cursor-pointer"
                      />
                    </TableCell>
                    <TableCell className="py-3.5 font-medium text-xs text-zinc-900 dark:text-zinc-100">
                      <div className="flex flex-col gap-1.5">
                        <span className="truncate font-medium text-zinc-900 dark:text-zinc-100">{item.task}</span>
                        {item.meetingTitle && (
                          <Badge
                            variant="outline"
                            className={`w-fit text-[10px] font-normal px-2 py-0.5 border ${getRandomBadgeColor()}`}
                          >
                            {item.meetingTitle}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    {/* <TableCell className="py-3.5 text-xs text-zinc-500 truncate max-w-[140px]">
                      {item.meetingTitle}
                    </TableCell> */}
                    <TableCell className="py-3.5 text-xs text-zinc-600 dark:text-zinc-400">
                      <div className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-zinc-400" />
                        <span>{item.owner}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3.5 text-xs text-zinc-600 dark:text-zinc-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                        <span>{item.dueDate}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3.5 text-xs">
                      <Badge variant="outline" className={getPriorityBadgeClass(item.priority)}>
                        {item.priority}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3.5 text-xs">
                      <Select
                        value={item.status}
                        onValueChange={(val) => onStatusChange(item.id, val as ActionItem["status"])}
                        disabled={updatingItemId === item.id}
                      >
                        <SelectTrigger className="h-7 text-xs bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 w-28">
                          {updatingItemId === item.id ? (
                            <Loader2 className="h-3 w-3 animate-spin text-indigo-500 mx-auto" />
                          ) : (
                            <SelectValue />
                          )}
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Open">Open</SelectItem>
                          <SelectItem value="In Progress">In Progress</SelectItem>
                          <SelectItem value="Blocked">Blocked</SelectItem>
                          <SelectItem value="Completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="pr-6 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => onEdit(item)}
                          className="h-7 w-7 text-zinc-500 hover:text-indigo-600"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => onDelete(item)}
                          className="h-7 w-7 text-zinc-500 hover:text-red-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
