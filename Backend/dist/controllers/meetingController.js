"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMeeting = exports.summarizeMeeting = exports.updateMeeting = exports.createMeeting = exports.getMeetingById = exports.getMeetings = void 0;
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const aiService_1 = require("../services/aiService");
/**
 * Helper to sync extracted action items into the relational `action_items` DB table
 */
const syncActionItemsToDb = async (meetingId, summary) => {
    try {
        // Delete previous action items for this meeting
        await db_1.db.delete(schema_1.actionItems).where((0, drizzle_orm_1.eq)(schema_1.actionItems.meetingId, meetingId));
        if (!summary || !summary.actionItems || summary.actionItems.length === 0) {
            return;
        }
        // Fetch existing users to attempt owner matching
        const allUsers = await db_1.db.select().from(schema_1.users);
        const rowsToInsert = summary.actionItems.map((item, index) => {
            // Find matching user by email or name if owner string matches
            let matchedUserId = null;
            if (item.owner && item.owner !== "Unassigned") {
                const matched = allUsers.find((u) => u.email.toLowerCase() === item.owner.toLowerCase() ||
                    u.name.toLowerCase().includes(item.owner.toLowerCase()));
                if (matched) {
                    matchedUserId = matched.id;
                }
            }
            return {
                id: `${meetingId}-item-${Date.now()}-${index}`,
                meetingId,
                userId: matchedUserId,
                task: item.task,
                owner: item.owner || "Unassigned",
                dueDate: item.dueDate || "Not specified",
                priority: item.priority || "Medium",
                status: item.status || "Pending",
                createdAt: new Date(),
                updatedAt: new Date(),
            };
        });
        await db_1.db.insert(schema_1.actionItems).values(rowsToInsert);
    }
    catch (error) {
        console.error("Error syncing action items to DB table:", error);
    }
};
/**
 * GET /api/meetings
 * Fetch meetings associated with the currently authenticated user
 */
const getMeetings = async (req, res) => {
    try {
        const { search, type } = req.query;
        const userEmail = req.user?.email?.toLowerCase();
        const allMeetings = await db_1.db.select().from(schema_1.meetings);
        // Filter meetings where the logged-in user is a participant
        let userMeetings = allMeetings;
        if (userEmail) {
            userMeetings = allMeetings.filter((m) => Array.isArray(m.participants) &&
                m.participants.some((p) => p.toLowerCase() === userEmail));
        }
        let filtered = userMeetings;
        if (search && typeof search === "string") {
            const q = search.toLowerCase();
            filtered = filtered.filter((m) => m.title.toLowerCase().includes(q) ||
                m.transcript?.toLowerCase().includes(q) ||
                m.participants.some((p) => p.toLowerCase().includes(q)));
        }
        if (type && typeof type === "string" && type !== "All") {
            filtered = filtered.filter((m) => m.type === type);
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
    }
    catch (error) {
        console.error("Error fetching meetings:", error);
        res.status(500).json({ error: "Failed to fetch meetings" });
    }
};
exports.getMeetings = getMeetings;
/**
 * GET /api/meetings/:id
 * Fetch single meeting by ID
 */
const getMeetingById = async (req, res) => {
    try {
        const targetId = String(req.params.id);
        const result = await db_1.db
            .select()
            .from(schema_1.meetings)
            .where((0, drizzle_orm_1.eq)(schema_1.meetings.id, targetId));
        if (result.length === 0) {
            res.status(404).json({ error: "Meeting not found" });
            return;
        }
        res.json(result[0]);
    }
    catch (error) {
        console.error("Error fetching meeting:", error);
        res.status(500).json({ error: "Failed to fetch meeting" });
    }
};
exports.getMeetingById = getMeetingById;
/**
 * POST /api/meetings
 * Create a new meeting & generate AI summary + sync action items
 */
const createMeeting = async (req, res) => {
    try {
        const { title, date, type, participants, transcript, apiKey } = req.body;
        const userEmail = req.user?.email;
        if (!title || !date || !type) {
            res.status(400).json({ error: "Title, date, and type are required." });
            return;
        }
        // Ensure the creating user's email is included in the participants list
        let finalParticipants = Array.isArray(participants) ? participants : [];
        if (userEmail &&
            !finalParticipants.some((p) => p.toLowerCase() === userEmail.toLowerCase())) {
            finalParticipants = [...finalParticipants, userEmail];
        }
        const cleanTranscript = transcript || "";
        // Generate structured AI meeting summary
        const summary = cleanTranscript.trim().length > 0
            ? await (0, aiService_1.generateMeetingSummary)(cleanTranscript, apiKey, title)
            : null;
        const meetingId = Date.now().toString();
        const newMeeting = {
            id: meetingId,
            title,
            date,
            type,
            participants: finalParticipants,
            transcript: cleanTranscript,
            summary,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        const inserted = await db_1.db
            .insert(schema_1.meetings)
            .values(newMeeting)
            .returning();
        // Sync relational action items table
        await syncActionItemsToDb(meetingId, summary);
        res.status(201).json(inserted[0]);
    }
    catch (error) {
        console.error("Error creating meeting:", error);
        res.status(500).json({ error: "Failed to create meeting" });
    }
};
exports.createMeeting = createMeeting;
/**
 * PUT /api/meetings/:id
 * Update an existing meeting & update AI summary + action items
 */
const updateMeeting = async (req, res) => {
    try {
        const targetId = String(req.params.id);
        const { title, date, type, participants, transcript, apiKey } = req.body;
        let generatedSummary = undefined;
        if (transcript !== undefined && transcript.trim().length > 0) {
            generatedSummary = await (0, aiService_1.generateMeetingSummary)(transcript, apiKey, title);
        }
        const existing = await db_1.db
            .select()
            .from(schema_1.meetings)
            .where((0, drizzle_orm_1.eq)(schema_1.meetings.id, targetId));
        if (existing.length === 0) {
            res.status(404).json({ error: "Meeting not found" });
            return;
        }
        const updated = await db_1.db
            .update(schema_1.meetings)
            .set({
            ...(title ? { title } : {}),
            ...(date ? { date } : {}),
            ...(type ? { type } : {}),
            ...(participants ? { participants } : {}),
            ...(transcript !== undefined ? { transcript } : {}),
            ...(generatedSummary !== undefined ? { summary: generatedSummary } : {}),
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(schema_1.meetings.id, targetId))
            .returning();
        if (generatedSummary) {
            await syncActionItemsToDb(targetId, generatedSummary);
        }
        res.json(updated[0]);
    }
    catch (error) {
        console.error("Error updating meeting:", error);
        res.status(500).json({ error: "Failed to update meeting" });
    }
};
exports.updateMeeting = updateMeeting;
/**
 * POST /api/meetings/:id/summarize
 * Generate or re-generate AI summary for an existing meeting & sync action items
 */
const summarizeMeeting = async (req, res) => {
    try {
        const targetId = String(req.params.id);
        const { apiKey } = req.body;
        const existing = await db_1.db
            .select()
            .from(schema_1.meetings)
            .where((0, drizzle_orm_1.eq)(schema_1.meetings.id, targetId));
        if (existing.length === 0) {
            res.status(404).json({ error: "Meeting not found" });
            return;
        }
        const meeting = existing[0];
        const summary = await (0, aiService_1.generateMeetingSummary)(meeting.transcript || "", apiKey, meeting.title);
        const updated = await db_1.db
            .update(schema_1.meetings)
            .set({
            summary,
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(schema_1.meetings.id, targetId))
            .returning();
        // Sync relational action items table
        await syncActionItemsToDb(targetId, summary);
        res.json({
            message: "AI Summary generated and stored successfully",
            summary,
            meeting: updated[0],
        });
    }
    catch (error) {
        console.error("Error summarizing meeting:", error);
        res.status(500).json({ error: "Failed to generate AI meeting summary" });
    }
};
exports.summarizeMeeting = summarizeMeeting;
/**
 * DELETE /api/meetings/:id
 * Delete a meeting
 */
const deleteMeeting = async (req, res) => {
    try {
        const targetId = String(req.params.id);
        const deleted = await db_1.db
            .delete(schema_1.meetings)
            .where((0, drizzle_orm_1.eq)(schema_1.meetings.id, targetId))
            .returning();
        if (deleted.length === 0) {
            res.status(404).json({ error: "Meeting not found" });
            return;
        }
        res.json({ message: "Meeting deleted successfully", meeting: deleted[0] });
    }
    catch (error) {
        console.error("Error deleting meeting:", error);
        res.status(500).json({ error: "Failed to delete meeting" });
    }
};
exports.deleteMeeting = deleteMeeting;
