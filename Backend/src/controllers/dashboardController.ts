import { Response } from "express";
import db from "../db";
import { meetings, actionItems } from "../db/schema";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { asyncHandler } from "../middleware/errorHandler";
import { logger } from "../utils/logger";
import { ValidationError, InternalServerError } from "../utils/errors";

/**
 * GET /api/dashboard/stats
 * Returns summary metrics and recent meetings for dashboard overview
 */
export const getDashboardStats = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const currentUserEmail = req.user?.email?.toLowerCase();

  if (!currentUserEmail) {
    throw new ValidationError("User email is required");
  }

  try {
    // 1. Fetch user's accessible meetings
    const allMeetings = await db.select().from(meetings);
    const userMeetings = allMeetings.filter(
      (m: { participants: any[] }) =>
        Array.isArray(m.participants) && m.participants.some((p: string) => p.toLowerCase() === currentUserEmail)
    );

    const userMeetingIds = new Set(userMeetings.map((m: { id: string }) => m.id));

    // 2. Fetch accessible action items
    const allItems = await db.select().from(actionItems);
    const userActionItems = allItems.filter((item) => {
      const isMeetingParticipant = userMeetingIds.has(item.meetingId);
      const isUserAssigned = item.owner?.toLowerCase() === currentUserEmail;
      return isMeetingParticipant || isUserAssigned;
    });

    // 3. Compute Metrics
    const today = new Date().toISOString().split("T")[0];

    const totalMeetings = userMeetings.length;
    const totalActionItems = userActionItems.length;

    const openActionItems = userActionItems.filter((item) => {
      const s = item.status?.toLowerCase() || "";
      return s === "open" || s === "pending" || s === "in progress" || s === "in_progress";
    }).length;

    const completedActionItems = userActionItems.filter((item) => item.status?.toLowerCase() === "completed").length;

    const overdueActionItems = userActionItems.filter((item) => {
      if (!item.dueDate || item.dueDate === "Not specified" || item.status?.toLowerCase() === "completed") {
        return false;
      }
      return item.dueDate < today;
    }).length;

    const blockedActionItems = userActionItems.filter((item) => item.status?.toLowerCase() === "blocked").length;

    const savedTranscripts = userMeetings.filter((m) => m.transcript && m.transcript.trim().length > 0).length;

    // 4. Top 4 Recent Meetings
    const recentMeetings = [...userMeetings]
      .sort((a, b) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime())
      .slice(0, 4);

    // 5. Compute Analytics Chart Data
    // A. Meetings Timeline (Grouped by month/date string)
    const timelineMap: Record<string, { date: string; meetingsCount: number; transcriptsCount: number }> = {};

    // Sort meetings chronologically
    const sortedMeetings = [...userMeetings].sort(
      (a, b) => new Date(a.createdAt || a.date).getTime() - new Date(b.createdAt || b.date).getTime()
    );

    sortedMeetings.forEach((m) => {
      const d = m.createdAt ? new Date(m.createdAt) : new Date(m.date);
      const dateKey = isNaN(d.getTime()) ? m.date : d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

      if (!timelineMap[dateKey]) {
        timelineMap[dateKey] = { date: dateKey, meetingsCount: 0, transcriptsCount: 0 };
      }
      timelineMap[dateKey].meetingsCount += 1;
      if (m.transcript && m.transcript.trim().length > 0) {
        timelineMap[dateKey].transcriptsCount += 1;
      }
    });

    const meetingsTimeline = Object.values(timelineMap);

    // B. Action Items Status Distribution
    const statusCounts: Record<string, number> = {
      Open: 0,
      "In Progress": 0,
      Completed: 0,
      Blocked: 0,
      Pending: 0,
    };

    userActionItems.forEach((item) => {
      const st = item.status || "Pending";
      const matchedKey = Object.keys(statusCounts).find((k) => k.toLowerCase() === st.toLowerCase()) || "Open";
      statusCounts[matchedKey] = (statusCounts[matchedKey] || 0) + 1;
    });

    const actionItemsStatusDistribution = Object.entries(statusCounts)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({ name, value }));

    // C. Action Items Priority Distribution
    const priorityCounts: Record<string, number> = {
      Low: 0,
      Medium: 0,
      High: 0,
      Urgent: 0,
    };

    userActionItems.forEach((item) => {
      const pr = item.priority || "Medium";
      const matchedKey = Object.keys(priorityCounts).find((k) => k.toLowerCase() === pr.toLowerCase()) || "Medium";
      priorityCounts[matchedKey] = (priorityCounts[matchedKey] || 0) + 1;
    });

    const actionItemsPriorityDistribution = Object.entries(priorityCounts).map(([name, value]) => ({ name, value }));

    // D. Key Decisions Categories Breakdown
    const decisionCategoriesMap: Record<string, number> = {};
    userMeetings.forEach((m) => {
      if (m.summary && Array.isArray(m.summary.keyDecisions)) {
        m.summary.keyDecisions.forEach((kd) => {
          const cat = kd.category || "General Decision";
          decisionCategoriesMap[cat] = (decisionCategoriesMap[cat] || 0) + 1;
        });
      }
    });

    const keyDecisionsBreakdown = Object.entries(decisionCategoriesMap).map(([category, count]) => ({
      category,
      count,
    }));

    logger.debug("Fetched dashboard stats & chart analytics", { userEmail: currentUserEmail });

    res.json({
      metrics: {
        totalMeetings,
        totalActionItems,
        openActionItems,
        completedActionItems,
        overdueActionItems,
        blockedActionItems,
        savedTranscripts,
      },
      recentMeetings,
      charts: {
        meetingsTimeline,
        actionItemsStatusDistribution,
        actionItemsPriorityDistribution,
        keyDecisionsBreakdown,
      },
    });
  } catch (error) {
    logger.error("Error fetching dashboard stats", error as Error, { userEmail: currentUserEmail });
    throw new InternalServerError("Failed to fetch dashboard statistics");
  }
});
