"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Loader2, Download, FileSpreadsheet } from "lucide-react";

interface ActionItemsHeaderProps {
  isSyncing: boolean;
  onAddClick: () => void;
  onExportCSV?: () => void;
  onExportMarkdown?: () => void;
}

export function ActionItemsHeader({ isSyncing, onAddClick, onExportCSV, onExportMarkdown }: ActionItemsHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-zinc-200/80 dark:border-zinc-800/80 pb-5 gap-4">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            Action Tracker
          </h1>
          {isSyncing && (
            <Badge
              variant="outline"
              className="flex items-center gap-1.5 text-[11px] font-semibold border-amber-300 text-amber-700 bg-amber-50/50 dark:border-amber-800 dark:text-amber-300 dark:bg-amber-950/30 rounded-lg"
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

      <div className="flex flex-wrap items-center gap-2.5">
        {onExportCSV && (
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="outline"
              size="sm"
              onClick={onExportCSV}
              className="flex items-center gap-1.5 text-xs font-semibold rounded-xl border-zinc-200/80 dark:border-zinc-800/80 shadow-xs hover:bg-zinc-100 dark:hover:bg-zinc-900"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              Export CSV
            </Button>
          </motion.div>
        )}

        {onExportMarkdown && (
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="outline"
              size="sm"
              onClick={onExportMarkdown}
              className="flex items-center gap-1.5 text-xs font-semibold rounded-xl border-zinc-200/80 dark:border-zinc-800/80 shadow-xs hover:bg-zinc-100 dark:hover:bg-zinc-900"
            >
              <Download className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              Export Markdown
            </Button>
          </motion.div>
        )}

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={onAddClick}
            className="flex items-center gap-2 rounded-xl shadow-md shadow-indigo-500/20 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold text-xs sm:text-sm"
          >
            <Plus className="h-4.5 w-4.5" />
            Add Action Item
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
