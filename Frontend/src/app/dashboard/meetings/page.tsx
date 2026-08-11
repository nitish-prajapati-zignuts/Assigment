"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { Meeting } from "@/types/meeting";
import { MeetingModal } from "@/components/dashboard/MeetingModal";
import { MeetingDetailModal } from "@/components/dashboard/MeetingDetailModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Filter,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Share2,
  AlertTriangle,
} from "lucide-react";
import api from "@/lib/axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function MeetingsPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState(1);

  // Pagination constant
  const ITEMS_PER_PAGE = 10;

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [viewingMeeting, setViewingMeeting] = useState<Meeting | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [meetingToDelete, setMeetingToDelete] = useState<Meeting | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // TanStack Query for Meetings with Caching
  const { data: meetingsResponse, isLoading } = useQuery({
    queryKey: ["meetings", currentPage],
    queryFn: async () => {
      const res = await api.get("/meetings", {
        params: { page: currentPage, limit: ITEMS_PER_PAGE },
      });
      return res.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });

  const meetings: Meeting[] = Array.isArray(meetingsResponse?.data)
    ? meetingsResponse.data
    : Array.isArray(meetingsResponse)
      ? meetingsResponse
      : [];

  const totalPages: number = meetingsResponse?.pagination?.totalPages || 1;
  const totalItems: number = meetingsResponse?.pagination?.total || meetings.length;

  // Active background jobs being processed
  const [activeJobIds, setActiveJobIds] = useState<string[]>([]);

  // Poll active jobs and refresh list upon completion
  useEffect(() => {
    if (activeJobIds.length === 0) return;

    const interval = setInterval(async () => {
      let shouldRefresh = false;
      const remainingJobIds: string[] = [];

      for (const jobId of activeJobIds) {
        try {
          const res = await api.get(`/jobs/${jobId}`);
          const status = res.data?.status;

          if (status === "completed" || status === "failed") {
            shouldRefresh = true;
          } else {
            remainingJobIds.push(jobId);
          }
        } catch (err) {
          console.error("Failed checking job status:", err);
        }
      }

      setActiveJobIds(remainingJobIds);

      if (shouldRefresh) {
        queryClient.invalidateQueries({ queryKey: ["meetings"] });
        queryClient.invalidateQueries({ queryKey: ["meetingsList"] });
        queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
        queryClient.invalidateQueries({ queryKey: ["actionItems"] });
        queryClient.invalidateQueries({ queryKey: ["allActionItemsMetrics"] });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [activeJobIds, queryClient]);

  // TanStack Mutation for Save / Create Meeting
  const saveMeetingMutation = useMutation<{ jobId?: string }, Error, Partial<Meeting>>({
    mutationFn: async (meetingData: Partial<Meeting>) => {
      if (meetingData.id) {
        const res = await api.put<Meeting>(`/meetings/${meetingData.id}`, meetingData);
        return res.data as { jobId?: string };
      } else {
        const res = await api.post<{ jobId?: string } & Meeting>("/meetings", meetingData);
        return res.data;
      }
    },
    onSuccess: (data, variables) => {
      if (data?.jobId) {
        setActiveJobIds((prev) => [...prev, data.jobId!]);
      }
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      queryClient.invalidateQueries({ queryKey: ["meetingsList"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
      queryClient.invalidateQueries({ queryKey: ["actionItems"] });
      queryClient.invalidateQueries({ queryKey: ["allActionItemsMetrics"] });
      if (!variables.id) setCurrentPage(1);
    },
    onError: (error) => {
      console.error("Failed to save meeting to database:", error);
      alert("Failed to save meeting. Please check network/server logs.");
    },
  });

  const handleSaveMeeting = async (meetingData: Partial<Meeting>) => {
    await saveMeetingMutation.mutateAsync(meetingData);
    setIsFormModalOpen(false);
  };

  // TanStack Mutation for Delete Meeting
  const deleteMeetingMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/meetings/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      queryClient.invalidateQueries({ queryKey: ["meetingsList"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
      queryClient.invalidateQueries({ queryKey: ["actionItems"] });
      queryClient.invalidateQueries({ queryKey: ["allActionItemsMetrics"] });
    },
  });

  const isDeleting = deleteMeetingMutation.isPending;

  // Client-side filtering (for search and type filter)
  const filteredMeetings = useMemo(() => {
    return meetings.filter((meeting) => {
      const matchesSearch =
        meeting.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        meeting.participants.some((p) =>
          p.toLowerCase().includes(searchQuery.toLowerCase())
        ) ||
        (meeting.transcript &&
          meeting.transcript.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesType =
        selectedType === "All" || meeting.type === selectedType;

      return matchesSearch && matchesType;
    });
  }, [meetings, searchQuery, selectedType]);

  const displayMeetings = filteredMeetings;

  // Open delete confirmation modal
  const handleOpenDeleteModal = (meeting: Meeting) => {
    setMeetingToDelete(meeting);
    setIsDeleteModalOpen(true);
  };

  // Confirm delete action
  const handleConfirmDelete = async () => {
    if (!meetingToDelete) return;
    try {
      await deleteMeetingMutation.mutateAsync(meetingToDelete.id);
      setIsDeleteModalOpen(false);
      setMeetingToDelete(null);
    } catch (error) {
      console.error("Failed to delete meeting from database:", error);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Meeting Management
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Create, search, view, edit, and organize all your team meetings.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingMeeting(null);
            setIsFormModalOpen(true);
          }}
          className="flex items-center gap-2 shadow-sm bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 font-medium"
        >
          <Plus className="h-5 w-5" />
          Create Meeting
        </Button>
      </div>

      {/* Controls: Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-zinc-400" />
          <Input
            placeholder="Search by title, participant, transcript..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-zinc-50/50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-800 focus-visible:ring-zinc-400 text-sm"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 hidden sm:block">
            <Filter className="h-5 w-5 text-zinc-500 dark:text-zinc-400" />
          </div>
          <Select
            value={selectedType}
            onValueChange={(val) => {
              if (val) setSelectedType(val);
            }}
          >
            <SelectTrigger className="w-full sm:w-52 bg-zinc-50/50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-800 text-sm text-zinc-900 dark:text-zinc-100">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
              <SelectItem value="All">All Types</SelectItem>
              <SelectItem value="Client Meeting">Client Meeting</SelectItem>
              <SelectItem value="Sales Meeting">Sales Meeting</SelectItem>
              <SelectItem value="Project Meeting">Project Meeting</SelectItem>
              <SelectItem value="Internal Meeting">Internal Meeting</SelectItem>
              <SelectItem value="Requirement Discussion">
                Requirement Discussion
              </SelectItem>
              <SelectItem value="Retrospective">Retrospective</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Desktop & Tablet Table View */}
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
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12">
                  <div className="flex items-center justify-center gap-2 text-zinc-500">
                    <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
                    <span className="text-sm font-medium">Loading meetings...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : displayMeetings.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-12 text-zinc-500 dark:text-zinc-400"
                >
                  <p className="text-sm font-medium">No meetings found matching your search.</p>
                  <p className="text-xs text-zinc-400 mt-1">Try adjusting your filters or search keywords.</p>
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
                      onClick={() => {
                        setViewingMeeting(meeting);
                        setIsDetailModalOpen(true);
                      }}
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
                        onClick={() => {
                          setViewingMeeting(meeting);
                          setIsDetailModalOpen(true);
                        }}
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
                        onClick={() => {
                          setViewingMeeting(meeting);
                          setIsDetailModalOpen(true);
                        }}
                        className="h-8 w-8 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md"
                        title="View Details"
                      >
                        <Eye className="h-5 w-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingMeeting(meeting);
                          setIsFormModalOpen(true);
                        }}
                        className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-md"
                        title="Edit Meeting"
                      >
                        <Edit className="h-5 w-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDeleteModal(meeting)}
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

      {/* Mobile Responsive Cards View */}
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
                  onClick={() => {
                    setViewingMeeting(meeting);
                    setIsDetailModalOpen(true);
                  }}
                  className="hover:underline text-left font-semibold text-sm text-zinc-900 dark:text-zinc-100"
                >
                  {meeting.title}
                </button>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setViewingMeeting(meeting);
                      setIsDetailModalOpen(true);
                    }}
                    className="h-7 w-7 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    <Eye className="h-4.5 w-4.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditingMeeting(meeting);
                      setIsFormModalOpen(true);
                    }}
                    className="h-7 w-7 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                  >
                    <Edit className="h-4.5 w-4.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpenDeleteModal(meeting)}
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

      {/* Pagination Controls */}
      {!searchQuery && selectedType === "All" && totalItems > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-zinc-900 px-5 py-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm text-xs">
          <div className="text-zinc-500 dark:text-zinc-400 text-center sm:text-left">
            Showing <span className="font-semibold text-zinc-900 dark:text-zinc-100">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{" "}
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">
              {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)}
            </span>{" "}
            of <span className="font-semibold text-zinc-900 dark:text-zinc-100">{totalItems}</span> meetings
          </div>

          <div className="flex flex-wrap items-center justify-center gap-1.5 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="h-8 text-xs flex items-center gap-1 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Previous
            </Button>

            <div className="flex items-center gap-1 px-1">
              {(() => {
                const pages: (number | string)[] = [];
                if (totalPages <= 5) {
                  for (let i = 1; i <= totalPages; i++) pages.push(i);
                } else {
                  pages.push(1);
                  if (currentPage > 3) {
                    pages.push("...");
                  }
                  const start = Math.max(2, currentPage - 1);
                  const end = Math.min(totalPages - 1, currentPage + 1);
                  for (let i = start; i <= end; i++) {
                    if (!pages.includes(i)) pages.push(i);
                  }
                  if (currentPage < totalPages - 2) {
                    pages.push("...");
                  }
                  if (!pages.includes(totalPages)) {
                    pages.push(totalPages);
                  }
                }

                return pages.map((page, idx) =>
                  typeof page === "number" ? (
                    <Button
                      key={idx}
                      variant={currentPage === page ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className={`h-7 w-7 text-xs p-0 font-medium ${currentPage === page
                          ? "bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                          : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                        }`}
                    >
                      {page}
                    </Button>
                  ) : (
                    <span key={idx} className="px-1 text-xs text-zinc-400 font-medium">
                      ...
                    </span>
                  )
                );
              })()}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="h-8 text-xs flex items-center gap-1 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Filtered Results Info (when search/filter is active) */}
      {(searchQuery || selectedType !== "All") && displayMeetings.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 px-5 py-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm text-xs">
          <div className="text-zinc-500 dark:text-zinc-400">
            Found <span className="font-semibold text-zinc-900 dark:text-zinc-100">{displayMeetings.length}</span> matching meeting(s)
            {searchQuery && <span> for &quot;<span className="font-semibold text-zinc-900 dark:text-zinc-100">{searchQuery}</span>&quot;</span>}
            {selectedType !== "All" && <span> in <span className="font-semibold text-zinc-900 dark:text-zinc-100">{selectedType}</span></span>}
          </div>
        </div>
      )}

      {/* Modals */}
      <MeetingModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingMeeting(null);
        }}
        onSave={handleSaveMeeting}
        initialData={editingMeeting}
      />

      <MeetingDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setViewingMeeting(null);
        }}
        meeting={viewingMeeting}
        isSummarizing={!!(viewingMeeting && !viewingMeeting.summary && viewingMeeting.transcript)}
        onEdit={(meeting) => {
          setEditingMeeting(meeting);
          setIsFormModalOpen(true);
        }}
      />

      {/* Modern Delete Confirmation Modal */}
      <Dialog
        open={isDeleteModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsDeleteModalOpen(false);
            setMeetingToDelete(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-[420px] p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl">
          <DialogHeader className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/50 flex items-center justify-center text-red-600 dark:text-red-400 border border-red-200/60 dark:border-red-900/40">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <DialogTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Delete Meeting
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Are you sure you want to delete <span className="font-semibold text-zinc-900 dark:text-zinc-100">&quot;{meetingToDelete?.title}&quot;</span>? This will permanently remove the meeting transcript, AI summary, and action items.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex items-center justify-end gap-2 pt-4 border-t border-zinc-100 dark:border-zinc-800/80">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setMeetingToDelete(null);
              }}
              disabled={isDeleting}
              className="h-9 text-xs font-medium border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="h-9 text-xs font-medium bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-sm flex items-center gap-1.5"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete Meeting
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}