"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, AlertCircle, ArrowRight } from "lucide-react";
import { DashboardMetrics } from "./types";

interface DashboardIndicatorsGridProps {
  metrics: DashboardMetrics;
}

export function DashboardIndicatorsGrid({ metrics }: DashboardIndicatorsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Saved Transcripts Indicator */}
      {/* <Card className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xs">
        <CardHeader className="flex flex-row items-start justify-between pb-2">
          <div className="space-y-1">
            <CardTitle className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Transcripts Saved & Processed
            </CardTitle>
            <CardDescription className="text-xs text-zinc-500 dark:text-zinc-400">
              Transcripts ready for AI summary and action extraction
            </CardDescription>
          </div>
          <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
            <FileText className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent className="flex items-center justify-between pt-2">
          <div className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">{metrics.savedTranscripts}</div>
          <Link href="/dashboard/meetings">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs font-semibold flex items-center gap-1.5 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl"
            >
              View Meetings <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardContent>
      </Card> */}

      {/* Blocked Action Items Indicator */}
      {/* <Card className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xs">
        <CardHeader className="flex flex-row items-start justify-between pb-2">
          <div className="space-y-1">
            <CardTitle className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Blocked Action Items</CardTitle>
            <CardDescription className="text-xs text-zinc-500 dark:text-zinc-400">
              Tasks flagged with roadblocks or dependencies
            </CardDescription>
          </div>
          <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
            <AlertCircle className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent className="flex items-center justify-between pt-2">
          <div className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">{metrics.blockedActionItems}</div>
          <Link href="/dashboard/action-items">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs font-semibold gap-1.5 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl"
            >
              Manage Tasks <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardContent>
      </Card> */}
    </div>
  );
}
