"use client";

import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";

interface MeetingsTimelineItem {
  date: string;
  meetingsCount: number;
  transcriptsCount: number;
}

interface StatusItem {
  name: string;
  value: number;
}

interface PriorityItem {
  name: string;
  value: number;
}

interface DecisionCategoryItem {
  category: string;
  count: number;
}

export interface DashboardChartsData {
  meetingsTimeline?: MeetingsTimelineItem[];
  actionItemsStatusDistribution?: StatusItem[];
  actionItemsPriorityDistribution?: PriorityItem[];
  keyDecisionsBreakdown?: DecisionCategoryItem[];
}

interface DashboardChartsProps {
  data?: DashboardChartsData;
}

// Custom vibrant dark-mode friendly color palette
const STATUS_COLORS: Record<string, string> = {
  Completed: "#10b981", // Emerald 500
  "In Progress": "#3b82f6", // Blue 500
  Pending: "#f59e0b", // Amber 500
  Open: "#6366f1", // Indigo 500
  Blocked: "#ef4444", // Red 500
};

const PRIORITY_COLORS: Record<string, string> = {
  Urgent: "#dc2626", // Red 600
  High: "#f97316", // Orange 500
  Medium: "#eab308", // Yellow 500
  Low: "#84cc16", // Lime 500
};

const CATEGORY_COLORS = ["#8b5cf6", "#ec4899", "#06b6d4", "#10b981", "#f59e0b", "#6366f1"];

export default function AnalyticsCharts({ data }: DashboardChartsProps) {
  const timelineData = data?.meetingsTimeline || [];
  const statusData = data?.actionItemsStatusDistribution || [];
  const priorityData = data?.actionItemsPriorityDistribution || [];
  const decisionData = data?.keyDecisionsBreakdown || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 my-8">
      {/* 1. Meetings Activity Over Time (Area Chart) */}
      <div className="bg-white dark:bg-zinc-900/70 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <span>📈</span> Meeting Velocity & Transcripts
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Track meeting volume and transcript processing frequency over time.
          </p>
        </div>

        {timelineData.length > 0 ? (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMeetings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorTranscripts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#a1a1aa" />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="#a1a1aa" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(24, 24, 27, 0.9)",
                    borderColor: "#3f3f46",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
                <Area
                  type="monotone"
                  dataKey="meetingsCount"
                  name="Meetings"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorMeetings)"
                />
                <Area
                  type="monotone"
                  dataKey="transcriptsCount"
                  name="Transcripts"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorTranscripts)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-xs text-zinc-400">
            No meeting timeline data recorded yet.
          </div>
        )}
      </div>

      {/* 2. Action Items Status Breakdown (Donut Chart) */}
      <div className="bg-white dark:bg-zinc-900/70 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <span>🎯</span> Task Status Distribution
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Breakdown of action items across completion statuses.
          </p>
        </div>

        {statusData.length > 0 ? (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={STATUS_COLORS[entry.name] || CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(24, 24, 27, 0.9)",
                    borderColor: "#3f3f46",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-xs text-zinc-400">
            No action item status metrics available.
          </div>
        )}
      </div>

      {/* 3. Action Items Priority Breakdown (Bar Chart) */}
      <div className="bg-white dark:bg-zinc-900/70 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <span>⚡</span> Tasks by Priority Level
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Overview of tasks categorized by urgency and priority.
          </p>
        </div>

        {priorityData.some((p) => p.value > 0) ? (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#a1a1aa" />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="#a1a1aa" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(24, 24, 27, 0.9)",
                    borderColor: "#3f3f46",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="value" name="Task Count" radius={[6, 6, 0, 0]}>
                  {priorityData.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={PRIORITY_COLORS[entry.name] || "#6366f1"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-xs text-zinc-400">
            No action item priority data available.
          </div>
        )}
      </div>

      {/* 4. Key Decisions Category Breakdown (Horizontal Bar Chart) */}
      <div className="bg-white dark:bg-zinc-900/70 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <span>💡</span> Key Decisions by Category
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Distribution of AI-extracted meeting decision categories.
          </p>
        </div>

        {decisionData.length > 0 ? (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={decisionData}
                margin={{ top: 10, right: 20, left: 20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} stroke="#a1a1aa" />
                <YAxis dataKey="category" type="category" tick={{ fontSize: 11 }} stroke="#a1a1aa" width={100} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(24, 24, 27, 0.9)",
                    borderColor: "#3f3f46",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="count" name="Decisions" radius={[0, 6, 6, 0]}>
                  {decisionData.map((_, index) => (
                    <Cell key={`dec-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-xs text-zinc-400">
            No meeting key decision analytics recorded yet.
          </div>
        )}
      </div>
    </div>
  );
}
