"use client";

import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { Meeting } from "@/types/meeting";
import { exportMeetingsToCSV } from "@/lib/exportUtils";
import { MeetingModal } from "@/components/dashboard/MeetingModal";

import { MeetingDetailModal } from "@/components/dashboard/MeetingDetailModal";
import api from "@/lib/axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  MeetingsHeader,
  MeetingsFilters,
  MeetingsTable,
  MeetingsCards,
  MeetingsPagination,
  DeleteMeetingModal,
} from "@/components/dashboard/meetings";

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
            if (status === "completed") {
              toast.success("AI Summary & Action Items processing completed!");
            } else {
              toast.error("AI Summary background job failed.");
            }
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
        toast.info("Meeting saved! Generating AI Summary in background...");
      } else {
        toast.success(
          variables.id ? "Meeting updated successfully" : "Meeting created successfully"
        );
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
      toast.error("Failed to save meeting. Please check server connection.");
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
      toast.success("Meeting deleted successfully");
    },
    onError: (error) => {
      console.error("Failed to delete meeting:", error);
      toast.error("Failed to delete meeting");
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

  const isFilterActive = Boolean(searchQuery) || selectedType !== "All";

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <MeetingsHeader
        onCreateClick={() => {
          setEditingMeeting(null);
          setIsFormModalOpen(true);
        }}
        onExportCSV={() => {
          if (displayMeetings.length === 0) {
            toast.error("No meetings available to export");
            return;
          }
          exportMeetingsToCSV(displayMeetings);
          toast.success(`Exported ${displayMeetings.length} meetings to CSV`);
        }}
      />


      {/* Controls: Search and Filter */}
      <MeetingsFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
      />

      {/* Desktop & Tablet Table View */}
      <MeetingsTable
        isLoading={isLoading}
        displayMeetings={displayMeetings}
        onViewDetails={(meeting) => {
          setViewingMeeting(meeting);
          setIsDetailModalOpen(true);
        }}
        onEdit={(meeting) => {
          setEditingMeeting(meeting);
          setIsFormModalOpen(true);
        }}
        onDelete={handleOpenDeleteModal}
      />

      {/* Mobile Responsive Cards View */}
      <MeetingsCards
        isLoading={isLoading}
        displayMeetings={displayMeetings}
        onViewDetails={(meeting) => {
          setViewingMeeting(meeting);
          setIsDetailModalOpen(true);
        }}
        onEdit={(meeting) => {
          setEditingMeeting(meeting);
          setIsFormModalOpen(true);
        }}
        onDelete={handleOpenDeleteModal}
      />

      {/* Pagination Controls */}
      <MeetingsPagination
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={ITEMS_PER_PAGE}
        isFilterActive={isFilterActive}
        displayCount={displayMeetings.length}
        searchQuery={searchQuery}
        selectedType={selectedType}
      />

      {/* Form Modal (Create / Edit) */}
      <MeetingModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingMeeting(null);
        }}
        onSave={handleSaveMeeting}
        initialData={editingMeeting}
      />

      {/* Details Modal */}
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

      {/* Delete Confirmation Modal */}
      <DeleteMeetingModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setMeetingToDelete(null);
        }}
        meetingToDelete={meetingToDelete}
        onConfirmDelete={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}