"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import api from "@/lib/axios";
import { callService } from "@/lib/serviceApi";
import { SERVICE_IDS } from "@/lib/serviceIds";
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
      return await callService({
        serviceId: SERVICE_IDS.DASHBOARD.STATS,
        payload: {},
        params: {},
        query: {},
      });
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
    <div className="space-y-8 mx-auto px-4 sm:px-6 lg:px-8 ">
      {/* Header */}
      <DashboardHeader />

      {/* Tabs Navigation */}
      <Tabs defaultValue="overview" className="w-full space-y-6">
        <DashboardTabsList />

        {/* TAB 1: Overview & Metrics */}
        <TabsContent value="overview" className="space-y-8 outline-none">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="space-y-8"
          >
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
          </motion.div>
        </TabsContent>

        {/* TAB 2: Visual Analytics & Charts */}
        <TabsContent value="analytics" className="outline-none">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <AnalyticsCharts data={chartsData} />
          </motion.div>
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
