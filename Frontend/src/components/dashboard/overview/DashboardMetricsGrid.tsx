import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, CheckSquare, Clock, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { DashboardMetrics } from "./types";

interface DashboardMetricsGridProps {
  metrics: DashboardMetrics;
  isLoading: boolean;
}

export function DashboardMetricsGrid({ metrics, isLoading }: DashboardMetricsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {/* 1. Total Meetings */}
      <Card className="rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm transition-all duration-200 hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Total Meetings
          </CardTitle>
          <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800/80">
            <Calendar className="h-5 w-5 text-zinc-600 dark:text-zinc-300" />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Loader2 className="h-7 w-7 animate-spin text-zinc-400 my-1" />
          ) : (
            <div className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              {metrics.totalMeetings}
            </div>
          )}
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
            Scheduled & recorded
          </p>
        </CardContent>
      </Card>

      {/* 2. Total Action Items */}
      <Card className="rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm transition-all duration-200 hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Total Action Items
          </CardTitle>
          <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800/80">
            <CheckSquare className="h-5 w-5 text-zinc-600 dark:text-zinc-300" />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Loader2 className="h-7 w-7 animate-spin text-zinc-400 my-1" />
          ) : (
            <div className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              {metrics.totalActionItems}
            </div>
          )}
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
            Across all meetings
          </p>
        </CardContent>
      </Card>

      {/* 3. Open Action Items */}
      <Card className="rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm transition-all duration-200 hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Open Action Items
          </CardTitle>
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Clock className="h-5 w-5" />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Loader2 className="h-7 w-7 animate-spin text-zinc-400 my-1" />
          ) : (
            <div className="text-3xl font-bold tracking-tight text-amber-600 dark:text-amber-400">
              {metrics.openActionItems}
            </div>
          )}
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
            Pending resolution
          </p>
        </CardContent>
      </Card>

      {/* 4. Completed Action Items */}
      <Card className="rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm transition-all duration-200 hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Completed Items
          </CardTitle>
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Loader2 className="h-7 w-7 animate-spin text-zinc-400 my-1" />
          ) : (
            <div className="text-3xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
              {metrics.completedActionItems}
            </div>
          )}
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
            Resolved tasks
          </p>
        </CardContent>
      </Card>

      {/* 5. Overdue Action Items */}
      <Card
        className={`rounded-xl border transition-all duration-200 hover:shadow-md ${
          metrics.overdueActionItems > 0
            ? "border-red-200 dark:border-red-900/50 bg-red-50/30 dark:bg-red-950/10"
            : "border-zinc-200/80 dark:border-zinc-800/80 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm hover:border-zinc-300 dark:hover:border-zinc-700"
        }`}
      >
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-red-600 dark:text-red-400">
            Overdue Items
          </CardTitle>
          <div className="p-2 rounded-lg bg-red-500/10 text-red-500">
            <AlertTriangle className="h-5 w-5 animate-pulse" />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Loader2 className="h-7 w-7 animate-spin text-zinc-400 my-1" />
          ) : (
            <div className="text-3xl font-bold tracking-tight text-red-600 dark:text-red-400">
              {metrics.overdueActionItems}
            </div>
          )}
          <p className="text-[11px] text-red-500/90 font-medium mt-1">
            Requires immediate action
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
