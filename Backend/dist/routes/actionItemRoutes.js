"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const actionItemController_1 = require("../controllers/actionItemController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Protect all action item endpoints
router.use(authMiddleware_1.protect);
// GET /api/action-items - View all action items (with optional filters: ?meetingId= & ?userId= & ?status= & ?priority=)
router.get("/", actionItemController_1.getActionItems);
// GET /api/action-items/meeting/:meetingId - View action items for a specific meeting
router.get("/meeting/:meetingId", actionItemController_1.getActionItemsByMeeting);
// GET /api/action-items/:id - View single action item by ID
router.get("/:id", actionItemController_1.getActionItemById);
// POST /api/action-items - Add an action item manually
router.post("/", actionItemController_1.createActionItem);
// PUT /api/action-items/:id - Edit an action item (owner, due date, priority, status, task)
router.put("/:id", actionItemController_1.updateActionItem);
// DELETE /api/action-items/:id - Delete an action item
router.delete("/:id", actionItemController_1.deleteActionItem);
exports.default = router;
