"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, AlertCircle, ArrowRight } from "lucide-react";
import { DashboardMetrics } from "./types";

interface DashboardIndicatorsGridProps {
  metrics: DashboardMetrics;
}

export function DashboardIndicatorsGrid({ metrics }: DashboardIndicatorsGridProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="grid grid-cols-1 md:grid-cols-2 gap-4"
    >
      {/* Saved Transcripts Indicator */}
      <motion.div whileHover={{ y: -3, transition: { duration: 0.2 } }}>
        <Card className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md shadow-xs transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-start justify-between pb-2">
            <div className="space-y-1">
              <CardTitle className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Transcripts Saved & Processed
              </CardTitle>
              <CardDescription className="text-xs text-zinc-500 dark:text-zinc-400">
                Transcripts ready for AI summary and action extraction
              </CardDescription>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <FileText className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="flex items-center justify-between pt-2">
            <div className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
              {metrics.savedTranscripts}
            </div>
            <Link href="/dashboard/meetings">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs font-semibold flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-xl"
              >
                View Meetings <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </motion.div>

      {/* Blocked Action Items Indicator */}
      <motion.div whileHover={{ y: -3, transition: { duration: 0.2 } }}>
        <Card className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md shadow-xs transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-start justify-between pb-2">
            <div className="space-y-1">
              <CardTitle className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Blocked Action Items
              </CardTitle>
              <CardDescription className="text-xs text-zinc-500 dark:text-zinc-400">
                Tasks flagged with roadblocks or dependencies
              </CardDescription>
            </div>
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500">
              <AlertCircle className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="flex items-center justify-between pt-2">
            <div className="text-3xl font-extrabold text-rose-600 dark:text-rose-400">
              {metrics.blockedActionItems}
            </div>
            <Link href="/dashboard/action-items">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs font-semibold gap-1.5 text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl"
              >
                Manage Tasks <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

