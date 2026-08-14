"use client";

import { useState, useMemo } from "react";
import { Meeting, MeetingSummary } from "@/types/meeting";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GitCompareArrows, Calendar, Users, ArrowRight, Minus, Plus, Equal } from "lucide-react";

interface MeetingComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  meetings: Meeting[];
}

function getSummaryOrEmpty(meeting: Meeting | null): MeetingSummary {
  return (
    meeting?.summary || {
      purpose: "",
      discussionPoints: [],
      majorOutcomes: [],
      importantConcerns: [],
      nextSteps: [],
      keyDecisions: [],
      actionItems: [],
    }
  );
}

function diffArrays(left: string[], right: string[]) {
  const leftSet = new Set(left.map((s) => s.toLowerCase().trim()));
  const rightSet = new Set(right.map((s) => s.toLowerCase().trim()));

  const added = right.filter((s) => !leftSet.has(s.toLowerCase().trim()));
  const removed = left.filter((s) => !rightSet.has(s.toLowerCase().trim()));
  const same = left.filter((s) => rightSet.has(s.toLowerCase().trim()));

  return { added, removed, same };
}

function SummaryPane({
  label,
  meeting,
  summary,
  side,
}: {
  label: string;
  meeting: Meeting | null;
  summary: MeetingSummary;
  side: "left" | "right";
}) {
  if (!meeting)
    return (
      <div className="flex-1 p-4 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 flex items-center justify-center text-xs text-zinc-400 min-h-[300px]">
        Select a meeting for the {label} pane
      </div>
    );

  const borderColor =
    side === "left"
      ? "border-indigo-200/60 dark:border-indigo-800/60"
      : "border-purple-200/60 dark:border-purple-800/60";
  const headerBg = side === "left" ? "bg-indigo-50/50 dark:bg-indigo-950/30" : "bg-purple-50/50 dark:bg-purple-950/30";

  return (
    <div className={`flex-1 rounded-2xl border ${borderColor} overflow-hidden`}>
      {/* Header */}
      <div className={`p-3.5 ${headerBg} border-b ${borderColor}`}>
        <h4 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-50 truncate">{meeting.title}</h4>
        <div className="flex items-center gap-3 mt-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {new Date(meeting.date).toLocaleDateString()}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {meeting.participants?.length || 0} attendees
          </span>
          <Badge variant="outline" className="text-[10px]">
            {meeting.type}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-3.5 space-y-3 max-h-[55vh] overflow-y-auto">
        {/* Purpose */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400 mb-1">Purpose</p>
          <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">{summary.purpose || "—"}</p>
        </div>

        {/* Discussion Points */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400 mb-1">
            Discussion Points ({summary.discussionPoints?.length || 0})
          </p>
          <ul className="space-y-1">
            {(summary.discussionPoints || []).map((pt, i) => (
              <li key={i} className="text-xs text-zinc-600 dark:text-zinc-400 flex gap-1.5">
                <span className="text-indigo-500 shrink-0">▫️</span>
                <span>{pt}</span>
              </li>
            ))}
            {(!summary.discussionPoints || summary.discussionPoints.length === 0) && (
              <li className="text-xs text-zinc-400 italic">No discussion points</li>
            )}
          </ul>
        </div>

        {/* Key Decisions */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400 mb-1">
            Key Decisions ({summary.keyDecisions?.length || 0})
          </p>
          <ul className="space-y-1">
            {(summary.keyDecisions || []).map((d, i) => (
              <li key={i} className="text-xs text-zinc-600 dark:text-zinc-400 flex gap-1.5">
                <span className="text-amber-500 shrink-0">🔹</span>
                <span>
                  {typeof d === "string" ? d : d.decision}
                  {typeof d === "object" && d?.category && (
                    <Badge variant="outline" className="ml-1.5 text-[9px]">
                      {d.category}
                    </Badge>
                  )}
                </span>
              </li>
            ))}
            {(!summary.keyDecisions || summary.keyDecisions.length === 0) && (
              <li className="text-xs text-zinc-400 italic">No key decisions</li>
            )}
          </ul>
        </div>

        {/* Action Items */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400 mb-1">
            Action Items ({summary.actionItems?.length || 0})
          </p>
          <ul className="space-y-1.5">
            {(summary.actionItems || []).map((item, i) => (
              <li
                key={i}
                className="text-xs p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/50 dark:border-zinc-700/50"
              >
                <p className="font-semibold text-zinc-800 dark:text-zinc-200">{item.task}</p>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-zinc-500">
                  <span>👤 {item.owner}</span>
                  <span>📅 {item.dueDate}</span>
                  <Badge
                    variant="outline"
                    className={`text-[9px] ${item.priority === "High" || item.priority === "Urgent"
                      ? "border-red-300 text-red-600"
                      : "border-zinc-300 text-zinc-500"
                      }`}
                  >
                    {item.priority}
                  </Badge>
                </div>
              </li>
            ))}
            {(!summary.actionItems || summary.actionItems.length === 0) && (
              <li className="text-xs text-zinc-400 italic">No action items</li>
            )}
          </ul>
        </div>

        {/* Next Steps */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400 mb-1">
            Next Steps ({summary.nextSteps?.length || 0})
          </p>
          <ul className="space-y-1">
            {(summary.nextSteps || []).map((step, i) => (
              <li key={i} className="text-xs text-zinc-600 dark:text-zinc-400 flex gap-1.5">
                <ArrowRight className="h-3 w-3 text-emerald-500 shrink-0 mt-0.5" />
                <span>{step}</span>
              </li>
            ))}
            {(!summary.nextSteps || summary.nextSteps.length === 0) && (
              <li className="text-xs text-zinc-400 italic">No next steps</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

export function MeetingComparisonModal({ isOpen, onClose, meetings }: MeetingComparisonModalProps) {
  const [leftId, setLeftId] = useState<string>("");
  const [rightId, setRightId] = useState<string>("");

  const leftMeeting = meetings.find((m) => m.id === leftId) || null;
  const rightMeeting = meetings.find((m) => m.id === rightId) || null;

  const leftSummary = getSummaryOrEmpty(leftMeeting);
  const rightSummary = getSummaryOrEmpty(rightMeeting);

  // Compute diff stats
  const diffStats = useMemo(() => {
    if (!leftMeeting || !rightMeeting) return { discussion: null, decisions: null, actions: null, nextSteps: null };

    const discussion = diffArrays(leftSummary.discussionPoints || [], rightSummary.discussionPoints || []);

    const leftDecisions = (leftSummary.keyDecisions || []).map((d) => (typeof d === "string" ? d : d.decision));
    const rightDecisions = (rightSummary.keyDecisions || []).map((d) => (typeof d === "string" ? d : d.decision));
    const decisions = diffArrays(leftDecisions, rightDecisions);

    const leftActions = (leftSummary.actionItems || []).map((a) => a.task);
    const rightActions = (rightSummary.actionItems || []).map((a) => a.task);
    const actions = diffArrays(leftActions, rightActions);

    const nextSteps = diffArrays(leftSummary.nextSteps || [], rightSummary.nextSteps || []);

    return { discussion, decisions, actions, nextSteps };
  }, [leftMeeting, rightMeeting, leftSummary, rightSummary]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[90vw] max-w-4xl sm:max-w-4xl md:max-w-3xl max-h-[80vh] overflow-y-auto bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-extrabold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <GitCompareArrows className="h-5 w-5 text-indigo-500" />
            Meeting Comparison — Side-by-Side Diff
          </DialogTitle>
          <DialogDescription className="text-xs text-zinc-500">
            Select two meetings below to compare their AI-generated summaries, decisions, and action items side-by-side.
          </DialogDescription>
        </DialogHeader>

        {/* Meeting Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
              Meeting A (Left)
            </label>
            <Select value={leftId} onValueChange={(v) => v && setLeftId(v)}>
              <SelectTrigger className="text-xs bg-white dark:bg-zinc-900 border-indigo-200 dark:border-indigo-800">
                <SelectValue placeholder="Select first meeting...">
                  {leftMeeting
                    ? `${leftMeeting.title} (${new Date(leftMeeting.date).toLocaleDateString()})`
                    : "Select first meeting..."}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {meetings
                  .filter((m) => m.id !== rightId)
                  .map((m) => (
                    <SelectItem key={m.id} value={m.id} className="text-xs">
                      {m.title} ({new Date(m.date).toLocaleDateString()})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wide">
              Meeting B (Right)
            </label>
            <Select value={rightId} onValueChange={(v) => v && setRightId(v)}>
              <SelectTrigger className="text-xs bg-white dark:bg-zinc-900 border-purple-200 dark:border-purple-800">
                <SelectValue placeholder="Select second meeting...">
                  {rightMeeting
                    ? `${rightMeeting.title} (${new Date(rightMeeting.date).toLocaleDateString()})`
                    : "Select second meeting..."}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {meetings
                  .filter((m) => m.id !== leftId)
                  .map((m) => (
                    <SelectItem key={m.id} value={m.id} className="text-xs">
                      {m.title} ({new Date(m.date).toLocaleDateString()})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Diff Summary Badges */}
        {leftMeeting && rightMeeting && diffStats.discussion && (
          <div className="flex flex-wrap items-center gap-2 mt-2 p-3 rounded-xl bg-zinc-50/70 dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800/60">
            <span className="text-[11px] font-bold text-zinc-500 mr-1">Diff Summary:</span>
            <Badge
              variant="outline"
              className="text-[10px] bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200"
            >
              <Plus className="h-3 w-3 mr-0.5" />
              {diffStats.discussion.added.length +
                (diffStats.decisions?.added.length || 0) +
                (diffStats.actions?.added.length || 0)}{" "}
              New
            </Badge>
            <Badge
              variant="outline"
              className="text-[10px] bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 border-red-200"
            >
              <Minus className="h-3 w-3 mr-0.5" />
              {diffStats.discussion.removed.length +
                (diffStats.decisions?.removed.length || 0) +
                (diffStats.actions?.removed.length || 0)}{" "}
              Removed
            </Badge>
            <Badge
              variant="outline"
              className="text-[10px] bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200"
            >
              <Equal className="h-3 w-3 mr-0.5" />
              {diffStats.discussion.same.length +
                (diffStats.decisions?.same.length || 0) +
                (diffStats.actions?.same.length || 0)}{" "}
              Unchanged
            </Badge>
          </div>
        )}

        {/* Side-by-Side Panes */}
        <div className="flex flex-col sm:flex-row gap-3 mt-2">
          <SummaryPane label="left" meeting={leftMeeting} summary={leftSummary} side="left" />
          <SummaryPane label="right" meeting={rightMeeting} summary={rightSummary} side="right" />
        </div>

        {/* Inline Diff View (Items unique to each side) */}
        {leftMeeting && rightMeeting && diffStats.actions && (
          <div className="mt-3 p-3.5 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/40 space-y-3">
            <h4 className="text-xs font-extrabold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
              <GitCompareArrows className="h-4 w-4 text-indigo-500" />
              Action Items Diff Detail
            </h4>

            {diffStats.actions.added.length > 0 && (
              <div>
                <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mb-1 flex items-center gap-1">
                  <Plus className="h-3 w-3" /> New in Meeting B
                </p>
                {diffStats.actions.added.map((task, i) => (
                  <div
                    key={i}
                    className="text-xs ml-4 p-1.5 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-800/50 mb-1 text-emerald-800 dark:text-emerald-300"
                  >
                    + {task}
                  </div>
                ))}
              </div>
            )}

            {diffStats.actions.removed.length > 0 && (
              <div>
                <p className="text-[11px] font-bold text-red-600 dark:text-red-400 mb-1 flex items-center gap-1">
                  <Minus className="h-3 w-3" /> Removed from Meeting A
                </p>
                {diffStats.actions.removed.map((task, i) => (
                  <div
                    key={i}
                    className="text-xs ml-4 p-1.5 rounded-lg bg-red-50/70 dark:bg-red-950/30 border border-red-200/50 dark:border-red-800/50 mb-1 text-red-800 dark:text-red-300"
                  >
                    - {task}
                  </div>
                ))}
              </div>
            )}

            {diffStats.actions.same.length > 0 && (
              <div>
                <p className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 mb-1 flex items-center gap-1">
                  <Equal className="h-3 w-3" /> Unchanged Across Both
                </p>
                {diffStats.actions.same.map((task, i) => (
                  <div
                    key={i}
                    className="text-xs ml-4 p-1.5 rounded-lg bg-zinc-100/70 dark:bg-zinc-800/30 border border-zinc-200/50 dark:border-zinc-700/50 mb-1 text-zinc-600 dark:text-zinc-400"
                  >
                    = {task}
                  </div>
                ))}
              </div>
            )}

            {diffStats.actions.added.length === 0 &&
              diffStats.actions.removed.length === 0 &&
              diffStats.actions.same.length === 0 && (
                <p className="text-xs text-zinc-400 italic">No action items to compare between the two meetings.</p>
              )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
