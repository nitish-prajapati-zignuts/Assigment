"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, CheckSquare, Clock, CheckCircle2, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardMetrics } from "./types";

interface DashboardMetricsGridProps {
  metrics: DashboardMetrics;
  isLoading: boolean;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

export function DashboardMetricsGrid({ metrics, isLoading }: DashboardMetricsGridProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4"
    >
      {/* 1. Total Meetings */}
      <motion.div variants={cardVariants} whileHover={{ y: -4, transition: { duration: 0.2 } }}>
        <Card className="rounded-2xl border border-indigo-200/40 dark:border-indigo-900/30 metric-card-indigo accent-bar-indigo backdrop-blur-sm shadow-xs hover:shadow-elevated hover:border-indigo-300/50 dark:hover:border-indigo-800/40 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Total Meetings
            </CardTitle>
            <div className="p-2.5 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/15 backdrop-blur-sm text-indigo-600 dark:text-indigo-400 ring-1 ring-indigo-500/10">
              <Calendar className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20 rounded-lg my-1" />
            ) : (
              <div className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
                {metrics.totalMeetings}
              </div>
            )}
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1.5 font-medium">Scheduled & recorded</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* 2. Total Action Items */}
      <motion.div variants={cardVariants} whileHover={{ y: -4, transition: { duration: 0.2 } }}>
        <Card className="rounded-2xl border border-purple-200/40 dark:border-purple-900/30 metric-card-purple accent-bar-purple backdrop-blur-sm shadow-xs hover:shadow-elevated hover:border-purple-300/50 dark:hover:border-purple-800/40 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Total Action Items
            </CardTitle>
            <div className="p-2.5 rounded-xl bg-purple-500/10 dark:bg-purple-500/15 backdrop-blur-sm text-purple-600 dark:text-purple-400 ring-1 ring-purple-500/10">
              <CheckSquare className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20 rounded-lg my-1" />
            ) : (
              <div className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
                {metrics.totalActionItems}
              </div>
            )}
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1.5 font-medium">Across all meetings</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* 3. Open Action Items */}
      <motion.div variants={cardVariants} whileHover={{ y: -4, transition: { duration: 0.2 } }}>
        <Card className="rounded-2xl border border-amber-200/40 dark:border-amber-900/30 metric-card-amber accent-bar-amber backdrop-blur-sm shadow-xs hover:shadow-elevated hover:border-amber-300/50 dark:hover:border-amber-800/40 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Open Action Items
            </CardTitle>
            <div className="p-2.5 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 backdrop-blur-sm text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/10">
              <Clock className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20 rounded-lg my-1" />
            ) : (
              <div className="text-3xl font-extrabold tracking-tight text-amber-600 dark:text-amber-400">
                {metrics.openActionItems}
              </div>
            )}
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1.5 font-medium">Pending resolution</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* 4. Completed Action Items */}
      <motion.div variants={cardVariants} whileHover={{ y: -4, transition: { duration: 0.2 } }}>
        <Card className="rounded-2xl border border-emerald-200/40 dark:border-emerald-900/30 metric-card-emerald accent-bar-emerald backdrop-blur-sm shadow-xs hover:shadow-elevated hover:border-emerald-300/50 dark:hover:border-emerald-800/40 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Completed Items
            </CardTitle>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/15 backdrop-blur-sm text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/10">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20 rounded-lg my-1" />
            ) : (
              <div className="text-3xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400">
                {metrics.completedActionItems}
              </div>
            )}
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1.5 font-medium">Resolved tasks</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* 5. Overdue Action Items */}
      <motion.div variants={cardVariants} whileHover={{ y: -4, transition: { duration: 0.2 } }}>
        <Card
          className={`rounded-2xl border backdrop-blur-sm transition-all duration-300 shadow-xs hover:shadow-elevated accent-bar-red ${
            metrics.overdueActionItems > 0
              ? "border-red-200/50 dark:border-red-900/40 metric-card-red"
              : "border-zinc-200/60 dark:border-zinc-800/60 bg-white/50 dark:bg-zinc-900/50 hover:border-zinc-300 dark:hover:border-zinc-700"
          }`}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
              Overdue Items
            </CardTitle>
            <div className="p-2.5 rounded-xl bg-red-500/10 dark:bg-red-500/15 backdrop-blur-sm text-red-500 ring-1 ring-red-500/10">
              <AlertTriangle className="h-5 w-5 animate-pulse" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20 rounded-lg my-1" />
            ) : (
              <div className="text-3xl font-extrabold tracking-tight text-red-600 dark:text-red-400">
                {metrics.overdueActionItems}
              </div>
            )}
            <p className="text-[11px] text-red-500/90 font-semibold mt-1.5">Requires immediate action</p>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
