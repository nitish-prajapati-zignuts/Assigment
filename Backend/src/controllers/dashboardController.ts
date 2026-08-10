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
export const getDashboardStats = asyncHandler(async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const currentUserEmail = req.user?.email?.toLowerCase();

  if (!currentUserEmail) {
    throw new ValidationError("User email is required");
  }

  try {
    // 1. Fetch user's accessible meetings
    const allMeetings = await db.select().from(meetings);
    const userMeetings = allMeetings.filter(
      (m: { participants: any[] }) =>
        Array.isArray(m.participants) &&
        m.participants.some((p: string) => p.toLowerCase() === currentUserEmail)
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

    const completedActionItems = userActionItems.filter(
      (item) => item.status?.toLowerCase() === "completed"
    ).length;

    const overdueActionItems = userActionItems.filter((item) => {
      if (!item.dueDate || item.dueDate === "Not specified" || item.status?.toLowerCase() === "completed") {
        return false;
      }
      return item.dueDate < today;
    }).length;

    const blockedActionItems = userActionItems.filter(
      (item) => item.status?.toLowerCase() === "blocked"
    ).length;

    const savedTranscripts = userMeetings.filter(
      (m) => m.transcript && m.transcript.trim().length > 0
    ).length;

    // 4. Top 4 Recent Meetings
    const recentMeetings = [...userMeetings]
      .sort(
        (a, b) =>
          new Date(b.createdAt || b.date).getTime() -
          new Date(a.createdAt || a.date).getTime()
      )
      .slice(0, 4);

    logger.debug("Fetched dashboard stats", { userEmail: currentUserEmail });

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
    });
  } catch (error) {
    logger.error("Error fetching dashboard stats", error as Error, { userEmail: currentUserEmail });
    throw new InternalServerError("Failed to fetch dashboard statistics");
  }
});
