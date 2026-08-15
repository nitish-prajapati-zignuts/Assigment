"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Meeting } from "@/types/meeting";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Eye, Edit, Trash2, Loader2, Archive, Pin, PinOff } from "lucide-react";
import { EmptyMeetingsIllustration } from "@/components/ui/illustrations";

interface MeetingsCardsProps {
  isLoading: boolean;
  displayMeetings: Meeting[];
  onViewDetails: (meeting: Meeting) => void;
  onEdit: (meeting: Meeting) => void;
  onDelete: (meeting: Meeting) => void;
  onArchive: (meeting: Meeting) => void;
  onTogglePin: (meeting: Meeting) => void;
}

export function MeetingsCards({
  isLoading,
  displayMeetings,
  onViewDetails,
  onEdit,
  onDelete,
  onArchive,
  onTogglePin,
}: MeetingsCardsProps) {
  return (
    <div className="md:hidden space-y-3">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-8 bg-white/80 dark:bg-zinc-900/80 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-zinc-500">
          <Loader2 className="h-7 w-7 animate-spin text-indigo-500 mb-2" />
          <span className="text-xs font-medium">Loading meetings...</span>
        </div>
      ) : displayMeetings.length === 0 ? (
        <div className="p-8 text-center bg-white/80 dark:bg-zinc-900/80 rounded-2xl border border-zinc-200/85 dark:border-zinc-800/80 text-zinc-500 flex flex-col items-center justify-center space-y-3">
          <EmptyMeetingsIllustration className="w-20 h-20 text-zinc-400" />
          <div>
            <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
              No meetings found matching your search.
            </p>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
              Try adjusting your filters or search keywords.
            </p>
          </div>
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          {displayMeetings.map((meeting, idx) => (
            <motion.div
              layout
              key={meeting.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 350, damping: 35 }}
              className="p-4.5 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md shadow-xs hover:shadow-elevated hover:border-indigo-200/40 dark:hover:border-indigo-800/30 transition-all duration-300 space-y-3 gradient-top-stripe"
            >
              <div className="flex items-start justify-between gap-2">
                <button
                  onClick={() => onViewDetails(meeting)}
                  className="hover:underline text-left font-bold text-sm text-zinc-900 dark:text-zinc-100"
                >
                  {meeting.title}
                </button>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onTogglePin(meeting)}
                    className={`h-7 w-7 rounded-lg ${
                      meeting.isPinned
                        ? "text-indigo-650 hover:bg-indigo-50 dark:hover:bg-indigo-950/30"
                        : "text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    }`}
                    title={meeting.isPinned ? "Unpin Meeting" : "Pin Meeting"}
                  >
                    {meeting.isPinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onViewDetails(meeting)}
                    className="h-7 w-7 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(meeting)}
                    className="h-7 w-7 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-lg"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onArchive(meeting)}
                    className="h-7 w-7 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 rounded-lg"
                  >
                    <Archive className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(meeting)}
                    className="h-7 w-7 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="text-xs font-semibold border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 rounded-lg"
                >
                  {meeting.type}
                </Badge>
                {!meeting.summary && meeting.transcript && (
                  <Badge
                    variant="secondary"
                    className="text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 animate-pulse flex items-center gap-1 rounded-md"
                  >
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Summarizing...
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-xs">
                <span className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400 font-medium">
                  <Calendar className="h-4 w-4 text-zinc-400" />
                  {meeting.date}
                </span>
                <div className="flex flex-wrap gap-1 max-w-[200px] items-center justify-end">
                  {meeting.participants.slice(0, 2).map((p) => (
                    <span
                      key={p}
                      className="text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-2 py-0.5 rounded-full border border-zinc-200/60 dark:border-zinc-700/60"
                    >
                      {p.split("@")[0]}
                    </span>
                  ))}
                  {meeting.participants.length > 2 && (
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-semibold">
                      +{meeting.participants.length - 2} more
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      )}
    </div>
  );
}
