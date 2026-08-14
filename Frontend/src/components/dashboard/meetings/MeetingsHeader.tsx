"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Plus, FileSpreadsheet, GitCompareArrows } from "lucide-react";

interface MeetingsHeaderProps {
  onCreateClick: () => void;
  onExportCSV?: () => void;
  onCompareClick?: () => void;
}

export function MeetingsHeader({ onCreateClick, onExportCSV, onCompareClick }: MeetingsHeaderProps) {
  return (
    <div className="flex flex-col gap-4  sm:flex-row sm:items-center sm:justify-between border-b border-zinc-200/80 dark:border-zinc-800/80 pb-5">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          Meeting Management
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Create, search, view, edit, and organize all your team meetings.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        {onCompareClick && (
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="outline"
              size="sm"
              onClick={onCompareClick}
              className="flex items-center gap-1.5 text-xs font-semibold rounded-xl border-zinc-200/80 dark:border-zinc-800/80 shadow-xs hover:bg-zinc-100 dark:hover:bg-zinc-900"
            >
              <GitCompareArrows className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              Compare Meetings
            </Button>
          </motion.div>
        )}

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

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={onCreateClick}
            className="flex items-center gap-2 rounded-xl shadow-md shadow-indigo-500/20 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold text-xs sm:text-sm"
          >
            <Plus className="h-4.5 w-4.5" />
            Create Meeting
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
