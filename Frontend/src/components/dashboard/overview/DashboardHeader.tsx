"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Plus, ListTodo, Search, Command } from "lucide-react";

import { DashboardBannerIllustration } from "@/components/ui/illustrations";

export function DashboardHeader() {
  const triggerCommandPalette = () => {
    window.dispatchEvent(new CustomEvent("open-command-palette"));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-2xl border border-indigo-100/50 dark:border-zinc-800/80 bg-gradient-to-br from-indigo-50/40 via-purple-50/20 to-transparent dark:from-indigo-950/20 dark:via-purple-950/10 dark:to-transparent p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs"
    >
      <div className="flex flex-col md:flex-row items-center gap-6 w-full">
        <div className="flex-1 text-center md:text-left space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            Dashboard Overview
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md">
            Real-time analytics, action tracker status, and recently created meetings.
          </p>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 pt-3">
            <Link href="/dashboard/action-items">
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

            <Link href="/dashboard/meetings">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl shadow-md shadow-indigo-500/20 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold text-xs sm:text-sm">
                  <Plus className="h-4 w-4" />
                  Manage Meetings
                </Button>
              </motion.div>
            </Link>
          </div>
        </div>
        <div className="shrink-0 hidden md:block select-none">
          <DashboardBannerIllustration className="w-48 h-36 drop-shadow-lg" />
        </div>
      </div>
    </motion.div>
  );
}
