"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/axios";
import { Meeting } from "@/types/meeting";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Calendar,
  Users,
  Sparkles,
  FileText,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ArrowRightCircle,
  Gavel,
  CheckSquare,
  Lock,
  Loader2,
  Share2,
} from "lucide-react";

export default function PublicSharePage() {
  const params = useParams();
  const token = params?.token as string;

  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const LOADING_MESSAGES = [
    "Decrypting secure share link...",
    "Validating meeting access permissions...",
    "Fetching meeting details & AI summary...",
    "Rendering structured meeting notes...",
  ];

  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 1800);

    return () => clearInterval(interval);
  }, [isLoading, LOADING_MESSAGES.length]);

  useEffect(() => {
    if (!token) return;

    const fetchPublicMeeting = async () => {
      try {
        setIsLoading(true);
        const res = await api.get(`/meetings/public/share/${token}`);
        setMeeting(res.data);
        setError(null);
      } catch (err: any) {
        console.error("Error loading shared meeting:", err);
        setError(err?.data?.message || err?.message || "Unable to load shared meeting link");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPublicMeeting();
  }, [token]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center max-w-sm w-full space-y-4 px-4">
          <div className="flex items-center gap-3 text-zinc-700 dark:text-zinc-300">
            <div className="relative overflow-hidden h-6 flex items-center">
              <span
                key={messageIndex}
                className="text-sm font-medium transition-all duration-300 animate-slide-left-to-right whitespace-nowrap"
              >
                {LOADING_MESSAGES[messageIndex]}
              </span>
            </div>
          </div>

          {/* Left-to-right moving gradient progress bar */}
          <div className="w-52 h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden relative">
            <div className="absolute top-0 bottom-0 left-0 w-1/2 bg-gradient-to-r from-amber-500 via-purple-500 to-amber-500 rounded-full animate-bar-left-to-right" />
          </div>
        </div>

        <style jsx>{`
          @keyframes slideInFromLeft {
            0% {
              opacity: 0;
              transform: translateX(-30px) scale(0.96);
              filter: blur(4px);
            }
            50% {
              opacity: 0.6;
              filter: blur(1px);
            }
            100% {
              opacity: 1;
              transform: translateX(0) scale(1);
              filter: blur(0px);
            }
          }
          @keyframes barLeftToRight {
            0% {
              left: -50%;
            }
            100% {
              left: 100%;
            }
          }
          .animate-slide-left-to-right {
            animation: slideInFromLeft 0.75s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          .animate-bar-left-to-right {
            animation: barLeftToRight 1.5s ease-in-out infinite;
          }
        `}</style>
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4">
        <Card className="max-w-md w-full border-red-200 dark:border-red-900/40 shadow-sm text-center">
          <CardHeader className="pt-6">
            <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-950/50 flex items-center justify-center mx-auto mb-3 text-red-600">
              <Lock className="h-7 w-7" />
            </div>
            <CardTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Access Restricted or Link Invalid
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pb-6">
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              {error || "This shared meeting link is either invalid, expired, or sharing has been disabled by the owner."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const summary = meeting.summary;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <header className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200">
                <Share2 className="h-4 w-4 mr-1" /> Public Shared View
              </Badge>
              <Badge variant="secondary" className="text-xs font-normal">
                {meeting.type}
              </Badge>
            </div>
            <span className="text-xs text-zinc-500 flex items-center gap-1.5">
              <Calendar className="h-4.5 w-4.5" /> {meeting.date}
            </span>
          </div>

          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {meeting.title}
          </h1>

          {/* Participants */}
          <div className="flex items-center gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider flex items-center gap-1">
              <Users className="h-4.5 w-4.5" /> Participants:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {meeting.participants.map((email) => (
                <span
                  key={email}
                  className="text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-2 py-0.5 rounded-full border border-zinc-200/60 dark:border-zinc-700/60"
                >
                  {email}
                </span>
              ))}
            </div>
          </div>
        </header>

        {/* AI Summary Content */}
        {summary ? (
          <div className="space-y-5">
            {/* Purpose */}
            {summary.purpose && (
              <div className="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 p-5 rounded-2xl shadow-sm space-y-1">
                <h2 className="text-sm font-semibold text-amber-900 dark:text-amber-300 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-amber-500" /> Executive Purpose
                </h2>
                <p className="text-sm text-amber-950 dark:text-amber-200/90 leading-relaxed">
                  {summary.purpose}
                </p>
              </div>
            )}

            {/* Key Outcomes & Discussions */}
            <div className="grid md:grid-cols-2 gap-4">
              {summary.majorOutcomes && summary.majorOutcomes.length > 0 && (
                <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
                  <h3 className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5" /> Key Outcomes
                  </h3>
                  <ul className="space-y-2">
                    {summary.majorOutcomes.map((outcome, idx) => (
                      <li key={idx} className="text-xs text-zinc-700 dark:text-zinc-300 flex items-start gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                        <span>{outcome}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {summary.discussionPoints && summary.discussionPoints.length > 0 && (
                <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
                  <h3 className="text-sm font-semibold text-blue-700 dark:text-blue-400 flex items-center gap-2">
                    <FileText className="h-5 w-5" /> Discussion Points
                  </h3>
                  <ul className="space-y-2">
                    {summary.discussionPoints.map((point, idx) => (
                      <li key={idx} className="text-xs text-zinc-700 dark:text-zinc-300 flex items-start gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Key Decisions */}
            {summary.keyDecisions && summary.keyDecisions.length > 0 && (
              <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
                <h3 className="text-sm font-semibold text-purple-700 dark:text-purple-400 flex items-center gap-2">
                  <Gavel className="h-5 w-5" /> Key Decisions Made
                </h3>
                <div className="grid gap-2.5">
                  {summary.keyDecisions.map((decision, idx) => (
                    <div key={idx} className="p-3 bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30 rounded-xl space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-purple-900 dark:text-purple-300">
                          {decision.decision}
                        </span>
                        <Badge variant="outline" className="text-[10px] bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border-none">
                          {decision.category}
                        </Badge>
                      </div>
                      {decision.context && (
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                          Context: {decision.context}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Items */}
            {summary.actionItems && summary.actionItems.length > 0 && (
              <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
                <h3 className="text-sm font-semibold text-indigo-700 dark:text-indigo-400 flex items-center gap-2">
                  <CheckSquare className="h-5 w-5" /> Action Items
                </h3>
                <div className="space-y-2">
                  {summary.actionItems.map((item, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 gap-2">
                      <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200">
                        {item.task}
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="outline" className="text-[10px]">
                          Owner: {item.owner}
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">
                          Due: {item.dueDate}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white dark:bg-zinc-900 p-8 text-center rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-2">
            <FileText className="h-10 w-10 text-zinc-400 mx-auto" />
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              No AI summary generated for this meeting yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
