import { Response } from "express";
import db from "../db";
import { notifications } from "../db/schema";
import { eq, desc, and } from "drizzle-orm";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { asyncHandler } from "../middleware/errorHandler";
import { logger } from "../utils/logger";

/**
 * Helper to log a new notification in DB
 */
export async function createNotificationLog({
  userId,
  title,
  message,
  type = "general",
}: {
  userId: string;
  title: string;
  message: string;
  type?: "ai_summary" | "overdue_task" | "security_access" | "general";
}) {
  if (!userId) return;
  try {
    await db.insert(notifications).values({
      userId,
      title,
      message,
      type,
      isRead: false,
    });
  } catch (err) {
    logger.error("Failed to create notification log", err as Error);
  }
}

/**
 * GET /api/notifications
 * Fetch user's notifications (auto-seeds welcome log if empty)
 */
export const getNotifications = asyncHandler(async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const userId = req.user?.userId || (req.user as any)?.id;

  if (!userId) {
    res.json({ notifications: [], unreadCount: 0 });
    return;
  }

  let logs = await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(30);

  // Auto-seed welcome notifications if table is empty for user
  if (logs.length === 0) {
    await db.insert(notifications).values([
      {
        userId,
        title: "Welcome to MeetNotes AI! 🎉",
        message: "Your AI transcript summarizer and Action Tracker are live.",
        type: "general",
        isRead: false,
      },
      {
        userId,
        title: "AI Prompt Engine Ready",
        message: "Custom AI prompt templates and sentiment analytics configured.",
        type: "ai_summary",
        isRead: false,
      },
    ]);

    logs = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(30);
  }

  const unreadCount = logs.filter((n) => !n.isRead).length;

  res.json({
    notifications: logs,
    unreadCount,
  });
});

/**
 * PATCH /api/notifications/read-all
 * Mark all notifications as read
 */
export const markAllNotificationsRead = asyncHandler(async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const userId = req.user?.userId || (req.user as any)?.id;

  if (userId) {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
  }

  res.json({ message: "All notifications marked as read" });
});

/**
 * DELETE /api/notifications
 * Clear user's notifications
 */
export const clearNotifications = asyncHandler(async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const userId = req.user?.userId || (req.user as any)?.id;

  if (userId) {
    await db.delete(notifications).where(eq(notifications.userId, userId));
  }

  res.json({ message: "Notifications cleared" });
});
