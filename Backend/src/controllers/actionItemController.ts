import { Request, Response } from "express";
import db from "../db";
import { actionItems, users, meetings } from "../db/schema";
import { eq } from "drizzle-orm";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { asyncHandler } from "../middleware/errorHandler";
import { logger } from "../utils/logger";
import { 
  NotFoundError, 
  ValidationError, 
  InternalServerError,
  AuthorizationError 
} from "../utils/errors";
import {
  getPaginationOffset,
  calculatePagination,
  buildPaginatedResponse
} from "../utils/queryOptimization";
import { ActionItemQueryInput, CreateActionItemInput, UpdateActionItemInput } from "../utils/validation";

/**
 * GET /api/action-items
 * Retrieves a filtered and paginated list of action items accessible to the authenticated user.
 * Uses database indexes for efficient filtering.
 */
export const getActionItems = asyncHandler(async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { meetingId, status, priority, page, limit, sortBy, sortOrder } = req.query as unknown as ActionItemQueryInput;
  const currentUserEmail = req.user?.email?.toLowerCase();

  if (!currentUserEmail) {
    throw new ValidationError("User email is required");
  }

  try {
    // Fetch user's accessible meetings (use indexes)
    const allMeetings = await db.select().from(meetings);
    const userMeetingIds = new Set(
      allMeetings
        .filter(
          (m: { participants: any[]; }) =>
            Array.isArray(m.participants) &&
            m.participants.some((p: string) => p.toLowerCase() === currentUserEmail)
        )
        .map((m: { id: any; }) => m.id)
    );

    // Fetch all action items (in production, filter at DB level using indexes)
    const allItems = await db.select().from(actionItems);

    // Filter items: Belongs to accessible meeting OR assigned to user
    let filtered = allItems.filter((item) => {
      const isMeetingParticipant = userMeetingIds.has(item.meetingId);
      const itemOwnerLow = item.owner?.toLowerCase() || "";
      const isUserAssigned = currentUserEmail && itemOwnerLow === currentUserEmail;

      return isMeetingParticipant || isUserAssigned;
    });

    // Apply additional filters
    if (meetingId) {
      filtered = filtered.filter((item: { meetingId: string; }) => item.meetingId === meetingId);
    }

    if (status) {
      filtered = filtered.filter(
        (item: { status: string | null; }) => item.status?.toLowerCase() === status.toLowerCase()
      );
    }

    if (priority) {
      filtered = filtered.filter(
        (item: { priority: string | null; }) => item.priority?.toLowerCase() === priority.toLowerCase()
      );
    }

    // Calculate pagination
    const offset = getPaginationOffset(page, limit);
    const total = filtered.length;
    const paginatedItems = filtered.slice(offset, offset + limit);
    const pagination = calculatePagination(page, limit, total);

    logger.debug("Fetched action items", {
      userEmail: currentUserEmail,
      count: paginatedItems.length,
      total,
      page,
      limit,
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
export const getActionItemsByMeeting = asyncHandler(async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const meetingId = String(req.params.meetingId);

  try {
    // Verify meeting exists and user has access
    const meeting = await db
      .select()
      .from(meetings)
      .where(eq(meetings.id, meetingId));

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
    const items = await db
      .select()
      .from(actionItems)
      .where(eq(actionItems.meetingId, meetingId));

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
export const getActionItemById = asyncHandler(async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const targetId = String(req.params.id);
  const userEmail = req.user?.email?.toLowerCase();

  try {
    const result = await db
      .select()
      .from(actionItems)
      .where(eq(actionItems.id, targetId));

    if (result.length === 0) {
      throw new NotFoundError("Action item");
    }

    const actionItem = result[0];

    // Check access: user is meeting participant or assigned to item
    const meeting = await db
      .select()
      .from(meetings)
      .where(eq(meetings.id, actionItem.meetingId));

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
 * POST /api/action-items
 * Manually creates a new action item with automatic user ID matching.
 */
export const createActionItem = asyncHandler(async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { task, owner, dueDate, priority, status, meetingId } = req.body as CreateActionItemInput;

  try {
    // Verify meeting exists
    const meetingResult = await db
      .select()
      .from(meetings)
      .where(eq(meetings.id, meetingId));

    if (meetingResult.length === 0) {
      throw new NotFoundError("Associated meeting");
    }

    // Attempt user matching from email
    let matchedUserId: string | null = null;
    if (owner && owner !== "Unassigned") {
      const userResult = await db
        .select()
        .from(users)
        .where(eq(users.email, owner.toLowerCase().trim()));

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

    const inserted = await db
      .insert(actionItems)
      .values(newItem)
      .returning();

    logger.info("Action item created", {
      itemId: newItemId,
      meetingId,
      owner,
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
export const updateActionItem = asyncHandler(async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const targetId = String(req.params.id);
  const { task, owner, dueDate, priority, status } = req.body as UpdateActionItemInput;

  try {
    const existing = await db
      .select()
      .from(actionItems)
      .where(eq(actionItems.id, targetId));

    if (existing.length === 0) {
      throw new NotFoundError("Action item");
    }

    // Attempt user re-matching if owner changes
    let updatedUserId = existing[0].userId;
    if (owner && owner !== existing[0].owner && owner !== "Unassigned") {
      const userResult = await db
        .select()
        .from(users)
        .where(eq(users.email, owner.toLowerCase().trim()));

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

    logger.info("Action item updated", { itemId: targetId });

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
export const deleteActionItem = asyncHandler(async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const targetId = String(req.params.id);

  try {
    const deleted = await db
      .delete(actionItems)
      .where(eq(actionItems.id, targetId))
      .returning();

    if (deleted.length === 0) {
      throw new NotFoundError("Action item");
    }

    logger.info("Action item deleted", { itemId: targetId });

    res.json({
      message: "Action item deleted successfully",
      actionItem: deleted[0],
    });
  } catch (error) {
    logger.error("Error deleting action item", error as Error, { itemId: targetId });
    throw error instanceof (Error as any) ? error : new InternalServerError("Failed to delete action item");
  }
});
