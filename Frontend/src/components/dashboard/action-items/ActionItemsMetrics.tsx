"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckSquare, Clock, AlertCircle, AlertTriangle, Loader2 } from "lucide-react";
import { ActionItemMetrics } from "./types";

interface ActionItemsMetricsProps {
  metrics: ActionItemMetrics;
  isLoading: boolean;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

export function ActionItemsMetricsCards({ metrics, isLoading }: ActionItemsMetricsProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {/* Total Action Items */}
      <motion.div variants={cardVariants} whileHover={{ y: -4, transition: { duration: 0.2 } }}>
        <Card className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md transition-all duration-300 hover:shadow-md hover:border-purple-500/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Total Action Items
            </CardTitle>
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <CheckSquare className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center gap-2 text-zinc-400 py-1">
                <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
                <span className="text-xs font-medium">Updating...</span>
              </div>
            ) : (
              <div className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                {metrics.total}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* In Progress Tasks */}
      <motion.div variants={cardVariants} whileHover={{ y: -4, transition: { duration: 0.2 } }}>
        <Card className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md transition-all duration-300 hover:shadow-md hover:border-blue-500/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              In Progress Tasks
            </CardTitle>
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Clock className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center gap-2 text-blue-400 py-1">
                <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                <span className="text-xs font-medium">Updating...</span>
              </div>
            ) : (
              <div className="text-3xl font-extrabold tracking-tight text-blue-600 dark:text-blue-400">
                {metrics.inProgress}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Blocked Tasks */}
      <motion.div variants={cardVariants} whileHover={{ y: -4, transition: { duration: 0.2 } }}>
        <Card className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md transition-all duration-300 hover:shadow-md hover:border-rose-500/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Blocked Tasks
            </CardTitle>
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500">
              <AlertCircle className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center gap-2 text-rose-400 py-1">
                <Loader2 className="h-6 w-6 animate-spin text-rose-500" />
                <span className="text-xs font-medium">Updating...</span>
              </div>
            ) : (
              <div className="text-3xl font-extrabold tracking-tight text-rose-600 dark:text-rose-400">
                {metrics.blocked}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Overdue Tasks */}
      <motion.div variants={cardVariants} whileHover={{ y: -4, transition: { duration: 0.2 } }}>
        <Card
          className={`rounded-2xl border backdrop-blur-md transition-all duration-300 hover:shadow-md ${
            metrics.overdue > 0
              ? "border-red-200 dark:border-red-900/50 bg-red-50/40 dark:bg-red-950/20"
              : "border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/70 hover:border-zinc-300 dark:hover:border-zinc-700"
          }`}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
              Overdue Tasks
            </CardTitle>
            <div className="p-2.5 rounded-xl bg-red-500/10 text-red-500">
              <AlertTriangle className="h-5 w-5 animate-pulse" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center gap-2 text-red-400 py-1">
                <Loader2 className="h-6 w-6 animate-spin text-red-500" />
                <span className="text-xs font-medium">Updating...</span>
              </div>
            ) : (
              <div className="text-3xl font-extrabold tracking-tight text-red-600 dark:text-red-400">
                {metrics.overdue}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
