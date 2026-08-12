import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckSquare, Clock, AlertCircle, AlertTriangle, Loader2 } from "lucide-react";
import { ActionItemMetrics } from "./types";

interface ActionItemsMetricsProps {
  metrics: ActionItemMetrics;
  isLoading: boolean;
}

export function ActionItemsMetricsCards({ metrics, isLoading }: ActionItemsMetricsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Action Items */}
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
            <div className="flex items-center gap-2 text-zinc-400 py-1">
              <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
              <span className="text-xs font-medium">Updating...</span>
            </div>
          ) : (
            <div className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              {metrics.total}
            </div>
          )}
        </CardContent>
      </Card>

      {/* In Progress Tasks */}
      <Card className="rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm transition-all duration-200 hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            In Progress Tasks
          </CardTitle>
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
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
            <div className="text-3xl font-bold tracking-tight text-blue-600 dark:text-blue-400">
              {metrics.inProgress}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Blocked Tasks */}
      <Card className="rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm transition-all duration-200 hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Blocked Tasks
          </CardTitle>
          <div className="p-2 rounded-lg bg-rose-500/10 text-rose-500">
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
            <div className="text-3xl font-bold tracking-tight text-rose-600 dark:text-rose-400">
              {metrics.blocked}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Overdue Tasks */}
      <Card
        className={`rounded-xl border transition-all duration-200 hover:shadow-md ${
          metrics.overdue > 0
            ? "border-red-200 dark:border-red-900/50 bg-red-50/30 dark:bg-red-950/10"
            : "border-zinc-200/80 dark:border-zinc-800/80 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm hover:border-zinc-300 dark:hover:border-zinc-700"
        }`}
      >
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-red-600 dark:text-red-400">
            Overdue Tasks
          </CardTitle>
          <div className="p-2 rounded-lg bg-red-500/10 text-red-500">
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
            <div className="text-3xl font-bold tracking-tight text-red-600 dark:text-red-400">
              {metrics.overdue}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
