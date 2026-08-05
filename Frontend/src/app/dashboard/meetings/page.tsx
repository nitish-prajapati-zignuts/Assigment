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
} from "lucide-react";
import api from "@/lib/axios";

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("All");

  // Pagination state (Limit 10 meetings per page)
  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [viewingMeeting, setViewingMeeting] = useState<Meeting | null>(null);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedType]);

  // Fetch meetings from backend API / Database
  const fetchMeetings = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/meetings");
      const resData = Array.isArray(response.data)
        ? response.data
        : response.data.items || [];
      setMeetings(resData);
    } catch (error) {
      console.error("Failed to fetch meetings from database:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  // Search & Filter
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

  // Pagination Calculations
  const totalPages = useMemo(() => {
    return Math.ceil(filteredMeetings.length / ITEMS_PER_PAGE) || 1;
  }, [filteredMeetings.length]);

  const paginatedMeetings = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredMeetings.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredMeetings, currentPage]);

  // Create or Update meeting in Database
  const handleSaveMeeting = async (meetingData: Partial<Meeting>) => {
    try {
      if (meetingData.id) {
        // Edit existing meeting
        const response = await api.put<Meeting>(
          `/meetings/${meetingData.id}`,
          meetingData
        );
        setMeetings((prev) =>
          prev.map((m) => (m.id === meetingData.id ? response.data : m))
        );
      } else {
        // Create new meeting
        const response = await api.post<Meeting>("/meetings", meetingData);
        setMeetings((prev) => [response.data, ...prev]);
      }
    } catch (error) {
      console.error("Failed to save meeting to database:", error);
      alert("Failed to save meeting. Please check network/server logs.");
    }
  };

  // Delete meeting from Database
  const handleDeleteMeeting = async (id: string) => {
    if (confirm("Are you sure you want to delete this meeting?")) {
      try {
        await api.delete(`/meetings/${id}`);
        setMeetings((prev) => prev.filter((m) => m.id !== id));
      } catch (error) {
        console.error("Failed to delete meeting from database:", error);
        alert("Failed to delete meeting. Please try again.");
      }
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
          className="flex items-center gap-2 shadow-sm bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 font-medium"
        >
          <Plus className="h-4 w-4" />
          Create Meeting
        </Button>
      </div>

      {/* Controls: Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Search by title, participant, transcript..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-zinc-50/50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-800 focus-visible:ring-zinc-400 text-sm"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 hidden sm:block">
            <Filter className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
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

      {/* Table Container */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 overflow-hidden shadow-sm">
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
                    <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
                    <span className="text-sm font-medium">Loading meetings...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : paginatedMeetings.length === 0 ? (
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
              paginatedMeetings.map((meeting) => (
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
                    <Badge
                      variant="outline"
                      className="text-xs font-normal border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 rounded-md"
                    >
                      {meeting.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3.5">
                    <span className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                      <Calendar className="h-3.5 w-3.5 text-zinc-400" />
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
                        className="h-8 w-8 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
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
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteMeeting(meeting.id)}
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md"
                        title="Delete Meeting"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {filteredMeetings.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-zinc-900 px-5 py-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm text-xs">
          <div className="text-zinc-500 dark:text-zinc-400">
            Showing <span className="font-semibold text-zinc-900 dark:text-zinc-100">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{" "}
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredMeetings.length)}
            </span>{" "}
            of <span className="font-semibold text-zinc-900 dark:text-zinc-100">{filteredMeetings.length}</span> meetings
          </div>

          <div className="flex items-center gap-1.5">
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
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
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
              ))}
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
        onEdit={(meeting) => {
          setEditingMeeting(meeting);
          setIsFormModalOpen(true);
        }}
      />
    </div>
  );
}