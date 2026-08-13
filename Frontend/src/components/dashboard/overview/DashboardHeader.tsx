"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Plus, ListTodo } from "lucide-react";

export function DashboardHeader() {
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
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
        <Link href="/dashboard/action-items" className="w-full sm:w-auto">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="outline"
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border-zinc-200 dark:border-zinc-800 shadow-xs hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-semibold"
            >
              <ListTodo className="h-4.5 w-4.5 text-zinc-500" />
              Action Tracker
            </Button>
          </motion.div>
        </Link>
        <Link href="/dashboard/meetings" className="w-full sm:w-auto">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl shadow-md shadow-indigo-500/20 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold">
              <Plus className="h-4.5 w-4.5" />
              Manage Meetings
            </Button>
          </motion.div>
        </Link>
      </div>
    </motion.div>
  );
}

