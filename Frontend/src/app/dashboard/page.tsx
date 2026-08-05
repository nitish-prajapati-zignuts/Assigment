"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import api from "@/lib/axios";
import { Meeting, ActionItem } from "@/types/meeting";
import { initialMeetings } from "@/data/mockMeetings";
import { MeetingDetailModal } from "@/components/dashboard/MeetingDetailModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Calendar,
  CheckSquare,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  ArrowRight,
  Eye,
  ListTodo,
  FileText,
  AlertCircle,
} from "lucide-react";

export default function DashboardPage() {
  const [meetings, setMeetings] = useState<Meeting[]>(initialMeetings);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [viewingMeeting, setViewingMeeting] = useState<Meeting | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Helper to check if item is overdue
  const checkIsOverdue = (dueDate: string, status: string): boolean => {
    if (!dueDate || dueDate === "Not specified" || status === "Completed") {
      return false;
    }
    const today = new Date().toISOString().split("T")[0];
    return dueDate < today;
  };

  // Fetch meetings and action items from API or fallback
  useEffect(() => {
    const fetchData = async () => {
      // 1. Meetings
      try {
        const res = await api.get("/meetings");
        if (Array.isArray(res.data) && res.data.length > 0) {
          setMeetings(res.data);
        }
      } catch (err) {
        console.log("Using initialMeetings fallback for dashboard.");
      }

      // 2. Action Items
      try {
        const res = await api.get("/action-items");
        if (Array.isArray(res.data) && res.data.length > 0) {
          setActionItems(res.data);
          return;
        }
      } catch (err) {
        console.log("Using fallback action items for dashboard.");
      }

      // Fallback action items aggregated from initialMeetings
      const fallbackList: ActionItem[] = [];
      initialMeetings.forEach((m) => {
        if (m.summary?.actionItems) {
          fallbackList.push(...m.summary.actionItems);
        }
      });
      setActionItems(fallbackList);
    };

    fetchData();
  }, []);

  // Compute Required Metrics
  const metrics = useMemo(() => {
    const totalMeetings = meetings.length;
    const totalActionItems = actionItems.length;

    const openActionItems = actionItems.filter(
      (item) => item.status === "Open" || item.status === "Pending"
    ).length;

    const completedActionItems = actionItems.filter(
      (item) => item.status === "Completed"
    ).length;

    const overdueActionItems = actionItems.filter((item) =>
      checkIsOverdue(item.dueDate, item.status)
    ).length;

    const blockedActionItems = actionItems.filter(
      (item) => item.status === "Blocked"
    ).length;

    const savedTranscripts = meetings.filter(
      (m) => m.transcript && m.transcript.trim().length > 0
    ).length;

    return {
      totalMeetings,
      totalActionItems,
      openActionItems,
      completedActionItems,
      overdueActionItems,
      blockedActionItems,
      savedTranscripts,
    };
  }, [meetings, actionItems]);

  // Top 4 Recently Created Meetings
  const recentMeetings = useMemo(() => {
    return [...meetings]
      .sort(
        (a, b) =>
          new Date(b.createdAt || b.date).getTime() -
          new Date(a.createdAt || a.date).getTime()
      )
      .slice(0, 4);
  }, [meetings]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard Overview</h1>
          <p className="text-sm text-zinc-500">
            Real-time analytics, action tracker status, and recently created meetings.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/action-items">
            <Button variant="outline" className="flex items-center gap-2">
              <ListTodo className="h-4 w-4" />
              Action Tracker
            </Button>
          </Link>
          <Link href="/dashboard/meetings">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Manage Meetings
            </Button>
          </Link>
        </div>
      </div>

      {/* Required Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* 1. Total Meetings */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-zinc-500">
              Total Meetings
            </CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalMeetings}</div>
            <p className="text-[11px] text-zinc-500 mt-1">Scheduled & recorded</p>
          </CardContent>
        </Card>

        {/* 2. Total Action Items */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-zinc-500">
              Total Action Items
            </CardTitle>
            <CheckSquare className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalActionItems}</div>
            <p className="text-[11px] text-zinc-500 mt-1">Across all meetings</p>
          </CardContent>
        </Card>

        {/* 3. Open Action Items */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-zinc-500">
              Open Action Items
            </CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {metrics.openActionItems}
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">Pending resolution</p>
          </CardContent>
        </Card>

        {/* 4. Completed Action Items */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-zinc-500">
              Completed Items
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {metrics.completedActionItems}
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">Resolved tasks</p>
          </CardContent>
        </Card>

        {/* 5. Overdue Action Items */}
        <Card
          className={`hover:shadow-md transition-shadow ${
            metrics.overdueActionItems > 0
              ? "border-red-300 dark:border-red-900 bg-red-50/40 dark:bg-red-950/20"
              : ""
          }`}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-red-600 dark:text-red-400">
              Overdue Items
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500 animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {metrics.overdueActionItems}
            </div>
            <p className="text-[11px] text-red-500/80 font-medium mt-1">
              Requires immediate action
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Meaningful Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-0.5">
              <CardTitle className="text-sm font-semibold">
                Transcripts Saved & Processed
              </CardTitle>
              <CardDescription className="text-xs">
                Transcripts ready for AI summary and action extraction
              </CardDescription>
            </div>
            <FileText className="h-5 w-5 text-zinc-400" />
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="text-2xl font-bold">{metrics.savedTranscripts}</div>
            <Link href="/dashboard/meetings">
              <Button variant="ghost" size="sm" className="text-xs flex items-center gap-1">
                View Meetings <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-0.5">
              <CardTitle className="text-sm font-semibold">
                Blocked Action Items
              </CardTitle>
              <CardDescription className="text-xs">
                Tasks flagged with roadblocks or dependencies
              </CardDescription>
            </div>
            <AlertCircle className="h-5 w-5 text-rose-500" />
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">
              {metrics.blockedActionItems}
            </div>
            <Link href="/dashboard/action-items">
              <Button variant="ghost" size="sm" className="text-xs flex items-center gap-1">
                View Tracker <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* 6. Recently Created Meetings Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold">Recently Created Meetings</CardTitle>
            <CardDescription className="text-xs">
              Latest meeting notes and transcripts uploaded to MeetNotes.
            </CardDescription>
          </div>
          <Link href="/dashboard/meetings">
            <Button variant="outline" size="sm" className="text-xs flex items-center gap-1">
              View All <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Meeting Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Participants</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentMeetings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-zinc-500">
                      No recent meetings recorded yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  recentMeetings.map((meeting) => (
                    <TableRow key={meeting.id}>
                      <TableCell className="font-medium">
                        <button
                          onClick={() => {
                            setViewingMeeting(meeting);
                            setIsDetailModalOpen(true);
                          }}
                          className="hover:underline text-left font-semibold text-zinc-900 dark:text-zinc-100"
                        >
                          {meeting.title}
                        </button>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {meeting.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="flex items-center gap-1 text-xs text-zinc-600 dark:text-zinc-400">
                          <Calendar className="h-3.5 w-3.5" />
                          {meeting.date}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {meeting.participants.slice(0, 2).map((p) => (
                            <span
                              key={p}
                              className="text-[11px] bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded"
                            >
                              {p.split("@")[0]}
                            </span>
                          ))}
                          {meeting.participants.length > 2 && (
                            <span className="text-[11px] text-zinc-500">
                              +{meeting.participants.length - 2}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setViewingMeeting(meeting);
                            setIsDetailModalOpen(true);
                          }}
                          className="h-8 text-xs flex items-center gap-1 ml-auto"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Meeting Detail Modal */}
      <MeetingDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setViewingMeeting(null);
        }}
        meeting={viewingMeeting}
        onEdit={(m) => {
          setIsDetailModalOpen(false);
        }}
      />
    </div>
  );
}
