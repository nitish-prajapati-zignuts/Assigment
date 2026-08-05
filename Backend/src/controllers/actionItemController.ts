import { Request, Response } from "express";
import { db } from "../db";
import { actionItems, users, meetings } from "../db/schema";
import { eq, and } from "drizzle-orm";

/**
 * GET /api/action-items
 * View all action items with optional filtering by meetingId, userId, status, or priority
 */
export const getActionItems = async (req: Request, res: Response): Promise<void> => {
  try {
    const { meetingId, userId, status, priority } = req.query;

    const allItems = await db.select().from(actionItems);
    let filtered = allItems;

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

    res.json(filtered);
  } catch (error) {
    console.error("Error fetching action items:", error);
    res.status(500).json({ error: "Failed to fetch action items" });
  }
};

/**
 * GET /api/action-items/meeting/:meetingId
 * View action items for a specific meeting
 */
export const getActionItemsByMeeting = async (
  req: Request,
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
 * View single action item by ID
 */
export const getActionItemById = async (
  req: Request,
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
 * Add an action item manually
 */
export const createActionItem = async (
  req: Request,
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
 * Edit an action item (assign owner, due date, priority, status, task description)
 */
export const updateActionItem = async (
  req: Request,
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
 * Delete an action item
 */
export const deleteActionItem = async (
  req: Request,
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
