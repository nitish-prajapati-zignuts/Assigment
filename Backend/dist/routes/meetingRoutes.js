"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const meetingController_1 = require("../controllers/meetingController");
const router = (0, express_1.Router)();
// GET /api/meetings - Fetch all meetings
router.get("/", meetingController_1.getMeetings);
// GET /api/meetings/:id - Fetch single meeting by ID
router.get("/:id", meetingController_1.getMeetingById);
// POST /api/meetings - Create new meeting
router.post("/", meetingController_1.createMeeting);
// PUT /api/meetings/:id - Update existing meeting
router.put("/:id", meetingController_1.updateMeeting);
// POST /api/meetings/:id/summarize - Generate AI summary for a meeting
router.post("/:id/summarize", meetingController_1.summarizeMeeting);
// DELETE /api/meetings/:id - Delete a meeting
router.delete("/:id", meetingController_1.deleteMeeting);
exports.default = router;
