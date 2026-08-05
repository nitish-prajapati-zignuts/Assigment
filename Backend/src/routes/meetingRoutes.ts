import { Router } from "express";
import {
  getMeetings,
  getMeetingById,
  createMeeting,
  updateMeeting,
  summarizeMeeting,
  deleteMeeting,
} from "../controllers/meetingController";
import { protect } from "../middleware/authMiddleware";

const router = Router();

// Protect all meeting endpoints
router.use(protect);

// GET /api/meetings - Fetch all meetings
router.get("/", getMeetings);

// GET /api/meetings/:id - Fetch single meeting by ID
router.get("/:id", getMeetingById);

// POST /api/meetings - Create new meeting
router.post("/", createMeeting);

// PUT /api/meetings/:id - Update existing meeting
router.put("/:id", updateMeeting);

// POST /api/meetings/:id/summarize - Generate AI summary for a meeting
router.post("/:id/summarize", summarizeMeeting);

// DELETE /api/meetings/:id - Delete a meeting
router.delete("/:id", deleteMeeting);

export default router;
