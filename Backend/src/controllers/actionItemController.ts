import { Request, Response } from "express";
import db from "../db";
import { actionItems, users, meetings } from "../db/schema";
import { eq, and, or, inArray, desc, sql } from "drizzle-orm";
import { createNotificationLog } from "./notificationController";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { asyncHandler } from "../middleware/errorHandler";
import { logger } from "../utils/logger";
import { NotFoundError, ValidationError, InternalServerError, AuthorizationError } from "../utils/errors";
import { getPaginationOffset, calculatePagination, buildPaginatedResponse } from "../utils/queryOptimization";
import { ActionItemQueryInput, CreateActionItemInput, UpdateActionItemInput } from "../utils/validation";
import { indexActionItemMemory } from "../services/langchain/memoryIndexer";
import { deleteUserMemoryBySource } from "../services/langchain/vectorStore";
import { invalidateCache } from "../utils/cache";

/**
 * GET /api/action-items
 * Retrieves a filtered and paginated list of action items accessible to the authenticated user.
 * Uses database SQL filters and indexes for maximum performance.
 */
export const getActionItems = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const {
    meetingId,
    status,
    priority,
    page = 1,
    limit = 10,
    sortBy,
    sortOrder,
  } = req.query as unknown as ActionItemQueryInput;
  const currentUserEmail = req.user?.email?.toLowerCase();
  const userId = req.user?.userId;

  if (!currentUserEmail) {
    throw new ValidationError("User email is required");
  }

  try {
    // 1. Fetch user's accessible meeting IDs using PostgreSQL JSONB containment
    const accessibleMeetings = await db
      .select({ id: meetings.id })
      .from(meetings)
      .where(
        and(
          sql`${meetings.participants} @> ${JSON.stringify([currentUserEmail])}::jsonb`,
          eq(meetings.isArchived, false),
          eq(meetings.isDeleted, false)
        )
      );

    const userMeetingIds = accessibleMeetings.map((m) => m.id);

    // 2. Build where conditions for action items
    const conditions = [eq(actionItems.isArchived, false)];

    // Access control: User can view if item is in an accessible meeting OR assigned to them
    const accessConditions = [sql`LOWER(${actionItems.owner}) = ${currentUserEmail}`];
    if (userId) {
      accessConditions.push(eq(actionItems.userId, userId));
    }
    if (userMeetingIds.length > 0) {
      accessConditions.push(inArray(actionItems.meetingId, userMeetingIds));
    }

    conditions.push(or(...accessConditions)!);

    // Additional filters
    if (meetingId) {
      conditions.push(eq(actionItems.meetingId, meetingId));
    }
    if (status && (status as string) !== "All") {
      conditions.push(sql`LOWER(${actionItems.status}) = ${status.toLowerCase()}`);
    }
    if (priority && (priority as string) !== "All") {
      conditions.push(sql`LOWER(${actionItems.priority}) = ${priority.toLowerCase()}`);
    }

    const whereClause = and(...conditions);

    // 3. Parallel query for paginated results + total count
    const offset = getPaginationOffset(Number(page) || 1, Number(limit) || 10);
    const numLimit = Number(limit) || 10;
    const numPage = Number(page) || 1;

    const [paginatedItems, countResult] = await Promise.all([
      db
        .select()
        .from(actionItems)
        .where(whereClause)
        .orderBy(desc(actionItems.createdAt))
        .limit(numLimit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(actionItems)
        .where(whereClause),
    ]);

    const total = countResult[0]?.count || 0;
    const pagination = calculatePagination(numPage, numLimit, total);

    logger.debug("Fetched action items via SQL pushdown", {
      userEmail: currentUserEmail,
      count: paginatedItems.length,
      total,
      page: numPage,
      limit: numLimit,
    });

    res.json(buildPaginatedResponse(paginatedItems, pagination));
  } catch (error) {
    logger.error("Error fetching action items", error as Error, { userEmail: currentUserEmail });
    throw new InternalServerError("Failed to fetch action items");
  }
});

/**
 * GET /api/action-items/meeting/:meetingId
 * Retrieves all action items associated with a specific meeting.
 */
export const getActionItemsByMeeting = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const meetingId = String(req.params.meetingId);

  try {
    // Verify meeting exists and user has access
    const meeting = await db.select().from(meetings).where(eq(meetings.id, meetingId));

    if (meeting.length === 0) {
      throw new NotFoundError("Meeting");
    }

    const userEmail = req.user?.email?.toLowerCase();
    if (
      !Array.isArray(meeting[0].participants) ||
      !meeting[0].participants.some((p: string) => p.toLowerCase() === userEmail)
    ) {
      throw new AuthorizationError("You are not a participant in this meeting");
    }

    // Fetch items using index
    const items = await db.select().from(actionItems).where(eq(actionItems.meetingId, meetingId));

    logger.debug("Fetched meeting action items", { meetingId, count: items.length });

    res.json(items);
  } catch (error) {
    logger.error("Error fetching action items for meeting", error as Error, { meetingId });
    throw error instanceof (Error as any) ? error : new InternalServerError("Failed to fetch action items for meeting");
  }
});

/**
 * GET /api/action-items/:id
 * Retrieves details of a single action item with access control.
 */
export const getActionItemById = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const targetId = String(req.params.id);
  const userEmail = req.user?.email?.toLowerCase();

  try {
    const result = await db.select().from(actionItems).where(eq(actionItems.id, targetId));

    if (result.length === 0) {
      throw new NotFoundError("Action item");
    }

    const actionItem = result[0];

    // Check access: user is meeting participant or assigned to item
    const meeting = await db.select().from(meetings).where(eq(meetings.id, actionItem.meetingId));

    if (meeting.length === 0) {
      throw new NotFoundError("Associated meeting");
    }

    const isMeetingParticipant =
      Array.isArray(meeting[0].participants) &&
      meeting[0].participants.some((p: string) => p.toLowerCase() === userEmail);

    const isAssigned = actionItem.owner?.toLowerCase() === userEmail;

    if (!isMeetingParticipant && !isAssigned) {
      throw new AuthorizationError("You do not have access to this action item");
    }

    logger.debug("Fetched action item", { itemId: targetId });

    res.json(actionItem);
  } catch (error) {
    logger.error("Error fetching action item", error as Error, { itemId: targetId });
    throw error instanceof (Error as any) ? error : new InternalServerError("Failed to fetch action item");
  }
});

/**
 * GET /api/action-items/leaderboard
 * Aggregates task execution metrics per owner for real-time Team Leaderboard.
 */
export const getActionItemsLeaderboard = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const allItems = await db.select().from(actionItems).where(eq(actionItems.isArchived, false));

      const map = new Map<string, { total: number; completed: number; inProgress: number; blocked: number }>();

      allItems.forEach((item) => {
        const ownerName = item.owner || "Unassigned";
        if (!map.has(ownerName)) {
          map.set(ownerName, { total: 0, completed: 0, inProgress: 0, blocked: 0 });
        }
        const stats = map.get(ownerName)!;
        stats.total += 1;
        if (item.status === "Completed") stats.completed += 1;
        else if (item.status === "In Progress") stats.inProgress += 1;
        else if (item.status === "Blocked") stats.blocked += 1;
      });

      const leaderboard = Array.from(map.entries()).map(([owner, stats]) => {
        const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
        let badgeTitle = "Task Contributor";
        let badgeColor = "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200";

        if (completionRate >= 75 && stats.completed > 0) {
          badgeTitle = "Execution Champion 🏆";
          badgeColor = "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300";
        } else if (completionRate >= 40 || stats.completed >= 2) {
          badgeTitle = "Sprint Star ⚡";
          badgeColor = "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300 border-indigo-300";
        } else if (stats.inProgress > 0) {
          badgeTitle = "Task Ninja 🥷";
          badgeColor = "bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border-blue-300";
        }

        return {
          owner,
          totalTasks: stats.total,
          completedTasks: stats.completed,
          inProgressTasks: stats.inProgress,
          blockedTasks: stats.blocked,
          completionRate,
          badgeTitle,
          badgeColor,
        };
      });

      leaderboard.sort((a, b) => b.completionRate - a.completionRate || b.completedTasks - a.completedTasks);

      res.json(leaderboard);
    } catch (error) {
      logger.error("Error fetching leaderboard stats", error as Error);
      throw error instanceof (Error as any) ? error : new InternalServerError("Failed to fetch leaderboard stats");
    }
  }
);

/**
 * POST /api/action-items
 * Manually creates a new action item with automatic user ID matching.
 */
export const createActionItem = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { task, owner, dueDate, priority, status, meetingId } = req.body as CreateActionItemInput;
  const userEmail = req.user?.email;

  try {
    // Verify meeting exists
    const meetingResult = await db.select().from(meetings).where(eq(meetings.id, meetingId));

    if (meetingResult.length === 0) {
      throw new NotFoundError("Associated meeting");
    }

    // Attempt user matching from email
    let matchedUserId: string | null = null;
    if (owner && owner !== "Unassigned") {
      const userResult = await db.select().from(users).where(eq(users.email, owner.toLowerCase().trim())).limit(1);

      if (userResult.length > 0) {
        matchedUserId = userResult[0].id;
      }
    }

    const newItemId = `item-${Date.now()}`;
    const newItem = {
      id: newItemId,
      meetingId,
      userId: matchedUserId,
      task,
      owner: owner || "Unassigned",
      dueDate: dueDate || "Not specified",
      priority: priority || "Medium",
      status: status || "Pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const inserted = await db.insert(actionItems).values(newItem).returning();

    // Auto-index new action item into long-term memory
    if (inserted[0]) {
      await indexActionItemMemory(inserted[0]);
    }

    // Invalidate dashboard cache
    if (userEmail) {
      invalidateCache.dashboard(userEmail);
    }

    logger.info("Action item created and memory indexed", {
      itemId: newItemId,
      meetingId,
      owner,
    });

    createNotificationLog({
      userId: req.user?.userId || (req.user as any)?.id,
      title: "Action Item Created",
      message: `Task "${task}" assigned to ${owner || "Unassigned"}.`,
      type: "general",
    });

    res.status(201).json(inserted[0]);
  } catch (error) {
    logger.error("Error creating action item", error as Error, { meetingId });
    throw error instanceof (Error as any) ? error : new InternalServerError("Failed to create action item");
  }
});

/**
 * PUT /api/action-items/:id
 * Updates an action item with optional user ID re-matching.
 */
export const updateActionItem = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const targetId = String(req.params.id);
  const { task, owner, dueDate, priority, status } = req.body as UpdateActionItemInput;
  const userEmail = req.user?.email;

  try {
    const existing = await db.select().from(actionItems).where(eq(actionItems.id, targetId));

    if (existing.length === 0) {
      throw new NotFoundError("Action item");
    }

    // Attempt user re-matching if owner changes
    let updatedUserId = existing[0].userId;
    if (owner && owner !== existing[0].owner && owner !== "Unassigned") {
      const userResult = await db.select().from(users).where(eq(users.email, owner.toLowerCase().trim())).limit(1);

      if (userResult.length > 0) {
        updatedUserId = userResult[0].id;
      }
    }

    const updated = await db
      .update(actionItems)
      .set({
        ...(task ? { task } : {}),
        ...(owner !== undefined ? { owner: owner || "Unassigned" } : {}),
        ...(updatedUserId !== undefined ? { userId: updatedUserId } : {}),
        ...(dueDate !== undefined ? { dueDate: dueDate || "Not specified" } : {}),
        ...(priority ? { priority } : {}),
        ...(status ? { status } : {}),
        updatedAt: new Date(),
      })
      .where(eq(actionItems.id, targetId))
      .returning();

    // Auto-update action item memory
    if (updated[0]) {
      await indexActionItemMemory(updated[0]);
    }

    // Invalidate dashboard cache
    if (userEmail) {
      invalidateCache.dashboard(userEmail);
    }

    logger.info("Action item updated and memory re-indexed", { itemId: targetId });

    createNotificationLog({
      userId: req.user?.userId || (req.user as any)?.id,
      title: status ? `Task Status: ${status}` : "Task Updated",
      message: `Task "${updated[0].task}" was updated.`,
      type: status === "Completed" ? "general" : "overdue_task",
    });

    res.json(updated[0]);
  } catch (error) {
    logger.error("Error updating action item", error as Error, { itemId: targetId });
    throw error instanceof (Error as any) ? error : new InternalServerError("Failed to update action item");
  }
});

/**
 * DELETE /api/action-items/:id
 * Permanently removes an action item from the database.
 */
export const deleteActionItem = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const targetId = String(req.params.id);
  const userEmail = req.user?.email;

  try {
    const deleted = await db.delete(actionItems).where(eq(actionItems.id, targetId)).returning();

    if (deleted.length === 0) {
      throw new NotFoundError("Action item");
    }

    // Delete memory chunk
    await deleteUserMemoryBySource(targetId);

    // Invalidate dashboard cache
    if (userEmail) {
      invalidateCache.dashboard(userEmail);
    }

    logger.info("Action item deleted and memory cleared", { itemId: targetId });

    createNotificationLog({
      userId: req.user?.userId || (req.user as any)?.id,
      title: "Action Item Deleted",
      message: `Task "${deleted[0].task}" was permanently removed.`,
      type: "general",
    });

    res.json({
      message: "Action item deleted successfully",
      actionItem: deleted[0],
    });
  } catch (error) {
    logger.error("Error deleting action item", error as Error, { itemId: targetId });
    throw error instanceof (Error as any) ? error : new InternalServerError("Failed to delete action item");
  }
});
