"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteActionItem = exports.updateActionItem = exports.createActionItem = exports.getActionItemById = exports.getActionItemsByMeeting = exports.getActionItems = void 0;
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
/**
 * GET /api/action-items
 * View all action items with optional filtering by meetingId, userId, status, or priority
 */
const getActionItems = async (req, res) => {
    try {
        const { meetingId, userId, status, priority } = req.query;
        const allItems = await db_1.db.select().from(schema_1.actionItems);
        let filtered = allItems;
        if (meetingId && typeof meetingId === "string") {
            filtered = filtered.filter((item) => item.meetingId === meetingId);
        }
        if (userId && typeof userId === "string") {
            filtered = filtered.filter((item) => item.userId === userId);
        }
        if (status && typeof status === "string") {
            filtered = filtered.filter((item) => item.status?.toLowerCase() === status.toLowerCase());
        }
        if (priority && typeof priority === "string") {
            filtered = filtered.filter((item) => item.priority?.toLowerCase() === priority.toLowerCase());
        }
        res.json(filtered);
    }
    catch (error) {
        console.error("Error fetching action items:", error);
        res.status(500).json({ error: "Failed to fetch action items" });
    }
};
exports.getActionItems = getActionItems;
/**
 * GET /api/action-items/meeting/:meetingId
 * View action items for a specific meeting
 */
const getActionItemsByMeeting = async (req, res) => {
    try {
        const meetingId = String(req.params.meetingId);
        const items = await db_1.db
            .select()
            .from(schema_1.actionItems)
            .where((0, drizzle_orm_1.eq)(schema_1.actionItems.meetingId, meetingId));
        res.json(items);
    }
    catch (error) {
        console.error("Error fetching action items for meeting:", error);
        res.status(500).json({ error: "Failed to fetch action items for meeting" });
    }
};
exports.getActionItemsByMeeting = getActionItemsByMeeting;
/**
 * GET /api/action-items/:id
 * View single action item by ID
 */
const getActionItemById = async (req, res) => {
    try {
        const targetId = String(req.params.id);
        const result = await db_1.db
            .select()
            .from(schema_1.actionItems)
            .where((0, drizzle_orm_1.eq)(schema_1.actionItems.id, targetId));
        if (result.length === 0) {
            res.status(404).json({ error: "Action item not found" });
            return;
        }
        res.json(result[0]);
    }
    catch (error) {
        console.error("Error fetching action item:", error);
        res.status(500).json({ error: "Failed to fetch action item" });
    }
};
exports.getActionItemById = getActionItemById;
/**
 * POST /api/action-items
 * Add an action item manually
 */
const createActionItem = async (req, res) => {
    try {
        const { meetingId, task, owner, userId, dueDate, priority, status } = req.body;
        if (!meetingId || !task) {
            res.status(400).json({ error: "meetingId and task description are required." });
            return;
        }
        // Verify meeting exists
        const meetingResult = await db_1.db
            .select()
            .from(schema_1.meetings)
            .where((0, drizzle_orm_1.eq)(schema_1.meetings.id, String(meetingId)));
        if (meetingResult.length === 0) {
            res.status(404).json({ error: "Associated meeting not found." });
            return;
        }
        // Attempt to match userId if not explicitly passed
        let finalUserId = userId ? String(userId) : null;
        if (!finalUserId && owner && owner !== "Unassigned") {
            const matchedUser = await db_1.db
                .select()
                .from(schema_1.users)
                .where((0, drizzle_orm_1.eq)(schema_1.users.email, owner.toLowerCase().trim()));
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
        const inserted = await db_1.db
            .insert(schema_1.actionItems)
            .values(newItem)
            .returning();
        res.status(201).json(inserted[0]);
    }
    catch (error) {
        console.error("Error creating action item:", error);
        res.status(500).json({ error: "Failed to create action item" });
    }
};
exports.createActionItem = createActionItem;
/**
 * PUT /api/action-items/:id
 * Edit an action item (assign owner, due date, priority, status, task description)
 */
const updateActionItem = async (req, res) => {
    try {
        const targetId = String(req.params.id);
        const { task, owner, userId, dueDate, priority, status } = req.body;
        const existing = await db_1.db
            .select()
            .from(schema_1.actionItems)
            .where((0, drizzle_orm_1.eq)(schema_1.actionItems.id, targetId));
        if (existing.length === 0) {
            res.status(404).json({ error: "Action item not found" });
            return;
        }
        // Optional user matching if owner changes
        let updatedUserId = userId !== undefined ? (userId ? String(userId) : null) : existing[0].userId;
        if (owner && owner !== existing[0].owner && !userId) {
            const matchedUser = await db_1.db
                .select()
                .from(schema_1.users)
                .where((0, drizzle_orm_1.eq)(schema_1.users.email, String(owner).toLowerCase().trim()));
            if (matchedUser.length > 0) {
                updatedUserId = matchedUser[0].id;
            }
        }
        const updated = await db_1.db
            .update(schema_1.actionItems)
            .set({
            ...(task ? { task: String(task).trim() } : {}),
            ...(owner !== undefined ? { owner: String(owner).trim() } : {}),
            ...(updatedUserId !== undefined ? { userId: updatedUserId } : {}),
            ...(dueDate !== undefined ? { dueDate: String(dueDate).trim() } : {}),
            ...(priority ? { priority: String(priority).trim() } : {}),
            ...(status ? { status: String(status).trim() } : {}),
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(schema_1.actionItems.id, targetId))
            .returning();
        res.json(updated[0]);
    }
    catch (error) {
        console.error("Error updating action item:", error);
        res.status(500).json({ error: "Failed to update action item" });
    }
};
exports.updateActionItem = updateActionItem;
/**
 * DELETE /api/action-items/:id
 * Delete an action item
 */
const deleteActionItem = async (req, res) => {
    try {
        const targetId = String(req.params.id);
        const deleted = await db_1.db
            .delete(schema_1.actionItems)
            .where((0, drizzle_orm_1.eq)(schema_1.actionItems.id, targetId))
            .returning();
        if (deleted.length === 0) {
            res.status(404).json({ error: "Action item not found" });
            return;
        }
        res.json({
            message: "Action item deleted successfully",
            actionItem: deleted[0],
        });
    }
    catch (error) {
        console.error("Error deleting action item:", error);
        res.status(500).json({ error: "Failed to delete action item" });
    }
};
exports.deleteActionItem = deleteActionItem;
