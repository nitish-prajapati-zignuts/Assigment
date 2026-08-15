"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";
import { Meeting } from "@/types/meeting";
import { MeetingDetailModal } from "@/components/dashboard/MeetingDetailModal";
import api from "@/lib/axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Search, Calendar, Clock, Archive, RefreshCw, FolderOpen, Trash2, Users, Eye } from "lucide-react";
import { EmptyMeetingsIllustration } from "@/components/ui/illustrations";

export default function ArchivePage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewingMeeting, setViewingMeeting] = useState<Meeting | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // TanStack Query for Archived Meetings
  const { data: meetingsResponse, isLoading } = useQuery({
    queryKey: ["archivedMeetings"],
    refetchOnMount: "always",
    queryFn: async () => {
      const res = await api.get("/meetings", {
        params: { isArchived: "true", limit: 50 },
      });
      return res.data;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes cache
  });

  const meetings: Meeting[] = Array.isArray(meetingsResponse?.data)
    ? meetingsResponse.data
    : Array.isArray(meetingsResponse)
      ? meetingsResponse
      : [];

  // TanStack Mutation for Unarchive
  const unarchiveMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.post(`/meetings/${id}/unArchive`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["archivedMeetings"] });
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      queryClient.invalidateQueries({ queryKey: ["meetingsList"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
      toast.success("Meeting restored from archive");
    },
    onError: () => {
      toast.error("Failed to unarchive meeting");
    },
  });

  // TanStack Mutation to Move to Trash (Delete)
  const trashMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.post(`/meetings/${id}/delete`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["archivedMeetings"] });
      queryClient.invalidateQueries({ queryKey: ["trashedMeetings"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
      toast.success("Meeting moved to Trash");
    },
    onError: () => {
      toast.error("Failed to move meeting to Trash");
    },
  });

  const filteredMeetings = useMemo(() => {
    return meetings.filter((meeting) => {
      return (
        meeting.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        meeting.participants.some((p) => p.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (meeting.transcript && meeting.transcript.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    });
  }, [meetings, searchQuery]);

  return (
    <div className="space-y-8 mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
            <Archive className="h-6 w-6 text-[var(--brand)]" />
            <span>Archive Catalog</span>
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Browse and restore previously completed or stored meeting notes and summaries.
          </p>
        </div>
      </div>

      {/* Filter and Search controls */}
      <Card className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md shadow-2xs">
        <CardContent className="p-4 sm:p-5">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3.5 top-3 h-4.5 w-4.5 text-zinc-400" />
            <Input
              placeholder="Search archived title, participant, transcript..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10.5 bg-zinc-50/50 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 text-xs rounded-xl"
            />
          </div>
        </CardContent>
      </Card>

      {/* Main Grid View */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, idx) => (
            <Card key={idx} className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-4">
              <Skeleton className="h-4 w-2/3 rounded" />
              <Skeleton className="h-3 w-1/2 rounded" />
              <div className="flex justify-between items-center pt-4">
                <Skeleton className="h-7 w-20 rounded-md" />
                <Skeleton className="h-7 w-12 rounded-md" />
              </div>
            </Card>
          ))}
        </div>
      ) : filteredMeetings.length === 0 ? (
        <div className="py-20 text-center bg-white/70 dark:bg-zinc-900/70 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 flex flex-col items-center justify-center space-y-4">
          <EmptyMeetingsIllustration className="w-28 h-28 text-zinc-400" />
          <div>
            <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">No archived meetings found.</p>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
              {searchQuery ? "Try refining your search keyword." : "Completed meetings can be stored in the archive."}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredMeetings.map((meeting) => (
              <motion.div
                key={meeting.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300 shadow-xs flex flex-col justify-between h-[210px]">
                  <CardHeader className="p-5 pb-3">
                    <div className="flex justify-between items-start gap-2">
                      <button
                        onClick={() => {
                          setViewingMeeting(meeting);
                          setIsDetailModalOpen(true);
                        }}
                        className="font-bold text-sm text-zinc-900 dark:text-zinc-50 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-left line-clamp-1 cursor-pointer"
                      >
                        {meeting.title}
                      </button>
                      <Badge variant="secondary" className="text-[10px] shrink-0 font-semibold px-2 py-0.5 rounded-md">
                        {meeting.type || "meeting"}
                      </Badge>
                    </div>
                    <CardDescription className="flex items-center gap-1 text-[11px] text-zinc-500 mt-1">
                      <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                      <span>{meeting.date}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-5 pb-5 pt-0 flex-1 flex flex-col justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-zinc-650 dark:text-zinc-400">
                      <Users className="h-4 w-4 text-zinc-400" />
                      <span className="truncate max-w-[200px]" title={meeting.participants.join(", ")}>
                        {meeting.participants.length} participant{meeting.participants.length !== 1 ? "s" : ""}
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800/50 pt-3.5 mt-4">
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => {
                          setViewingMeeting(meeting);
                          setIsDetailModalOpen(true);
                        }}
                        className="h-8 text-xs font-semibold gap-1.5 px-3 border-zinc-200/85 dark:border-zinc-800/80 rounded-xl"
                      >
                        <Eye className="h-3.5 w-3.5 text-zinc-500" />
                        <span>View</span>
                      </Button>

                      <div className="flex items-center gap-2">
                        <Button
                          size="xs"
                          variant="ghost"
                          onClick={() => unarchiveMutation.mutate(meeting.id)}
                          className="h-8 w-8 p-0 text-zinc-600 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 rounded-xl"
                          title="Restore to active meetings"
                          disabled={unarchiveMutation.isPending}
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="xs"
                          variant="ghost"
                          onClick={() => trashMutation.mutate(meeting.id)}
                          className="h-8 w-8 p-0 text-zinc-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl"
                          title="Move to Trash"
                          disabled={trashMutation.isPending}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Meeting Detail Modal */}
      {viewingMeeting && (
        <MeetingDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setViewingMeeting(null);
          }}
          onEdit={() => {}}
          meeting={viewingMeeting}
        />
      )}
    </div>
  );
}
