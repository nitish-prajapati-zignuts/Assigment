"use client";

import React, { useState, useEffect } from "react";
import { Pin, PinOff, GripVertical, RotateCcw, Maximize2, Minimize2 } from "lucide-react";
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  RadialBarChart,
  RadialBar,
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

const STATUS_COLORS: Record<string, string> = {
  Completed: "#10b981",
  "In Progress": "#3b82f6",
  Pending: "#f59e0b",
  Open: "#6366f1",
  Blocked: "#ef4444",
};

const PRIORITY_COLORS: Record<string, string> = {
  Urgent: "#dc2626",
  High: "#f97316",
  Medium: "#eab308",
  Low: "#84cc16",
};

const CATEGORY_COLORS = ["#8b5cf6", "#ec4899", "#06b6d4", "#10b981", "#f59e0b", "#6366f1"];

type ChartId = "timeline" | "status" | "priority" | "decisions" | "durationRadar" | "completionRadial";
type ChartSize = "half" | "full";

const DEFAULT_ORDER: ChartId[] = [
  "timeline",
  "status",
  "priority",
  "decisions",
  "durationRadar",
  "completionRadial",
];

const DEFAULT_SIZES: Record<ChartId, ChartSize> = {
  timeline: "half",
  status: "half",
  priority: "half",
  decisions: "half",
  durationRadar: "half",
  completionRadial: "half",
};

const STORAGE_KEY_ORDER = "analytics_charts_order_v2";
const STORAGE_KEY_PINNED = "analytics_charts_pinned_v2";
const STORAGE_KEY_SIZES = "analytics_charts_sizes_v2";

export default function AnalyticsCharts({ data }: DashboardChartsProps) {
  const timelineData = data?.meetingsTimeline || [];
  const statusData = data?.actionItemsStatusDistribution || [];
  const priorityData = data?.actionItemsPriorityDistribution || [];
  const decisionData = data?.keyDecisionsBreakdown || [];

  // Calculate completion percentage for radial chart
  const completedCount = statusData.find((s) => s.name === "Completed")?.value || 0;
  const totalActionItems = statusData.reduce((acc, curr) => acc + curr.value, 0);
  const completionPercent = totalActionItems > 0 ? Math.round((completedCount / totalActionItems) * 100) : 0;

  const radialData = [
    {
      name: "Completion Rate",
      value: completionPercent,
      fill: "#10b981",
    },
  ];

  // Radar chart data for meeting efficiency and engagement metrics
  const radarData = [
    { metric: "Velocity", score: Math.min(100, timelineData.length * 15 || 75) },
    { metric: "Decisions", score: Math.min(100, decisionData.length * 20 || 85) },
    { metric: "Action Density", score: Math.min(100, totalActionItems * 10 || 70) },
    { metric: "Completion", score: completionPercent || 60 },
    { metric: "Transcripts", score: Math.min(100, (timelineData.reduce((a, b) => a + b.transcriptsCount, 0) || 5) * 15) },
  ];

  const [chartOrder, setChartOrder] = useState<ChartId[]>(DEFAULT_ORDER);
  const [pinnedChartIds, setPinnedChartIds] = useState<ChartId[]>([]);
  const [chartSizes, setChartSizes] = useState<Record<ChartId, ChartSize>>(DEFAULT_SIZES);
  const [draggedChartId, setDraggedChartId] = useState<ChartId | null>(null);
  const [dragOverChartId, setDragOverChartId] = useState<ChartId | null>(null);

  useEffect(() => {
    try {
      const savedOrder = localStorage.getItem(STORAGE_KEY_ORDER);
      const savedPinned = localStorage.getItem(STORAGE_KEY_PINNED);
      const savedSizes = localStorage.getItem(STORAGE_KEY_SIZES);

      if (savedOrder) {
        const parsed = JSON.parse(savedOrder);
        if (Array.isArray(parsed) && parsed.length === DEFAULT_ORDER.length) {
          setChartOrder(parsed);
        }
      }
      if (savedPinned) {
        const parsedPinned = JSON.parse(savedPinned);
        if (Array.isArray(parsedPinned)) {
          setPinnedChartIds(parsedPinned);
        }
      }
      if (savedSizes) {
        const parsedSizes = JSON.parse(savedSizes);
        if (typeof parsedSizes === "object" && parsedSizes !== null) {
          setChartSizes({ ...DEFAULT_SIZES, ...parsedSizes });
        }
      }
    } catch {
      // Fallback silently if localStorage fails
    }
  }, []);

  const saveOrder = (newOrder: ChartId[]) => {
    setChartOrder(newOrder);
    try {
      localStorage.setItem(STORAGE_KEY_ORDER, JSON.stringify(newOrder));
    } catch {}
  };

  const savePinned = (newPinned: ChartId[]) => {
    setPinnedChartIds(newPinned);
    try {
      localStorage.setItem(STORAGE_KEY_PINNED, JSON.stringify(newPinned));
    } catch {}
  };

  const saveSizes = (newSizes: Record<ChartId, ChartSize>) => {
    setChartSizes(newSizes);
    try {
      localStorage.setItem(STORAGE_KEY_SIZES, JSON.stringify(newSizes));
    } catch {}
  };

  const togglePin = (id: ChartId) => {
    let updatedPinned: ChartId[];
    if (pinnedChartIds.includes(id)) {
      updatedPinned = pinnedChartIds.filter((pId) => pId !== id);
    } else {
      updatedPinned = [...pinnedChartIds, id];
    }
    savePinned(updatedPinned);
  };

  const toggleSize = (id: ChartId) => {
    const currentSize = chartSizes[id] || "half";
    const newSize: ChartSize = currentSize === "half" ? "full" : "half";
    const updatedSizes = { ...chartSizes, [id]: newSize };
    saveSizes(updatedSizes);
  };

  const resetLayout = () => {
    saveOrder(DEFAULT_ORDER);
    savePinned([]);
    saveSizes(DEFAULT_SIZES);
  };

  const handleDragStart = (e: React.DragEvent, id: ChartId) => {
    setDraggedChartId(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
  };

  const handleDragOver = (e: React.DragEvent, id: ChartId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverChartId !== id) {
      setDragOverChartId(id);
    }
  };

  const handleDragLeave = (e: React.DragEvent, id: ChartId) => {
    if (dragOverChartId === id) {
      setDragOverChartId(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetId: ChartId) => {
    e.preventDefault();
    setDragOverChartId(null);

    const sourceId = draggedChartId || (e.dataTransfer.getData("text/plain") as ChartId);
    if (!sourceId || sourceId === targetId) return;

    const sourceIndex = chartOrder.indexOf(sourceId);
    const targetIndex = chartOrder.indexOf(targetId);

    if (sourceIndex === -1 || targetIndex === -1) return;

    const newOrder = [...chartOrder];
    newOrder.splice(sourceIndex, 1);
    newOrder.splice(targetIndex, 0, sourceId);

    saveOrder(newOrder);
    setDraggedChartId(null);
  };

  const handleDragEnd = () => {
    setDraggedChartId(null);
    setDragOverChartId(null);
  };

  // Render Functions for Charts
  const renderChartContent = (id: ChartId) => {
    switch (id) {
      case "timeline":
        return (
          <>
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
          </>
        );

      case "status":
        return (
          <>
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
          </>
        );

      case "priority":
        return (
          <>
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
          </>
        );

      case "decisions":
        return (
          <>
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
          </>
        );

      case "durationRadar":
        return (
          <>
            <div className="mb-4">
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span>🕸️</span> Meeting Health & Index Radar
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Multi-dimensional index across meeting activity, transcripts, and completion metrics.
              </p>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="#3f3f46" strokeOpacity={0.2} />
                  <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: "#a1a1aa" }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10, fill: "#71717a" }} />
                  <Radar name="Performance Score" dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.4} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(24, 24, 27, 0.9)",
                      borderColor: "#3f3f46",
                      borderRadius: "12px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </>
        );

      case "completionRadial":
        return (
          <>
            <div className="mb-4">
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span>⏱️</span> Action Item Completion Gauge
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Overall resolution percentage of AI-generated task items.
              </p>
            </div>
            <div className="h-64 w-full flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius="65%"
                  outerRadius="90%"
                  barSize={16}
                  data={radialData}
                  startAngle={180}
                  endAngle={0}
                >
                  <RadialBar background dataKey="value" cornerRadius={10} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(24, 24, 27, 0.9)",
                      borderColor: "#3f3f46",
                      borderRadius: "12px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pt-8 pointer-events-none">
                <span className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
                  {completionPercent}%
                </span>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">Completed</span>
              </div>
            </div>
          </>
        );
    }
  };

  const sortedChartIds = [
    ...pinnedChartIds.filter((id) => chartOrder.includes(id)),
    ...chartOrder.filter((id) => !pinnedChartIds.includes(id)),
  ];

  return (
    <div className="my-8 space-y-4">
      {/* Controls Bar */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <span>💡 Drag cards to rearrange layout. Pin items to top or resize cards anytime.</span>
        </div>
        {(pinnedChartIds.length > 0 ||
          JSON.stringify(chartOrder) !== JSON.stringify(DEFAULT_ORDER) ||
          JSON.stringify(chartSizes) !== JSON.stringify(DEFAULT_SIZES)) && (
          <button
            onClick={resetLayout}
            className="flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors bg-zinc-100 dark:bg-zinc-800/80 px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700"
            title="Reset layout order, pins, and sizes"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Layout</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sortedChartIds.map((id) => {
          const isPinned = pinnedChartIds.includes(id);
          const isFullWidth = (chartSizes[id] || "half") === "full";
          const isDragging = draggedChartId === id;
          const isDragOver = dragOverChartId === id;

          return (
            <div
              key={id}
              draggable
              onDragStart={(e) => handleDragStart(e, id)}
              onDragOver={(e) => handleDragOver(e, id)}
              onDragLeave={(e) => handleDragLeave(e, id)}
              onDrop={(e) => handleDrop(e, id)}
              onDragEnd={handleDragEnd}
              className={`bg-white dark:bg-zinc-900/70 rounded-2xl p-6 border transition-all duration-200 flex flex-col justify-between relative group ${
                isFullWidth ? "col-span-1 lg:col-span-2" : "col-span-1"
              } ${
                isPinned
                  ? "border-indigo-400/60 dark:border-indigo-500/50 shadow-md ring-1 ring-indigo-500/20"
                  : "border-zinc-200 dark:border-zinc-800 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700"
              } ${isDragging ? "opacity-40 scale-[0.98]" : "opacity-100"} ${
                isDragOver
                  ? "border-dashed border-indigo-500 dark:border-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20"
                  : ""
              }`}
            >
              {/* Card Header Controls */}
              <div className="flex items-center justify-between mb-2">
                <div
                  className="flex items-center gap-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-grab active:cursor-grabbing p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  title="Click and drag to reorder card"
                >
                  <GripVertical className="w-4 h-4" />
                  <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-400 select-none">
                    {isPinned ? "Pinned" : "Drag"}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {isPinned && (
                    <span className="text-[10px] bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 px-2 py-0.5 rounded-full font-medium">
                      Pinned
                    </span>
                  )}

                  {/* Manual Size Toggle Button */}
                  <button
                    onClick={() => toggleSize(id)}
                    className="p-1.5 rounded-lg border border-transparent text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    title={isFullWidth ? "Shrink to half width" : "Expand to full width"}
                  >
                    {isFullWidth ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                  </button>

                  {/* Pin Toggle Button */}
                  <button
                    onClick={() => togglePin(id)}
                    className={`p-1.5 rounded-lg border transition-colors ${
                      isPinned
                        ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100"
                        : "bg-transparent border-transparent text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    }`}
                    title={isPinned ? "Unpin chart" : "Pin chart to top"}
                  >
                    {isPinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Chart Body */}
              {renderChartContent(id)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
