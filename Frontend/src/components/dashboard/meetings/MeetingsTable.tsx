import { Meeting } from "@/types/meeting";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, Eye, Edit, Trash2, Share2, Loader2, Archive } from "lucide-react";
import { EmptyMeetingsIllustration } from "@/components/ui/illustrations";

interface MeetingsTableProps {
  isLoading: boolean;
  displayMeetings: Meeting[];
  onViewDetails: (meeting: Meeting) => void;
  onEdit: (meeting: Meeting) => void;
  onDelete: (meeting: Meeting) => void;
  onArchive: (meeting: Meeting) => void
}

export function MeetingsTable({ isLoading, displayMeetings, onViewDetails, onEdit, onDelete, onArchive }: MeetingsTableProps) {
  return (
    <div className="hidden md:block bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 overflow-hidden shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30 hover:bg-transparent">
            <TableHead className="font-semibold text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider pl-6 py-3.5">
              Title
            </TableHead>
            <TableHead className="font-semibold text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider py-3.5">
              Type
            </TableHead>
            <TableHead className="font-semibold text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider py-3.5">
              Date
            </TableHead>
            <TableHead className="font-semibold text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider py-3.5">
              Participants
            </TableHead>
            <TableHead className="font-semibold text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider pr-6 py-3.5 text-right">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, idx) => (
              <TableRow key={idx} className="border-b border-zinc-100 dark:border-zinc-800/50">
                <TableCell className="pl-6 py-4">
                  <Skeleton className="h-4 w-48 rounded-md" />
                </TableCell>
                <TableCell className="py-4">
                  <Skeleton className="h-4 w-24 rounded-md" />
                </TableCell>
                <TableCell className="py-4">
                  <Skeleton className="h-4 w-28 rounded-md" />
                </TableCell>
                <TableCell className="py-4">
                  <Skeleton className="h-4 w-36 rounded-md" />
                </TableCell>
                <TableCell className="pr-6 py-4 text-right">
                  <Skeleton className="h-6 w-20 rounded-md ml-auto" />
                </TableCell>
              </TableRow>
            ))
          ) : displayMeetings.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-16 text-zinc-500 dark:text-zinc-400">
                <div className="flex flex-col items-center justify-center space-y-3">
                  <EmptyMeetingsIllustration className="w-24 h-24 text-zinc-400" />
                  <div>
                    <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">No meetings found matching your search.</p>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">Try adjusting your filters or search keywords.</p>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            displayMeetings.map((meeting) => (
              <TableRow
                key={meeting.id}
                className="border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors"
              >
                <TableCell className="font-medium pl-6 py-3.5">
                  <button
                    onClick={() => onViewDetails(meeting)}
                    className="hover:underline text-left font-semibold text-zinc-900 dark:text-zinc-100 transition-colors"
                  >
                    {meeting.title}
                  </button>
                </TableCell>
                <TableCell className="py-3.5">
                  <div className="flex items-center gap-1.5">
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
                </TableCell>
                <TableCell className="py-3.5">
                  <span className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                    <Calendar className="h-4.5 w-4.5 text-zinc-400" />
                    {meeting.date}
                  </span>
                </TableCell>
                <TableCell className="py-3.5">
                  <div className="flex flex-wrap gap-1 max-w-[220px] items-center">
                    {meeting.participants.slice(0, 2).map((p) => (
                      <span
                        key={p}
                        className="text-[11px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-2 py-0.5 rounded-full border border-zinc-200/60 dark:border-zinc-700/60"
                      >
                        {p.split("@")[0]}
                      </span>
                    ))}
                    {meeting.participants.length > 2 && (
                      <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium ml-0.5">
                        +{meeting.participants.length - 2} more
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right pr-6 py-3.5">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onViewDetails(meeting)}
                      className={`h-8 w-8 rounded-md ${meeting.isMeetingPublished
                        ? "text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                        : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        }`}
                      title={meeting.isMeetingPublished ? "Shareable Link Active" : "Share Meeting"}
                    >
                      <Share2 className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onViewDetails(meeting)}
                      className="h-8 w-8 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md"
                      title="View Details"
                    >
                      <Eye className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(meeting)}
                      className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-md"
                      title="Edit Meeting"
                    >
                      <Edit className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onArchive(meeting)}
                      className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-md"
                      title="Edit Meeting"
                    >
                      <Archive className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(meeting)}
                      className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md"
                      title="Delete Meeting"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
