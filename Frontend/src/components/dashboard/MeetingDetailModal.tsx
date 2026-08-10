"use client";

import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { Meeting, MeetingSummary } from "@/types/meeting";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Users,
  Clock,
  FileText,
  Sparkles,
  Target,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ArrowRightCircle,
  Gavel,
  CheckSquare,
  User,
  Loader2,
  Info,
} from "lucide-react";

interface MeetingDetailModalProps {
  meeting: Meeting | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (meeting: Meeting) => void;
  isSummarizing?: boolean;
}

export function MeetingDetailModal({
  meeting,
  isOpen,
  onClose,
  onEdit,
  isSummarizing = false,
}: MeetingDetailModalProps) {
  const [activeTab, setActiveTab] = useState<"summary" | "transcript">("summary");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("English");
  const [currentSummary, setCurrentSummary] = useState<MeetingSummary | null | undefined>(
    meeting?.summary
  );

  // Sync state when meeting prop changes
  useEffect(() => {
    setCurrentSummary(meeting?.summary);
    setActiveTab("summary");
  }, [meeting]);

  if (!meeting) return null;

  const summaryData = currentSummary || meeting.summary;

  const stripHtml = (input: string | null | undefined): string => {
    if (!input) return "";
    let str = input;
    if (/<[a-z][\s\S]*>/i.test(str)) {
      str = str
        .replace(/<br\s*\/?>/gi, " ")
        .replace(/<\/(p|div|li|tr|h[1-6])>/gi, "\n")
        .replace(/<[^>]+>/g, " ")
        .replace(/&nbsp;/gi, " ")
        .replace(/&amp;/gi, "&")
        .replace(/&lt;/gi, "<")
        .replace(/&gt;/gi, ">")
        .replace(/&quot;/gi, '"')
        .replace(/&#39;/gi, "'")
        .replace(/&rsquo;/gi, "'")
        .replace(/&lsquo;/gi, "'")
        .replace(/&rdquo;/gi, '"')
        .replace(/&ldquo;/gi, '"')
        .replace(/&mdash;/gi, "—")
        .replace(/&ndash;/gi, "–")
        .replace(/[ \t]+/g, " ")
        .replace(/\n\s*\n+/g, "\n")
        .trim();
    } else {
      str = str
        .replace(/&nbsp;/gi, " ")
        .replace(/&amp;/gi, "&")
        .replace(/&lt;/gi, "<")
        .replace(/&gt;/gi, ">")
        .replace(/&quot;/gi, '"')
        .replace(/&#39;/gi, "'")
        .replace(/&rsquo;/gi, "'")
        .replace(/&lsquo;/gi, "'")
        .replace(/&rdquo;/gi, '"')
        .replace(/&ldquo;/gi, '"')
        .replace(/&mdash;/gi, "—")
        .replace(/&ndash;/gi, "–")
        .replace(/[ \t]+/g, " ")
        .trim();
    }
    return str;
  };

  const handleGenerateSummary = async () => {
    setIsGenerating(true);
    try {
      const res = await api.post(`/meetings/${meeting.id}/summarize`, {
        language: selectedLanguage,
      });
      if (res.data && res.data.summary) {
        setCurrentSummary(res.data.summary);
        meeting.summary = res.data.summary;
      }
    } catch (err) {
      console.error("Failed to generate AI summary:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case "Urgent":
        return "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border-red-200";
      case "High":
        return "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 border-orange-200";
      case "Medium":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200";
      case "Low":
      default:
        return "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200";
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 border-green-200";
      case "In Progress":
        return "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300 border-sky-200";
      case "Pending":
      default:
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[750px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between pr-4">
            <Badge variant="secondary" className="mb-2">
              {meeting.type}
            </Badge>
          </div>
          <DialogTitle className="text-xl font-bold">
            {meeting.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Metadata Bar */}
          <div className="grid grid-cols-2 gap-4 text-sm bg-zinc-50 p-3 rounded-lg dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
              <Calendar className="h-4 w-4 text-zinc-500" />
              <span>
                <strong>Date:</strong> {meeting.date}
              </span>
            </div>
            <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
              <Clock className="h-4 w-4 text-zinc-500" />
              <span>
                <strong>Created:</strong> {meeting.createdAt}
              </span>
            </div>
          </div>

          {/* Participants */}
          <div>
            <h4 className="text-xs font-semibold flex items-center gap-2 mb-2 text-zinc-500 uppercase tracking-wider">
              <Users className="h-3.5 w-3.5" />
              Participants
            </h4>
            <div className="flex flex-wrap gap-2">
              {meeting.participants.map((email) => (
                <Badge key={email} variant="outline" className="text-xs font-normal">
                  {email}
                </Badge>
              ))}
            </div>
          </div>

          {/* Structured Summary & Transcript Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as "summary" | "transcript")}
            className="w-full"
          >
            <div className="flex items-center justify-between">
              <TabsList className="grid w-64 grid-cols-2">
                <TabsTrigger value="summary" className="flex items-center gap-1.5 text-xs">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  AI Summary
                </TabsTrigger>
                <TabsTrigger value="transcript" className="flex items-center gap-1.5 text-xs">
                  <FileText className="h-3.5 w-3.5 text-blue-500" />
                  Transcript
                </TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-2">
                <Badge key={selectedLanguage} variant="outline" className="text-xs font-normal">
                  {selectedLanguage}
                </Badge>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleGenerateSummary}
                  disabled={isGenerating}
                  className="h-8 text-xs flex items-center gap-1.5"
                >
                  {isGenerating ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-500" />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  )}
                  {isGenerating ? "Generating..." : "Re-generate AI Notes"}
                </Button>
              </div>
            </div>

            {/* AI Structured Summary View */}
            <TabsContent value="summary" className="mt-3 space-y-4">
              {summaryData ? (
                <div className="space-y-4">
                  {/* 1. Purpose of the Meeting */}
                  <div className="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 p-4 rounded-lg space-y-1.5 shadow-sm">
                    <h5 className="text-xs font-bold text-amber-800 dark:text-amber-400 flex items-center gap-1.5 uppercase tracking-wide">
                      <Target className="h-4 w-4" />
                      1. Purpose of the Meeting
                    </h5>
                    <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                      {stripHtml(summaryData.purpose)}
                    </p>
                  </div>

                  {/* 2. Important Discussion Points */}
                  <div className="bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 p-4 rounded-lg space-y-2 shadow-sm">
                    <h5 className="text-xs font-bold text-blue-800 dark:text-blue-400 flex items-center gap-1.5 uppercase tracking-wide">
                      <MessageSquare className="h-4 w-4" />
                      2. Important Discussion Points
                    </h5>
                    <ul className="space-y-1.5 text-sm text-zinc-700 dark:text-zinc-300 list-disc list-inside">
                      {summaryData.discussionPoints?.map((dp, i) => (
                        <li key={i} className="leading-snug pl-1">
                          {stripHtml(dp)}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* 3. Major Outcomes */}
                  <div className="bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 p-4 rounded-lg space-y-2 shadow-sm">
                    <h5 className="text-xs font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5 uppercase tracking-wide">
                      <CheckCircle2 className="h-4 w-4" />
                      3. Major Outcomes
                    </h5>
                    <ul className="space-y-1.5 text-sm text-zinc-700 dark:text-zinc-300 list-disc list-inside">
                      {summaryData.majorOutcomes?.map((mo, i) => (
                        <li key={i} className="leading-snug pl-1">
                          {stripHtml(mo)}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* 4. Important Concerns */}
                  <div className="bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 p-4 rounded-lg space-y-2 shadow-sm">
                    <h5 className="text-xs font-bold text-rose-800 dark:text-rose-400 flex items-center gap-1.5 uppercase tracking-wide">
                      <AlertTriangle className="h-4 w-4" />
                      4. Important Concerns
                    </h5>
                    <ul className="space-y-1.5 text-sm text-zinc-700 dark:text-zinc-300 list-disc list-inside">
                      {summaryData.importantConcerns?.map((ic, i) => (
                        <li key={i} className="leading-snug pl-1">
                          {stripHtml(ic)}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* 5. Unanswered Questions */}
                  <div className="bg-orange-50/60 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/50 p-4 rounded-lg space-y-2 shadow-sm">
                    <h5 className="text-xs font-bold text-orange-800 dark:text-orange-400 flex items-center gap-1.5 uppercase tracking-wide">
                      <HelpCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                      5. Unanswered Questions
                    </h5>
                    {summaryData.unansweredQuestions && summaryData.unansweredQuestions.length > 0 ? (
                      <ul className="space-y-1.5 text-sm text-zinc-700 dark:text-zinc-300 list-disc list-inside">
                        {summaryData.unansweredQuestions.map((uq, i) => (
                          <li key={i} className="leading-snug pl-1">
                            {stripHtml(uq)}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="flex items-center gap-2 py-2 text-xs text-orange-700/80 dark:text-orange-400/80 italic">
                        <HelpCircle className="h-4 w-4 text-orange-400 opacity-60" />
                        <span>No unanswered questions identified in this meeting.</span>
                      </div>
                    )}
                  </div>

                  {/* 5. Next Steps */}
                  <div className="bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/50 p-4 rounded-lg space-y-2 shadow-sm">
                    <h5 className="text-xs font-bold text-indigo-800 dark:text-indigo-400 flex items-center gap-1.5 uppercase tracking-wide">
                      <ArrowRightCircle className="h-4 w-4" />
                      5. Next Steps
                    </h5>
                    <ul className="space-y-1.5 text-sm text-zinc-700 dark:text-zinc-300 list-disc list-inside">
                      {summaryData.nextSteps?.map((ns, i) => (
                        <li key={i} className="leading-snug pl-1">
                          {stripHtml(ns)}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* 6. Key Decisions Made */}
                  <div className="bg-purple-50/70 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/50 p-4 rounded-lg space-y-3 shadow-sm">
                    <h5 className="text-xs font-bold text-purple-800 dark:text-purple-300 flex items-center gap-1.5 uppercase tracking-wide">
                      <Gavel className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      6. Key Decisions Made
                    </h5>

                    {summaryData.keyDecisions && summaryData.keyDecisions.length > 0 ? (
                      <div className="space-y-2.5">
                        {summaryData.keyDecisions.map((kd, idx) => (
                          <div
                            key={idx}
                            className="bg-white dark:bg-zinc-900 p-3 rounded border border-purple-100 dark:border-purple-900/40 shadow-sm space-y-1"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-purple-500"></span>
                                {stripHtml(kd.decision)}
                              </span>
                              <Badge
                                variant="secondary"
                                className="text-[10px] uppercase tracking-wider bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 shrink-0"
                              >
                                {stripHtml(kd.category)}
                              </Badge>
                            </div>
                            {kd.context && (
                              <p className="text-xs text-zinc-500 dark:text-zinc-400 pl-3 italic">
                                Context: {stripHtml(kd.context)}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-xs text-zinc-500 bg-white/70 dark:bg-zinc-900/70 p-3 rounded border border-purple-100 dark:border-purple-900/30">
                        <Info className="h-4 w-4 text-purple-400 shrink-0" />
                        <span>
                          No explicit key decisions were recorded during this meeting.
                        </span>
                      </div>
                    )}
                  </div>

                  {/* 7. AI Extracted Action Items */}
                  <div className="bg-teal-50/70 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-900/50 p-4 rounded-lg space-y-3 shadow-sm">
                    <h5 className="text-xs font-bold text-teal-800 dark:text-teal-300 flex items-center gap-1.5 uppercase tracking-wide">
                      <CheckSquare className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                      7. Extracted Action Items
                    </h5>

                    {summaryData.actionItems && summaryData.actionItems.length > 0 ? (
                      <div className="space-y-2.5">
                        {summaryData.actionItems.map((item, idx) => (
                          <div
                            key={idx}
                            className="bg-white dark:bg-zinc-900 p-3 rounded border border-teal-100 dark:border-teal-900/40 shadow-sm space-y-2"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 flex items-start gap-1.5 pt-0.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-teal-500 mt-1.5 shrink-0"></span>
                                {stripHtml(item.task)}
                              </span>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <Badge
                                  variant="outline"
                                  className={`text-[10px] uppercase ${getPriorityBadgeClass(item.priority)}`}
                                >
                                  {item.priority}
                                </Badge>
                                <Badge
                                  variant="outline"
                                  className={`text-[10px] uppercase ${getStatusBadgeClass(item.status)}`}
                                >
                                  {item.status}
                                </Badge>
                              </div>
                            </div>

                            <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400 pl-3">
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3 text-zinc-400" />
                                Owner: <strong className="text-zinc-700 dark:text-zinc-300">{stripHtml(item.owner)}</strong>
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3 text-zinc-400" />
                                Due: <strong className="text-zinc-700 dark:text-zinc-300">{stripHtml(item.dueDate)}</strong>
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-xs text-zinc-500 bg-white/70 dark:bg-zinc-900/70 p-3 rounded border border-teal-100 dark:border-teal-900/30">
                        <Info className="h-4 w-4 text-teal-400 shrink-0" />
                        <span>No actionable tasks were extracted from this transcript.</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : isSummarizing || isGenerating ? (
                <div className="text-center py-10 border border-amber-200 dark:border-amber-900/50 bg-amber-50/30 dark:bg-amber-950/10 rounded-lg space-y-3">
                  <div className="flex items-center justify-center gap-2 text-amber-600 dark:text-amber-400">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <Sparkles className="h-6 w-6 text-amber-500 animate-pulse" />
                  </div>
                  <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    AI Summary Job is Processing
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
                    Our AI model is currently generating structured notes, purpose, discussion points, key decisions, and action items. This will update automatically once completed.
                  </p>
                </div>
              ) : (
                <div className="text-center py-8 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg">
                  <Sparkles className="mx-auto h-8 w-8 text-amber-400 mb-2" />
                  <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    No AI Summary generated yet
                  </p>
                  <p className="text-xs text-zinc-500 mb-4">
                    Click below to generate structured meeting notes covering purpose, discussion, outcomes, concerns & next steps.
                  </p>
                  <Button
                    size="sm"
                    onClick={handleGenerateSummary}
                    disabled={isGenerating}
                    className="flex items-center gap-2 mx-auto"
                  >
                    {isGenerating && <Loader2 className="h-4 w-4 animate-spin" />}
                    Generate AI Summary
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* Transcript & Rich Text Notes View */}
            <TabsContent value="transcript" className="mt-3">
              <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-md border border-zinc-200 dark:border-zinc-800 text-sm min-h-[160px] leading-relaxed prose dark:prose-invert max-w-none">
                {meeting.transcript ? (
                  meeting.transcript.includes("<") && meeting.transcript.includes(">") ? (
                    <div dangerouslySetInnerHTML={{ __html: meeting.transcript }} />
                  ) : (
                    <div className="whitespace-pre-wrap">{meeting.transcript}</div>
                  )
                ) : (
                  <span className="text-zinc-400 italic">
                    No transcript available for this meeting.
                  </span>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            onClick={() => {
              onClose();
              onEdit(meeting);
            }}
          >
            Edit Meeting
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
