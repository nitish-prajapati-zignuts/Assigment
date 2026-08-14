import { Router } from "express";
import {
  getMeetings,
  getMeetingById,
  createMeeting,
  updateMeeting,
  summarizeMeeting,
  deleteMeeting,
  toggleMeetingPublish,
  getPublicMeetingByToken,
  chatMeeting,
  archiveMeeting,
  unArchiveMeeting,
} from "../controllers/meetingController";
import { protect } from "../middleware/authMiddleware";
import { validateBody, validateQuery, validateParams } from "../middleware/validation";
import {
  createMeetingSchema,
  updateMeetingSchema,
  meetingQuerySchema,
  idSchema,
  chatValidationSchema,
} from "../utils/validation";

const router = Router();

// PUBLIC Endpoint (no auth required) - Get meeting details via encrypted share token
router.get("/public/share/:token", getPublicMeetingByToken);
router.post("/public/share/:token/verify", getPublicMeetingByToken);

// Protect all remaining meeting endpoints
router.use(protect);

// GET /api/meetings - Fetch all meetings with filtering
router.get("/", validateQuery(meetingQuerySchema), getMeetings);

// GET /api/meetings/:id - Fetch single meeting by ID
router.get("/:id", validateParams(idSchema), getMeetingById);

// POST /api/meetings - Create new meeting
router.post("/", validateBody(createMeetingSchema), createMeeting);

// PUT /api/meetings/:id - Update existing meeting
router.put("/:id", validateParams(idSchema), validateBody(updateMeetingSchema), updateMeeting);

// PATCH /api/meetings/:id/publish - Toggle public link status
router.patch("/:id/publish", validateParams(idSchema), toggleMeetingPublish);

// POST /api/meetings/:id/summarize - Generate AI summary
router.post("/:id/summarize", validateParams(idSchema), summarizeMeeting);

// POST /api/meetings/:id/chat - RAG chat engine
router.post("/:id/chat", validateParams(idSchema), validateBody(chatValidationSchema), chatMeeting);

// POST /api/meetings/:id - Delete a meeting
router.post("/:id", validateParams(idSchema), deleteMeeting);

// POST /api/meetings/:id/archive - Archive a meeting
router.post("/:id/archive", validateParams(idSchema), archiveMeeting)

// POST /api/meetings/:id/unArchive - UnArchive a meeting
router.post("/:id/unArchive", validateParams(idSchema), unArchiveMeeting)

export default router;
