"use client";

import { useState } from "react";
import api from "@/lib/axios";
import { Meeting } from "@/types/meeting";
import { MeetingDetailModal } from "@/components/dashboard/MeetingDetailModal";
import { Tabs, TabsContent } from "@radix-ui/react-tabs";
import AnalyticsCharts, { DashboardChartsData } from "@/components/AnalyticsCharts";
import { useQuery } from "@tanstack/react-query";
import {
  DashboardMetrics,
  DashboardHeader,
  DashboardTabsList,
  DashboardMetricsGrid,
  DashboardIndicatorsGrid,
  RecentMeetingsSection,
} from "@/components/dashboard/overview";

export default function DashboardPage() {
  const [viewingMeeting, setViewingMeeting] = useState<Meeting | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // TanStack Query for Dashboard Overview Stats with Caching
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      const res = await api.get("/dashboard/stats");
      return res.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });

  const metrics: DashboardMetrics = dashboardData?.metrics || {
    totalMeetings: 0,
    totalActionItems: 0,
    openActionItems: 0,
    completedActionItems: 0,
    overdueActionItems: 0,
    blockedActionItems: 0,
    savedTranscripts: 0,
  };

  const recentMeetings: Meeting[] = dashboardData?.recentMeetings || [];
  const chartsData: DashboardChartsData = dashboardData?.charts || {};

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <DashboardHeader />

      {/* Tabs Navigation */}
      <Tabs defaultValue="overview" className="w-full space-y-6">
        <DashboardTabsList />

        {/* TAB 1: Overview & Metrics */}
        <TabsContent value="overview" className="space-y-8 outline-none">
          {/* Required Statistics Grid */}
          <DashboardMetricsGrid metrics={metrics} isLoading={isLoading} />

          {/* Secondary Meaningful Indicators */}
          <DashboardIndicatorsGrid metrics={metrics} />

          {/* Recently Created Meetings Section */}
          <RecentMeetingsSection
            isLoading={isLoading}
            recentMeetings={recentMeetings}
            onViewDetails={(meeting) => {
              setViewingMeeting(meeting);
              setIsDetailModalOpen(true);
            }}
          />
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