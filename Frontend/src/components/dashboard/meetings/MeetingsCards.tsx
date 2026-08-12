import { Meeting } from "@/types/meeting";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Eye, Edit, Trash2, Loader2 } from "lucide-react";

interface MeetingsCardsProps {
  isLoading: boolean;
  displayMeetings: Meeting[];
  onViewDetails: (meeting: Meeting) => void;
  onEdit: (meeting: Meeting) => void;
  onDelete: (meeting: Meeting) => void;
}

export function MeetingsCards({
  isLoading,
  displayMeetings,
  onViewDetails,
  onEdit,
  onDelete,
}: MeetingsCardsProps) {
  return (
    <div className="md:hidden space-y-3">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-500">
          <Loader2 className="h-7 w-7 animate-spin text-zinc-400 mb-2" />
          <span className="text-xs font-medium">Loading meetings...</span>
        </div>
      ) : displayMeetings.length === 0 ? (
        <div className="p-6 text-center bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-500">
          <p className="text-sm font-medium">No meetings found matching your search.</p>
          <p className="text-xs text-zinc-400 mt-1">Try adjusting your filters or search keywords.</p>
        </div>
      ) : (
        displayMeetings.map((meeting) => (
          <div
            key={meeting.id}
            className="p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 shadow-sm space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <button
                onClick={() => onViewDetails(meeting)}
                className="hover:underline text-left font-semibold text-sm text-zinc-900 dark:text-zinc-100"
              >
                {meeting.title}
              </button>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onViewDetails(meeting)}
                  className="h-7 w-7 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <Eye className="h-4.5 w-4.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(meeting)}
                  className="h-7 w-7 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                >
                  <Edit className="h-4.5 w-4.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(meeting)}
                  className="h-7 w-7 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                  <Trash2 className="h-4.5 w-4.5" />
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="text-xs font-normal border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 rounded-md"
              >
                {meeting.type}
              </Badge>
              {!meeting.summary && meeting.transcript && (
                <Badge
                  variant="secondary"
                  className="text-[10px] font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 animate-pulse flex items-center gap-1"
                >
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Summarizing...
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-xs">
              <span className="flex items-center gap-1 text-zinc-600 dark:text-zinc-400 font-medium">
                <Calendar className="h-4.5 w-4.5 text-zinc-400" />
                {meeting.date}
              </span>
              <div className="flex flex-wrap gap-1 max-w-[200px] items-center justify-end">
                {meeting.participants.slice(0, 2).map((p) => (
                  <span
                    key={p}
                    className="text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-1.5 py-0.5 rounded-full border border-zinc-200/60 dark:border-zinc-700/60"
                  >
                    {p.split("@")[0]}
                  </span>
                ))}
                {meeting.participants.length > 2 && (
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">
                    +{meeting.participants.length - 2} more
                  </span>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
