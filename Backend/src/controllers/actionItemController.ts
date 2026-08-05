import { Request, Response } from "express";
import { db } from "../db";
import { actionItems, users, meetings } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { AuthenticatedRequest } from "../middleware/authMiddleware";

/**
 * GET /api/action-items
 * Retrieves a filtered and paginated list of action items accessible to the authenticated user.
 * Access is granted if the user is a participant in the meeting or explicitly assigned to the task.
 * 
 * @param req - Authenticated Express request object containing user session info and query parameters:
 *              `meetingId`, `userId`, `status`, `priority`, `page`, `limit`.
 * @param res - Express response object for returning JSON payload of action items or paginated items object.
 * @returns Promise<void>
 */
export const getActionItems = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { meetingId, userId, status, priority } = req.query;
    const currentUserId = req.user?.userId;
    const currentUserEmail = req.user?.email?.toLowerCase();
    const currentUserName = req.user?.name?.toLowerCase();

    // 1. Fetch user's accessible meetings
    const allMeetings = await db.select().from(meetings);
    const userMeetingIds = new Set(
      allMeetings
        .filter(
          (m) =>
            currentUserEmail &&
            Array.isArray(m.participants) &&
            m.participants.some((p) => p.toLowerCase() === currentUserEmail)
        )
        .map((m) => m.id)
    );

    const allItems = await db.select().from(actionItems);

    // 2. Filter items: Belongs to accessible meeting OR assigned to user
    let filtered = allItems.filter((item) => {
      const isMeetingParticipant = userMeetingIds.has(item.meetingId);
      const itemOwnerLow = item.owner?.toLowerCase() || "";
      const isUserAssigned =
        (currentUserId && item.userId === currentUserId) ||
        (currentUserEmail && itemOwnerLow === currentUserEmail) ||
        (currentUserName &&
          itemOwnerLow.length > 0 &&
          itemOwnerLow.includes(currentUserName.split(" ")[0]));

      return isMeetingParticipant || isUserAssigned;
    });

    if (meetingId && typeof meetingId === "string") {
      filtered = filtered.filter((item) => item.meetingId === meetingId);
    }

    if (userId && typeof userId === "string") {
      filtered = filtered.filter((item) => item.userId === userId);
    }

    if (status && typeof status === "string") {
      filtered = filtered.filter(
        (item) => item.status?.toLowerCase() === status.toLowerCase()
      );
    }

    if (priority && typeof priority === "string") {
      filtered = filtered.filter(
        (item) => item.priority?.toLowerCase() === priority.toLowerCase()
      );
    }

    const page = req.query.page ? parseInt(String(req.query.page), 10) : undefined;
    const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : undefined;

    if (page !== undefined || limit !== undefined) {
      const pageNum = page && page > 0 ? page : 1;
      const limitNum = limit && limit > 0 ? limit : 10;
      const total = filtered.length;
      const totalPages = Math.ceil(total / limitNum) || 1;
      const startIndex = (pageNum - 1) * limitNum;
      const items = filtered.slice(startIndex, startIndex + limitNum);

      res.json({
        items,
        total,
        page: pageNum,
        totalPages,
        limit: limitNum,
      });
      return;
    }

    res.json(filtered);
  } catch (error) {
    console.error("Error fetching action items:", error);
    res.status(500).json({ error: "Failed to fetch action items" });
  }
};

/**
 * GET /api/action-items/meeting/:meetingId
 * Retrieves all action items associated with a specific meeting by meeting ID.
 * 
 * @param req - Authenticated Express request object containing route parameter `meetingId`.
 * @param res - Express response object returning array of action items for the meeting.
 * @returns Promise<void>
 */
export const getActionItemsByMeeting = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const meetingId = String(req.params.meetingId);

    const items = await db
      .select()
      .from(actionItems)
      .where(eq(actionItems.meetingId, meetingId));

    res.json(items);
  } catch (error) {
    console.error("Error fetching action items for meeting:", error);
    res.status(500).json({ error: "Failed to fetch action items for meeting" });
  }
};

/**
 * GET /api/action-items/:id
 * Retrieves details of a single action item by its unique ID.
 * 
 * @param req - Authenticated Express request object containing route parameter `id`.
 * @param res - Express response object returning action item JSON object or 404 error.
 * @returns Promise<void>
 */
export const getActionItemById = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const targetId = String(req.params.id);

    const result = await db
      .select()
      .from(actionItems)
      .where(eq(actionItems.id, targetId));

    if (result.length === 0) {
      res.status(404).json({ error: "Action item not found" });
      return;
    }

    res.json(result[0]);
  } catch (error) {
    console.error("Error fetching action item:", error);
    res.status(500).json({ error: "Failed to fetch action item" });
  }
};

/**
 * POST /api/action-items
 * Manually creates a new action item associated with an existing meeting.
 * Automatically attempts user ID matching if an owner email is specified.
 * 
 * @param req - Authenticated Express request object containing request body:
 *              `meetingId`, `task`, `owner`, `userId`, `dueDate`, `priority`, `status`.
 * @param res - Express response object returning HTTP 201 with created action item JSON.
 * @returns Promise<void>
 */
export const createActionItem = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { meetingId, task, owner, userId, dueDate, priority, status } = req.body;

    if (!meetingId || !task) {
      res.status(400).json({ error: "meetingId and task description are required." });
      return;
    }

    // Verify meeting exists
    const meetingResult = await db
      .select()
      .from(meetings)
      .where(eq(meetings.id, String(meetingId)));

    if (meetingResult.length === 0) {
      res.status(404).json({ error: "Associated meeting not found." });
      return;
    }

    // Attempt to match userId if not explicitly passed
    let finalUserId: string | null = userId ? String(userId) : null;
    if (!finalUserId && owner && owner !== "Unassigned") {
      const matchedUser = await db
        .select()
        .from(users)
        .where(eq(users.email, owner.toLowerCase().trim()));
      if (matchedUser.length > 0) {
        finalUserId = matchedUser[0].id;
      }
    }

    const newItemId = `item-${Date.now()}`;

    const newItem = {
      id: newItemId,
      meetingId: String(meetingId),
      userId: finalUserId,
      task: String(task).trim(),
      owner: owner ? String(owner).trim() : "Unassigned",
      dueDate: dueDate ? String(dueDate).trim() : "Not specified",
      priority: priority ? String(priority).trim() : "Medium",
      status: status ? String(status).trim() : "Open",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const inserted = await db
      .insert(actionItems)
      .values(newItem)
      .returning();

    res.status(201).json(inserted[0]);
  } catch (error) {
    console.error("Error creating action item:", error);
    res.status(500).json({ error: "Failed to create action item" });
  }
};

/**
 * PUT /api/action-items/:id
 * Updates an existing action item's task description, owner, assignee, due date, priority, or status.
 * Re-evaluates user ID mapping if the owner email changes.
 * 
 * @param req - Authenticated Express request object with route parameter `id` and body updates:
 *              `task`, `owner`, `userId`, `dueDate`, `priority`, `status`.
 * @param res - Express response object returning updated action item JSON.
 * @returns Promise<void>
 */
export const updateActionItem = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const targetId = String(req.params.id);
    const { task, owner, userId, dueDate, priority, status } = req.body;

    const existing = await db
      .select()
      .from(actionItems)
      .where(eq(actionItems.id, targetId));

    if (existing.length === 0) {
      res.status(404).json({ error: "Action item not found" });
      return;
    }

    // Optional user matching if owner changes
    let updatedUserId = userId !== undefined ? (userId ? String(userId) : null) : existing[0].userId;

    if (owner && owner !== existing[0].owner && !userId) {
      const matchedUser = await db
        .select()
        .from(users)
        .where(eq(users.email, String(owner).toLowerCase().trim()));
      if (matchedUser.length > 0) {
        updatedUserId = matchedUser[0].id;
      }
    }

    const updated = await db
      .update(actionItems)
      .set({
        ...(task ? { task: String(task).trim() } : {}),
        ...(owner !== undefined ? { owner: String(owner).trim() } : {}),
        ...(updatedUserId !== undefined ? { userId: updatedUserId } : {}),
        ...(dueDate !== undefined ? { dueDate: String(dueDate).trim() } : {}),
        ...(priority ? { priority: String(priority).trim() } : {}),
        ...(status ? { status: String(status).trim() } : {}),
        updatedAt: new Date(),
      })
      .where(eq(actionItems.id, targetId))
      .returning();

    res.json(updated[0]);
  } catch (error) {
    console.error("Error updating action item:", error);
    res.status(500).json({ error: "Failed to update action item" });
  }
};

/**
 * DELETE /api/action-items/:id
 * Permanently removes an action item from the database.
 * 
 * @param req - Authenticated Express request object containing route parameter `id`.
 * @param res - Express response object returning deletion confirmation message and deleted item object.
 * @returns Promise<void>
 */
export const deleteActionItem = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const targetId = String(req.params.id);

    const deleted = await db
      .delete(actionItems)
      .where(eq(actionItems.id, targetId))
      .returning();

    if (deleted.length === 0) {
      res.status(404).json({ error: "Action item not found" });
      return;
    }

    res.json({
      message: "Action item deleted successfully",
      actionItem: deleted[0],
    });
  } catch (error) {
    console.error("Error deleting action item:", error);
    res.status(500).json({ error: "Failed to delete action item" });
  }
};
