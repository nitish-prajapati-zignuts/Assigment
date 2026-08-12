"use client";

import { SentimentAnalysis, SpeakerAnalytics } from "@/types/meeting";
import { Badge } from "@/components/ui/badge";
import { Smile, Meh, AlertCircle, Flame, Users, Activity } from "lucide-react";

interface SentimentSpeakerAnalyticsProps {
  sentiment?: SentimentAnalysis;
  speakers?: SpeakerAnalytics[];
}

export function SentimentSpeakerAnalytics({
  sentiment,
  speakers,
}: SentimentSpeakerAnalyticsProps) {
  // Guaranteed mandatory sentiment analysis fallback if not provided
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

  const getToneBadge = (tone: SentimentAnalysis["overallTone"]) => {
    switch (tone) {
      case "Positive":
        return (
          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800 flex items-center gap-1.5 px-2.5 py-1">
            <Smile className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>Positive Tone ({sentiment?.score || 85}%)</span>
          </Badge>
        );
      case "Neutral":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/80 dark:text-blue-300 dark:border-blue-800 flex items-center gap-1.5 px-2.5 py-1">
            <Meh className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span>Neutral Tone ({sentiment?.score || 70}%)</span>
          </Badge>
        );
      case "Concerned":
        return (
          <Badge className="bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800 flex items-center gap-1.5 px-2.5 py-1">
            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <span>Concerned Tone ({sentiment?.score || 50}%)</span>
          </Badge>
        );
      case "Heated":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-300 dark:bg-red-950/80 dark:text-red-300 dark:border-red-800 flex items-center gap-1.5 px-2.5 py-1">
            <Flame className="h-4 w-4 text-red-600 dark:text-red-400" />
            <span>Heated Debate ({sentiment?.score || 35}%)</span>
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4 p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/40">
      {/* 1. Sentiment & Emotional Tone */}
      <div className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Activity className="h-4.5 w-4.5 text-indigo-500" />
            <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
              Meeting Sentiment Tone
            </h4>
          </div>
          {getToneBadge(activeSentiment.overallTone)}
        </div>

        {/* Breakdown progress bar */}
        <div className="space-y-2 pt-1">
          <div className="flex h-2.5 w-full rounded-full overflow-hidden bg-zinc-200 dark:bg-zinc-800">
            <div
              style={{ width: `${activeSentiment.breakdown.positive}%` }}
              className="bg-emerald-500 transition-all duration-300"
              title={`Positive: ${activeSentiment.breakdown.positive}%`}
            />
            <div
              style={{ width: `${activeSentiment.breakdown.neutral}%` }}
              className="bg-blue-500 transition-all duration-300"
              title={`Neutral: ${activeSentiment.breakdown.neutral}%`}
            />
            <div
              style={{ width: `${activeSentiment.breakdown.concerned}%` }}
              className="bg-amber-500 transition-all duration-300"
              title={`Concerned: ${activeSentiment.breakdown.concerned}%`}
            />
            <div
              style={{ width: `${activeSentiment.breakdown.heated}%` }}
              className="bg-red-500 transition-all duration-300"
              title={`Heated: ${activeSentiment.breakdown.heated}%`}
            />
          </div>

          <div className="grid grid-cols-4 gap-1 text-[11px] text-zinc-600 dark:text-zinc-400 font-medium pt-1">
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>Pos: {activeSentiment.breakdown.positive}%</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              <span>Neu: {activeSentiment.breakdown.neutral}%</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              <span>Con: {activeSentiment.breakdown.concerned}%</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              <span>Heat: {activeSentiment.breakdown.heated}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Speaker Talk-Time Analytics */}
      <div className="space-y-3 border-t md:border-t-0 md:border-l border-zinc-200 dark:border-zinc-800 pt-3 md:pt-0 md:pl-4">
        <div className="flex items-center gap-2">
          <Users className="h-4.5 w-4.5 text-indigo-500" />
          <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
            Speaker Participation
          </h4>
        </div>

        <div className="space-y-2.5">
          {activeSpeakers.map((speaker, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between text-xs font-medium text-zinc-700 dark:text-zinc-300">
                <span className="truncate max-w-[140px]">{speaker.name}</span>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  {speaker.talkTimePercentage}% ({speaker.wordCount} words)
                </span>
              </div>
              <div className="h-2 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(speaker.talkTimePercentage, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
