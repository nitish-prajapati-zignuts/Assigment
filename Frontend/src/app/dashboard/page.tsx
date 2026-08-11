"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import api from "@/lib/axios";
import { Meeting, ActionItem } from "@/types/meeting";
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
  Loader2,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@radix-ui/react-tabs";
import { BarChart3, LayoutDashboard } from "lucide-react";
import AnalyticsCharts, { DashboardChartsData } from "@/components/AnalyticsCharts";

interface DashboardMetrics {
  totalMeetings: number;
  totalActionItems: number;
  openActionItems: number;
  completedActionItems: number;
  overdueActionItems: number;
  blockedActionItems: number;
  savedTranscripts: number;
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalMeetings: 0,
    totalActionItems: 0,
    openActionItems: 0,
    completedActionItems: 0,
    overdueActionItems: 0,
    blockedActionItems: 0,
    savedTranscripts: 0,
  });
  const [recentMeetings, setRecentMeetings] = useState<Meeting[]>([]);
  const [chartsData, setChartsData] = useState<DashboardChartsData>({});
  const [isLoading, setIsLoading] = useState(true);
  const [viewingMeeting, setViewingMeeting] = useState<Meeting | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Fetch dashboard stats from backend /api/dashboard/stats
  useEffect(() => {
    const fetchDashboardStats = async () => {
      setIsLoading(true);
      try {
        const response = await api.get("/dashboard/stats");
        if (response.data?.metrics) {
          setMetrics(response.data.metrics);
        }
        if (Array.isArray(response.data?.recentMeetings)) {
          setRecentMeetings(response.data.recentMeetings);
        }
        if (response.data?.charts) {
          setChartsData(response.data.charts);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard stats from API:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Dashboard Overview
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Real-time analytics, action tracker status, and recently created meetings.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <Link href="/dashboard/action-items" className="w-full sm:w-auto">
            <Button
              variant="outline"
              className="w-full sm:w-auto flex items-center justify-center gap-2 shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100"
            >
              <ListTodo className="h-5 w-5 text-zinc-500" />
              Action Tracker
            </Button>
          </Link>
          <Link href="/dashboard/meetings" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto flex items-center justify-center gap-2 shadow-sm bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 font-medium">
              <Plus className="h-5 w-5" />
              Manage Meetings
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs defaultValue="overview" className="w-full space-y-6">
        <TabsList className="flex w-fit items-center gap-2 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          <TabsTrigger
            value="overview"
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all text-zinc-600 dark:text-zinc-400 data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-900 dark:data-[state=active]:text-zinc-100 data-[state=active]:shadow-sm cursor-pointer"
          >
            <LayoutDashboard className="h-5 w-5" />
            Overview & Metrics
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all text-zinc-600 dark:text-zinc-400 data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-900 dark:data-[state=active]:text-zinc-100 data-[state=active]:shadow-sm cursor-pointer"
          >
            <BarChart3 className="h-5 w-5" />
            Visual Analytics & Charts
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: Overview & Metrics */}
        <TabsContent value="overview" className="space-y-8 outline-none">

      {/* Required Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* 1. Total Meetings */}
        <Card className="rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm transition-all duration-200 hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Total Meetings
            </CardTitle>
            <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800/80">
              <Calendar className="h-5 w-5 text-zinc-600 dark:text-zinc-300" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-7 w-7 animate-spin text-zinc-400 my-1" />
            ) : (
              <div className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                {metrics.totalMeetings}
              </div>
            )}
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
              Scheduled & recorded
            </p>
          </CardContent>
        </Card>

        {/* 2. Total Action Items */}
        <Card className="rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm transition-all duration-200 hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Total Action Items
            </CardTitle>
            <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800/80">
              <CheckSquare className="h-5 w-5 text-zinc-600 dark:text-zinc-300" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-7 w-7 animate-spin text-zinc-400 my-1" />
            ) : (
              <div className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                {metrics.totalActionItems}
              </div>
            )}
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
              Across all meetings
            </p>
          </CardContent>
        </Card>

        {/* 3. Open Action Items */}
        <Card className="rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm transition-all duration-200 hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Open Action Items
            </CardTitle>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Clock className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-7 w-7 animate-spin text-zinc-400 my-1" />
            ) : (
              <div className="text-3xl font-bold tracking-tight text-amber-600 dark:text-amber-400">
                {metrics.openActionItems}
              </div>
            )}
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
              Pending resolution
            </p>
          </CardContent>
        </Card>

        {/* 4. Completed Action Items */}
        <Card className="rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm transition-all duration-200 hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Completed Items
            </CardTitle>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-7 w-7 animate-spin text-zinc-400 my-1" />
            ) : (
              <div className="text-3xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
                {metrics.completedActionItems}
              </div>
            )}
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
              Resolved tasks
            </p>
          </CardContent>
        </Card>

        {/* 5. Overdue Action Items */}
        <Card
          className={`rounded-xl border transition-all duration-200 hover:shadow-md ${metrics.overdueActionItems > 0
            ? "border-red-200 dark:border-red-900/50 bg-red-50/30 dark:bg-red-950/10"
            : "border-zinc-200/80 dark:border-zinc-800/80 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm hover:border-zinc-300 dark:hover:border-zinc-700"
            }`}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-red-600 dark:text-red-400">
              Overdue Items
            </CardTitle>
            <div className="p-2 rounded-lg bg-red-500/10 text-red-500">
              <AlertTriangle className="h-5 w-5 animate-pulse" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-7 w-7 animate-spin text-zinc-400 my-1" />
            ) : (
              <div className="text-3xl font-bold tracking-tight text-red-600 dark:text-red-400">
                {metrics.overdueActionItems}
              </div>
            )}
            <p className="text-[11px] text-red-500/90 font-medium mt-1">
              Requires immediate action
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Meaningful Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 shadow-sm transition-all hover:shadow">
          <CardHeader className="flex flex-row items-start justify-between pb-2">
            <div className="space-y-1">
              <CardTitle className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Transcripts Saved & Processed
              </CardTitle>
              <CardDescription className="text-xs text-zinc-500 dark:text-zinc-400">
                Transcripts ready for AI summary and action extraction
              </CardDescription>
            </div>
            <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800">
              <FileText className="h-5 w-5 text-zinc-500 dark:text-zinc-400" />
            </div>
          </CardHeader>
          <CardContent className="flex items-center justify-between pt-2">
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {metrics.savedTranscripts}
            </div>
            <Link href="/dashboard/meetings">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                View Meetings <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 shadow-sm transition-all hover:shadow">
          <CardHeader className="flex flex-row items-start justify-between pb-2">
            <div className="space-y-1">
              <CardTitle className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Blocked Action Items
              </CardTitle>
              <CardDescription className="text-xs text-zinc-500 dark:text-zinc-400">
                Tasks flagged with roadblocks or dependencies
              </CardDescription>
            </div>
            <div className="p-2 rounded-lg bg-rose-500/10">
              <AlertCircle className="h-5 w-5 text-rose-500" />
            </div>
          </CardHeader>
          <CardContent className="flex items-center justify-between pt-2">
            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">
              {metrics.blockedActionItems}
            </div>
            <Link href="/dashboard/action-items">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs gap-1.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                Manage Tasks <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

        {/* 6. Recently Created Meetings Section */}
        <Card className="rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/50 py-4 px-6">
            <div className="space-y-0.5">
              <CardTitle className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Recently Created Meetings
              </CardTitle>
              <CardDescription className="text-xs text-zinc-500 dark:text-zinc-400">
                Latest meeting notes and transcripts uploaded to MeetNotes.
              </CardDescription>
            </div>
            <Link href="/dashboard/meetings">
              <Button
                variant="outline"
                size="sm"
                className="text-xs flex items-center gap-1.5 border-zinc-200 dark:border-zinc-800 shadow-sm text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                View All <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30 hover:bg-transparent">
                    <TableHead className="font-semibold text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider pl-6 py-3">
                      Meeting Title
                    </TableHead>
                    <TableHead className="font-semibold text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider py-3">
                      Type
                    </TableHead>
                    <TableHead className="font-semibold text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider py-3">
                      Date
                    </TableHead>
                    <TableHead className="font-semibold text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider py-3">
                      Participants
                    </TableHead>
                    <TableHead className="font-semibold text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider pr-6 py-3 text-right">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12">
                        <div className="flex items-center justify-center gap-2 text-zinc-500">
                          <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
                          <span className="text-sm font-medium">Loading recent meetings...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : recentMeetings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12 text-zinc-500 dark:text-zinc-400">
                        <p className="text-sm">No meetings recorded yet.</p>
                        <p className="text-xs text-zinc-400 mt-1">Click &quot;Manage Meetings&quot; to get started.</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentMeetings.map((meeting) => (
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
                            <Calendar className="h-4.5 w-4.5 text-zinc-400" />
                            {meeting.date}
                          </span>
                        </TableCell>
                        <TableCell className="py-3.5">
                          <div className="flex flex-wrap gap-1 items-center">
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
                                +{meeting.participants.length - 2}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right pr-6 py-3.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setViewingMeeting(meeting);
                              setIsDetailModalOpen(true);
                            }}
                            className="h-8 text-xs font-medium flex items-center gap-1.5 ml-auto text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                          >
                            <Eye className="h-4 w-4 text-zinc-500" />
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
        </TabsContent>

        {/* TAB 2: Visual Analytics & Charts */}
        <TabsContent value="analytics" className="outline-none">
          <AnalyticsCharts data={chartsData} />
        </TabsContent>
      </Tabs>

      {/* Meeting Detail Modal */}
      <MeetingDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setViewingMeeting(null);
        }}
        meeting={viewingMeeting}
        hideShareableSection={true}
        onEdit={() => {
          setIsDetailModalOpen(false);
        }}
      />
    </div>
  );
}