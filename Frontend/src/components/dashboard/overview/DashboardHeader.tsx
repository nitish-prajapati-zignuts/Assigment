"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Plus, ListTodo, Search, Command } from "lucide-react";

import { NotificationDropdown } from "@/components/dashboard/NotificationDropdown";

export function DashboardHeader() {
  const triggerCommandPalette = () => {
    window.dispatchEvent(new CustomEvent("open-command-palette"));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-200/80 dark:border-zinc-800/80 pb-5"
    >
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          Dashboard Overview
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Real-time analytics, action tracker status, and recently created meetings.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
        <NotificationDropdown />

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            variant="outline"
            onClick={triggerCommandPalette}
            className="flex items-center gap-2 rounded-xl border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-900/80 shadow-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-600 dark:text-zinc-300"
          >
            <Search className="h-4 w-4 text-indigo-500" />
            <span className="hidden sm:inline">Search app...</span>
            <kbd className="flex items-center gap-0.5 px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded font-mono text-[10px]">
              <Command className="h-3 w-3" /> K
            </kbd>
          </Button>
        </motion.div>


        <Link href="/dashboard/action-items" className="w-full sm:w-auto">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="outline"
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border-zinc-200 dark:border-zinc-800 shadow-xs hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-xs font-semibold"
            >
              <ListTodo className="h-4 w-4 text-zinc-500" />
              Action Tracker
            </Button>
          </motion.div>
        </Link>

        <Link href="/dashboard/meetings" className="w-full sm:w-auto">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl shadow-md shadow-indigo-500/20 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold text-xs sm:text-sm">
              <Plus className="h-4 w-4" />
              Manage Meetings
            </Button>
          </motion.div>
        </Link>
      </div>
    </motion.div>
  );
}


