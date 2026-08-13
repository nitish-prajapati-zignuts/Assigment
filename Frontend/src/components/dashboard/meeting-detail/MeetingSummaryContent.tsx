"use client";

import { MeetingSummary } from "@/types/meeting";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SentimentSpeakerAnalytics } from "../meetings/SentimentSpeakerAnalytics";
import { Sparkles, Target, MessageSquare, CheckCircle2, Gavel, CheckSquare, User, Loader2 } from "lucide-react";

interface MeetingSummaryContentProps {
  summaryData: MeetingSummary | null | undefined;
  isGenerating: boolean;
  onGenerateSummary: () => void;
}

function stripHtml(htmlStr?: string): string {
  if (!htmlStr) return "";
  return htmlStr.replace(/<[^>]*>?/gm, "").trim();
}

export function MeetingSummaryContent({ summaryData, isGenerating, onGenerateSummary }: MeetingSummaryContentProps) {
  if (!summaryData) {
    return (
      <div className="text-center py-8 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg">
        <Sparkles className="mx-auto h-10 w-10 text-amber-400 mb-2" />
        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">No AI Summary generated yet</p>
        <p className="text-xs text-zinc-500 mb-4">
          Click below to generate structured meeting notes covering purpose, discussion, outcomes, concerns & next
          steps.
        </p>
        <Button
          size="sm"
          onClick={onGenerateSummary}
          disabled={isGenerating}
          className="flex items-center gap-2 mx-auto"
        >
          {isGenerating && <Loader2 className="h-5 w-5 animate-spin" />}
          Generate AI Summary
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Template Style Badge Indicator */}
      {summaryData.templateStyle && (
        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-900/50 text-xs text-indigo-700 dark:text-indigo-300 font-medium">
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-indigo-500" />
            <span>AI Prompt Template Style:</span>
          </div>
          <Badge
            variant="secondary"
            className="bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-200 border-indigo-300 font-semibold"
          >
            {summaryData.templateStyle}
          </Badge>
        </div>
      )}

      {/* Sentiment & Speaker Analytics Visual Widget */}
      <SentimentSpeakerAnalytics sentiment={summaryData.sentimentAnalysis} speakers={summaryData.speakerAnalytics} />

      {/* Executive Strategic Briefing */}
      {summaryData.executiveDetails && (
        <div className="bg-purple-900/10 dark:bg-purple-950/30 border border-purple-300 dark:border-purple-800 p-4 rounded-xl space-y-3 shadow-sm">
          <h5 className="text-xs font-bold text-purple-900 dark:text-purple-300 flex items-center gap-1.5 uppercase tracking-wide">
            <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            Executive Strategic Briefing
          </h5>
          <div className="space-y-2 text-xs text-zinc-700 dark:text-zinc-300">
            <div>
              <span className="font-semibold text-purple-950 dark:text-purple-200">Strategic Impact: </span>
              <span>{stripHtml(summaryData.executiveDetails.strategicImpact)}</span>
            </div>
            {summaryData.executiveDetails.financialOrTimelineRisks?.length > 0 && (
              <div>
                <span className="font-semibold text-purple-950 dark:text-purple-200">Financial / Timeline Risks:</span>
                <ul className="list-disc list-inside pl-2 space-y-0.5 mt-1">
                  {summaryData.executiveDetails.financialOrTimelineRisks.map((r, i) => (
                    <li key={i}>{stripHtml(r)}</li>
                  ))}
                </ul>
              </div>
            )}
            {summaryData.executiveDetails.executiveRecommendations?.length > 0 && (
              <div>
                <span className="font-semibold text-purple-950 dark:text-purple-200">Recommendations:</span>
                <ul className="list-disc list-inside pl-2 space-y-0.5 mt-1">
                  {summaryData.executiveDetails.executiveRecommendations.map((rec, i) => (
                    <li key={i}>{stripHtml(rec)}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Purpose & Overview */}
      {summaryData.purpose && (
        <div className="bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 p-4 rounded-md space-y-1">
          <h5 className="text-xs font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
            <Target className="h-4 w-4 text-amber-500" /> Purpose & Overview
          </h5>
          <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-sans">
            {stripHtml(summaryData.purpose)}
          </p>
        </div>
      )}

      {/* Discussion Points */}
      {summaryData.discussionPoints && summaryData.discussionPoints.length > 0 && (
        <div className="space-y-2">
          <h5 className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
            <MessageSquare className="h-4 w-4 text-blue-500" /> Main Discussion Points
          </h5>
          <ul className="space-y-1.5 pl-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-sans">
            {summaryData.discussionPoints.map((point, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                <span>{stripHtml(point)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Major Outcomes & Decisions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {summaryData.majorOutcomes && summaryData.majorOutcomes.length > 0 && (
          <div className="bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-md space-y-2">
            <h5 className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Major Outcomes
            </h5>
            <ul className="space-y-1 pl-1 text-xs text-zinc-700 dark:text-zinc-300">
              {summaryData.majorOutcomes.map((outcome, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                  <span>{stripHtml(outcome)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {summaryData.keyDecisions && summaryData.keyDecisions.length > 0 && (
          <div className="bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/20 p-3.5 rounded-md space-y-2">
            <h5 className="text-xs font-semibold text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5">
              <Gavel className="h-4 w-4 text-indigo-500" /> Key Decisions
            </h5>
            <div className="space-y-2">
              {summaryData.keyDecisions.map((kd, index) => (
                <div
                  key={index}
                  className="text-xs bg-white dark:bg-zinc-800/60 p-2 rounded border border-indigo-100 dark:border-indigo-900/50"
                >
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400 font-mono text-[10px] block uppercase">
                    {kd.category}
                  </span>
                  <span className="text-zinc-800 dark:text-zinc-200 font-medium block">{stripHtml(kd.decision)}</span>
                  {kd.context && (
                    <span className="text-zinc-500 text-[11px] block mt-0.5 font-sans">{stripHtml(kd.context)}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Items List */}
      {summaryData.actionItems && summaryData.actionItems.length > 0 && (
        <div className="space-y-2">
          <h5 className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
            <CheckSquare className="h-4 w-4 text-purple-500" /> Extracted Action Items
          </h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {summaryData.actionItems.map((item, index) => (
              <div
                key={index}
                className="bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 p-2.5 rounded-md flex flex-col justify-between text-xs space-y-1"
              >
                <span className="font-medium text-zinc-900 dark:text-zinc-100">{stripHtml(item.task)}</span>
                <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1 border-t border-zinc-200/40 dark:border-zinc-800">
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3 text-zinc-400" /> {item.owner || "Unassigned"}
                  </span>
                  <Badge variant="outline" className="text-[10px]">
                    Due: {item.dueDate || "N/A"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
