import { Router } from "express";
import {
  getActionItems,
  getActionItemsByMeeting,
  getActionItemById,
  getActionItemsLeaderboard,
  createActionItem,
  updateActionItem,
  deleteActionItem,
} from "../controllers/actionItemController";
import { protect } from "../middleware/authMiddleware";
import { validateBody, validateQuery, validateParams } from "../middleware/validation";
import {
  createActionItemSchema,
  updateActionItemSchema,
  actionItemQuerySchema,
  idSchema,
} from "../utils/validation";

const router = Router();

// Protect all action item endpoints
router.use(protect);

// GET /api/action-items - View all action items with filtering and pagination
router.get("/", validateQuery(actionItemQuerySchema), getActionItems);

// GET /api/action-items/leaderboard - Real-time leaderboard aggregation
router.get("/leaderboard", getActionItemsLeaderboard);


// GET /api/action-items/meeting/:meetingId - View action items for a specific meeting
router.get("/meeting/:meetingId", validateParams(idSchema), getActionItemsByMeeting);

// GET /api/action-items/:id - View single action item by ID
router.get("/:id", validateParams(idSchema), getActionItemById);

// POST /api/action-items - Add an action item manually
router.post("/", validateBody(createActionItemSchema), createActionItem);

// PUT /api/action-items/:id - Edit an action item
router.put("/:id", validateParams(idSchema), validateBody(updateActionItemSchema), updateActionItem);

// PATCH /api/action-items/:id - Partial update (e.g. status)
router.patch("/:id", validateParams(idSchema), updateActionItem);

// DELETE /api/action-items/:id - Delete an action item
router.delete("/:id", validateParams(idSchema), deleteActionItem);


export default router;
