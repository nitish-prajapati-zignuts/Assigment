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
import { Plus, Search, Eye, Edit, Trash2, Calendar, Filter, Loader2 } from "lucide-react";
import api from "@/lib/axios";

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("All");

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [viewingMeeting, setViewingMeeting] = useState<Meeting | null>(null);

  // Fetch meetings from backend API / Database
  const fetchMeetings = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get<Meeting[]>("/meetings");
      setMeetings(response.data);
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Meeting Management</h1>
          <p className="text-sm text-zinc-500">
            Create, search, view, edit, and organize all your team meetings.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingMeeting(null);
            setIsFormModalOpen(true);
          }}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Meeting
        </Button>
      </div>

      {/* Controls: Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-zinc-900 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Search by title, participant, transcript..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-zinc-500" />
          <Select
            value={selectedType}
            onValueChange={(val) => {
              if (val) setSelectedType(val);
            }}
          >
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
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

      {/* Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Participants</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <div className="flex items-center justify-center gap-2 text-zinc-500">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Loading meetings...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredMeetings.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-zinc-500"
                >
                  No meetings found matching your search.
                </TableCell>
              </TableRow>
            ) : (
              filteredMeetings.map((meeting) => (
                <TableRow key={meeting.id}>
                  <TableCell className="font-medium">
                    <button
                      onClick={() => {
                        setViewingMeeting(meeting);
                        setIsDetailModalOpen(true);
                      }}
                      className="hover:underline text-left"
                    >
                      {meeting.title}
                    </button>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{meeting.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1 text-sm text-zinc-600 dark:text-zinc-400">
                      <Calendar className="h-3.5 w-3.5" />
                      {meeting.date}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {meeting.participants.slice(0, 2).map((p) => (
                        <span
                          key={p}
                          className="text-xs bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded"
                        >
                          {p.split("@")[0]}
                        </span>
                      ))}
                      {meeting.participants.length > 2 && (
                        <span className="text-xs text-zinc-500">
                          +{meeting.participants.length - 2} more
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setViewingMeeting(meeting);
                          setIsDetailModalOpen(true);
                        }}
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
                        title="Edit Meeting"
                      >
                        <Edit className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteMeeting(meeting.id)}
                        title="Delete Meeting"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

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
