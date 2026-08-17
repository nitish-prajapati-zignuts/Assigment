"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, User, RefreshCw } from "lucide-react";
import { getEnv } from "@/lib/config";

export interface OwnerPerformance {
  owner: string;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  blockedTasks: number;
  completionRate: number;
  badgeTitle: string;
  badgeColor: string;
}

export function ActionItemsLeaderboard() {
  const {
    data: leaderboardData = [],
    isLoading,
    isFetching,
  } = useQuery<OwnerPerformance[]>({
    queryKey: ["actionItemsLeaderboard"],
    queryFn: async () => {
      const res = await api.get("/action-items/leaderboard");
      return res.data || [];
    },
    refetchInterval: 10000, // Real-time poll every 10s
  });

  return (
    <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 p-4 space-y-3.5 shadow-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-500" />
          <div>
            <h3 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              Team Velocity & Execution Leaderboard
              {isFetching && <RefreshCw className="h-3 w-3 animate-spin text-indigo-500" />}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Real-time API performance aggregation & execution champions.
            </p>
          </div>
        </div>
        <Badge
          variant="outline"
          className="text-xs bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200"
        >
          {isLoading ? "Loading..." : `${leaderboardData.length} Contributor(s)`}
        </Badge>
      </div>

      {/* Leaderboard Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-32 rounded-md" />
                <Skeleton className="h-5 w-20 rounded-md" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          ))
        ) : leaderboardData.length === 0 ? (
          <div className="col-span-full py-6 text-center text-xs text-zinc-400">
            No contributor activity recorded yet.
          </div>
        ) : (
          leaderboardData.slice(0, 6).map((perf, index) => (
            <div
              key={perf.owner}
              className="p-3.5 rounded-xl border border-zinc-200/70 dark:border-zinc-800/70 bg-zinc-50/50 dark:bg-zinc-900/40 space-y-2 relative overflow-hidden"
            >
              {index === 0 && (
                <div className="absolute -top-1 -right-1 p-2 bg-amber-500/10 rounded-bl-xl text-amber-500 font-extrabold text-xs">
                  #1
                </div>
              )}

              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 truncate">
                  <div className="p-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 shrink-0">
                    <User className="h-3.5 w-3.5" />
                  </div>
                  <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100 truncate">{perf.owner}</span>
                </div>
                <Badge variant="outline" className={`text-[10px] ${perf.badgeColor} shrink-0`}>
                  {perf.badgeTitle}
                </Badge>
              </div>

              {/* Velocity Progress Bar */}
              <div className="space-y-1 pt-1">
                <div className="flex items-center justify-between text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
                  <span>Velocity</span>
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {perf.completionRate}% ({perf.completedTasks}/{perf.totalTasks})
                  </span>
                </div>
                <div className="h-2 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(perf.completionRate, 5)}%` }}
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
