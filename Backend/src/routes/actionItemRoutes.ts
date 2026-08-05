import { Router } from "express";
import {
  getActionItems,
  getActionItemsByMeeting,
  getActionItemById,
  createActionItem,
  updateActionItem,
  deleteActionItem,
} from "../controllers/actionItemController";

const router = Router();

// GET /api/action-items - View all action items (with optional filters: ?meetingId= & ?userId= & ?status= & ?priority=)
router.get("/", getActionItems);

// GET /api/action-items/meeting/:meetingId - View action items for a specific meeting
router.get("/meeting/:meetingId", getActionItemsByMeeting);

// GET /api/action-items/:id - View single action item by ID
router.get("/:id", getActionItemById);

// POST /api/action-items - Add an action item manually
router.post("/", createActionItem);

// PUT /api/action-items/:id - Edit an action item (owner, due date, priority, status, task)
router.put("/:id", updateActionItem);

// DELETE /api/action-items/:id - Delete an action item
router.delete("/:id", deleteActionItem);

export default router;
