"use client";

import { SentimentAnalysis, SpeakerAnalytics } from "@/types/meeting";
import { Badge } from "@/components/ui/badge";
import { Smile, Meh, AlertCircle, Flame, Users, Activity, BarChart2 } from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

interface SentimentSpeakerAnalyticsProps {
  sentiment?: SentimentAnalysis;
  speakers?: SpeakerAnalytics[];
}

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export function SentimentSpeakerAnalytics({
  sentiment,
  speakers,
}: SentimentSpeakerAnalyticsProps) {
  const activeSentiment: SentimentAnalysis = sentiment || {
    overallTone: "Positive",
    score: 85,
    breakdown: {
      positive: 75,
      neutral: 15,
      concerned: 10,
      heated: 0,
    },
  };

  const activeSpeakers: SpeakerAnalytics[] =
    speakers && speakers.length > 0
      ? speakers
      : [
          { name: "Speaker 1", talkTimePercentage: 60, wordCount: 350 },
          { name: "Speaker 2", talkTimePercentage: 40, wordCount: 230 },
        ];

  // Prepare data for Recharts Pie Chart (Speaker Talk-Time)
  const pieData = activeSpeakers.map((s) => ({
    name: s.name,
    value: s.talkTimePercentage,
    words: s.wordCount,
  }));

  // Prepare data for Recharts Bar Chart (Sentiment Breakdown)
  const barData = [
    { name: "Positive", value: activeSentiment.breakdown.positive, fill: "#10b981" },
    { name: "Neutral", value: activeSentiment.breakdown.neutral, fill: "#3b82f6" },
    { name: "Concerned", value: activeSentiment.breakdown.concerned, fill: "#f59e0b" },
    { name: "Heated", value: activeSentiment.breakdown.heated, fill: "#ef4444" },
  ];

  const getToneBadge = (tone: SentimentAnalysis["overallTone"]) => {
    switch (tone) {
      case "Positive":
        return (
          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800 flex items-center gap-1.5 px-2.5 py-1">
            <Smile className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>Positive ({activeSentiment.score}%)</span>
          </Badge>
        );
      case "Neutral":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/80 dark:text-blue-300 dark:border-blue-800 flex items-center gap-1.5 px-2.5 py-1">
            <Meh className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span>Neutral ({activeSentiment.score}%)</span>
          </Badge>
        );
      case "Concerned":
        return (
          <Badge className="bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800 flex items-center gap-1.5 px-2.5 py-1">
            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <span>Concerned ({activeSentiment.score}%)</span>
          </Badge>
        );
      case "Heated":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-300 dark:bg-red-950/80 dark:text-red-300 dark:border-red-800 flex items-center gap-1.5 px-2.5 py-1">
            <Flame className="h-4 w-4 text-red-600 dark:text-red-400" />
            <span>Heated ({activeSentiment.score}%)</span>
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4 p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/70 dark:bg-zinc-900/60 backdrop-blur-md">
      {/* 1. Recharts Bar Chart: Sentiment Tone Breakdown */}
      <div className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Activity className="h-4.5 w-4.5 text-indigo-500" />
            <h4 className="text-xs font-extrabold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
              Sentiment Distribution
            </h4>
          </div>
          {getToneBadge(activeSentiment.overallTone)}
        </div>

        <div className="h-[140px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <XAxis dataKey="name" stroke="#a1a1aa" fontSize={10} tickLine={false} />
              <YAxis stroke="#a1a1aa" fontSize={10} tickLine={false} domain={[0, 100]} />
              <Tooltip
                formatter={(val: any) => [`${val}%`, "Share"]}

                contentStyle={{
                  backgroundColor: "rgba(24, 24, 27, 0.9)",
                  borderColor: "#3f3f46",
                  borderRadius: "8px",
                  fontSize: "11px",
                  color: "#fff",
                }}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {barData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Recharts Pie Chart: Speaker Participation */}
      <div className="space-y-3 border-t md:border-t-0 md:border-l border-zinc-200/80 dark:border-zinc-800/80 pt-3 md:pt-0 md:pl-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4.5 w-4.5 text-indigo-500" />
            <h4 className="text-xs font-extrabold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
              Speaker Talk Time
            </h4>
          </div>
          <Badge variant="outline" className="text-[10px] bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300">
            {activeSpeakers.length} Speaker(s)
          </Badge>
        </div>

        <div className="flex items-center justify-between gap-2 h-[140px]">
          {/* Donut Chart */}
          <div className="h-full w-1/2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={55}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`${val}%`, "Talk Time"]}

                  contentStyle={{
                    backgroundColor: "rgba(24, 24, 27, 0.9)",
                    borderColor: "#3f3f46",
                    borderRadius: "8px",
                    fontSize: "11px",
                    color: "#fff",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="w-1/2 space-y-1.5 overflow-y-auto max-h-[130px] pr-1">
            {pieData.map((speaker, i) => (
              <div key={i} className="flex items-center justify-between text-[11px] leading-tight">
                <div className="flex items-center gap-1.5 truncate max-w-[100px]">
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  />
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                    {speaker.name}
                  </span>
                </div>
                <span className="font-mono text-zinc-500 font-bold">{speaker.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
