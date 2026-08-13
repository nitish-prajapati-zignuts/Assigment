"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ActionItem } from "@/types/meeting";
import { ActionItemWithContext } from "./types";
import { getPriorityBadgeClass } from "./utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Circle,
  User,
  Calendar,
  Edit,
  Trash2,
  Loader2,
  GripVertical,
} from "lucide-react";

interface ActionItemsKanbanProps {
  isLoading: boolean;
  displayItems: ActionItemWithContext[];
  updatingItemId: string | null;
  onStatusChange: (id: string, newStatus: ActionItem["status"]) => void;
  onEdit: (item: ActionItemWithContext) => void;
  onDelete: (item: ActionItemWithContext) => void;
}

const COLUMNS: {
  id: ActionItem["status"];
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  colorClass: string;
  badgeClass: string;
}[] = [
  {
    id: "Open",
    title: "Open Tasks",
    icon: Circle,
    colorClass: "border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30",
    badgeClass: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  },
  {
    id: "In Progress",
    title: "In Progress",
    icon: Clock,
    colorClass: "border-blue-200/80 dark:border-blue-900/40 bg-blue-50/20 dark:bg-blue-950/10",
    badgeClass: "bg-blue-50 text-blue-600 dark:bg-blue-950/80 dark:text-blue-300",
  },
  {
    id: "Blocked",
    title: "Blocked",
    icon: AlertCircle,
    colorClass: "border-rose-200/80 dark:border-rose-900/40 bg-rose-50/20 dark:bg-rose-950/10",
    badgeClass: "bg-rose-50 text-rose-600 dark:bg-rose-950/80 dark:text-rose-300",
  },
  {
    id: "Completed",
    title: "Completed",
    icon: CheckCircle2,
    colorClass: "border-emerald-200/80 dark:border-emerald-900/40 bg-emerald-50/20 dark:bg-emerald-950/10",
    badgeClass: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-300",
  },
];

export function ActionItemsKanban({
  isLoading,
  displayItems,
  updatingItemId,
  onStatusChange,
  onEdit,
  onDelete,
}: ActionItemsKanbanProps) {
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<ActionItem["status"] | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
    setDraggedItemId(id);
  };

  const handleDragOver = (e: React.DragEvent, columnId: ActionItem["status"]) => {
    e.preventDefault();
    setDragOverColumn(columnId);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, targetColumn: ActionItem["status"]) => {
    e.preventDefault();
    setDragOverColumn(null);
    const itemId = e.dataTransfer.getData("text/plain") || draggedItemId;

    if (itemId) {
      const item = displayItems.find((i) => i.id === itemId);
      if (item && item.status !== targetColumn) {
        onStatusChange(itemId, targetColumn);
      }
    }
    setDraggedItemId(null);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white/80 dark:bg-zinc-900/80 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-zinc-500 min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500 mb-3" />
        <span className="text-sm font-semibold">Loading Kanban Board...</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      {COLUMNS.map((col) => {
        const Icon = col.icon;
        const columnItems = displayItems.filter(
          (item) => item.status === col.id || (col.id === "Open" && item.status === ("Pending" as any))
        );

        const isOver = dragOverColumn === col.id;

        return (
          <div
            key={col.id}
            onDragOver={(e) => handleDragOver(e, col.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, col.id)}
            className={`flex flex-col rounded-3xl border ${col.colorClass} p-4 min-h-[500px] transition-all duration-200 ${
              isOver ? "ring-2 ring-indigo-500/50 bg-indigo-50/30 dark:bg-indigo-950/20 scale-[1.01]" : ""
            }`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-200/60 dark:border-zinc-800/60">
              <div className="flex items-center gap-2">
                <Icon className="h-4.5 w-4.5 text-zinc-600 dark:text-zinc-400" />
                <h3 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100">
                  {col.title}
                </h3>
              </div>
              <Badge variant="secondary" className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${col.badgeClass}`}>
                {columnItems.length}
              </Badge>
            </div>

            {/* Column Cards Drop Area */}
            <div className="flex-1 space-y-3.5 overflow-y-auto pr-1">
              <AnimatePresence>
                {columnItems.length === 0 ? (
                  <div className="h-32 border-2 border-dashed border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl flex items-center justify-center text-xs text-zinc-400 font-medium">
                    Drop items here
                  </div>
                ) : (
                  columnItems.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      draggable
                      onDragStart={(e) => handleDragStart(e as any, item.id)}
                      className={`group relative p-4 rounded-2xl border bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md shadow-xs hover:shadow-md transition-all cursor-grab active:cursor-grabbing ${
                        item.isOverdue
                          ? "border-red-200 dark:border-red-900/50 bg-red-50/30 dark:bg-red-950/10"
                          : "border-zinc-200/80 dark:border-zinc-800/80 hover:border-indigo-500/40"
                      } ${updatingItemId === item.id ? "opacity-50 pointer-events-none" : ""}`}
                    >
                      {/* Drag Handle Indicator */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-1 text-zinc-400">
                          <GripVertical className="h-4 w-4 opacity-40 group-hover:opacity-100 transition-opacity" />
                          <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 truncate max-w-[150px]">
                            {item.meetingTitle}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit(item)}
                            className="h-6 w-6 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-md"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDelete(item)}
                            className="h-6 w-6 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      {/* Task Text */}
                      <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 leading-snug mb-3">
                        {item.task}
                      </p>

                      {/* Footer Metadata */}
                      <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800/60 text-[11px]">
                        <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400 font-medium">
                          <User className="h-3 w-3 text-zinc-400" />
                          <span className="truncate max-w-[90px]">{item.owner}</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <Badge
                            variant="outline"
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${getPriorityBadgeClass(
                              item.priority
                            )}`}
                          >
                            {item.priority}
                          </Badge>
                          {item.dueDate && (
                            <span className={`flex items-center gap-1 font-semibold ${item.isOverdue ? "text-red-500" : "text-zinc-500"}`}>
                              <Calendar className="h-3 w-3" />
                              {item.dueDate}
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        );
      })}
    </div>
  );
}
