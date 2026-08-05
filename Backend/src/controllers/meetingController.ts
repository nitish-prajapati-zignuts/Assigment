import { Request, Response } from "express";
import { db } from "../db";
import { meetings, actionItems, users, MeetingSummary } from "../db/schema";
import { eq } from "drizzle-orm";
import { generateMeetingSummary } from "../services/aiService";
import { AuthenticatedRequest } from "../middleware/authMiddleware";

/**
 * Helper to sync extracted action items into the relational `action_items` DB table
 */
const syncActionItemsToDb = async (
  meetingId: string,
  summary: MeetingSummary | null
): Promise<void> => {
  try {
    // Delete previous action items for this meeting
    await db.delete(actionItems).where(eq(actionItems.meetingId, meetingId));

    if (!summary || !summary.actionItems || summary.actionItems.length === 0) {
      return;
    }

    // Fetch existing users to attempt owner matching
    const allUsers = await db.select().from(users);

    const rowsToInsert = summary.actionItems.map((item, index) => {
      // Find matching user by email or name if owner string matches
      let matchedUserId: string | null = null;
      if (item.owner && item.owner !== "Unassigned") {
        const matched = allUsers.find(
          (u) =>
            u.email.toLowerCase() === item.owner.toLowerCase() ||
            u.name.toLowerCase().includes(item.owner.toLowerCase())
        );
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

    await db.insert(actionItems).values(rowsToInsert);
  } catch (error) {
    console.error("Error syncing action items to DB table:", error);
  }
};

/**
 * GET /api/meetings
 * Fetch meetings associated with the currently authenticated user
 */
export const getMeetings = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { search, type } = req.query;
    const userEmail = req.user?.email?.toLowerCase();

    const allMeetings = await db.select().from(meetings);

    // Filter meetings where the logged-in user is a participant
    let userMeetings = allMeetings;
    if (userEmail) {
      userMeetings = allMeetings.filter(
        (m) =>
          Array.isArray(m.participants) &&
          m.participants.some((p) => p.toLowerCase() === userEmail)
      );
    }

    let filtered = userMeetings;

    if (search && typeof search === "string") {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.transcript?.toLowerCase().includes(q) ||
          m.participants.some((p) => p.toLowerCase().includes(q))
      );
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
  } catch (error) {
    console.error("Error fetching meetings:", error);
    res.status(500).json({ error: "Failed to fetch meetings" });
  }
};

/**
 * GET /api/meetings/:id
 * Fetch single meeting by ID
 */
export const getMeetingById = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const targetId = String(req.params.id);

    const result = await db
      .select()
      .from(meetings)
      .where(eq(meetings.id, targetId));

    if (result.length === 0) {
      res.status(404).json({ error: "Meeting not found" });
      return;
    }

    res.json(result[0]);
  } catch (error) {
    console.error("Error fetching meeting:", error);
    res.status(500).json({ error: "Failed to fetch meeting" });
  }
};

/**
 * POST /api/meetings
 * Create a new meeting & generate AI summary + sync action items
 */
export const createMeeting = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { title, date, type, participants, transcript, apiKey } = req.body;
    const userEmail = req.user?.email;

    if (!title || !date || !type) {
      res.status(400).json({ error: "Title, date, and type are required." });
      return;
    }

    // Ensure the creating user's email is included in the participants list
    let finalParticipants = Array.isArray(participants) ? participants : [];
    if (
      userEmail &&
      !finalParticipants.some((p) => p.toLowerCase() === userEmail.toLowerCase())
    ) {
      finalParticipants = [...finalParticipants, userEmail];
    }

    const cleanTranscript = transcript || "";

    // Generate structured AI meeting summary
    const summary =
      cleanTranscript.trim().length > 0
        ? await generateMeetingSummary(cleanTranscript, apiKey, title)
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

    const inserted = await db
      .insert(meetings)
      .values(newMeeting)
      .returning();

    // Sync relational action items table
    await syncActionItemsToDb(meetingId, summary);

    res.status(201).json(inserted[0]);
  } catch (error) {
    console.error("Error creating meeting:", error);
    res.status(500).json({ error: "Failed to create meeting" });
  }
};

/**
 * PUT /api/meetings/:id
 * Update an existing meeting & update AI summary + action items
 */
export const updateMeeting = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const targetId = String(req.params.id);
    const { title, date, type, participants, transcript, apiKey } = req.body;

    let generatedSummary: MeetingSummary | null | undefined = undefined;

    if (transcript !== undefined && transcript.trim().length > 0) {
      generatedSummary = await generateMeetingSummary(transcript, apiKey, title);
    }

    const existing = await db
      .select()
      .from(meetings)
      .where(eq(meetings.id, targetId));

    if (existing.length === 0) {
      res.status(404).json({ error: "Meeting not found" });
      return;
    }

    const updated = await db
      .update(meetings)
      .set({
        ...(title ? { title } : {}),
        ...(date ? { date } : {}),
        ...(type ? { type } : {}),
        ...(participants ? { participants } : {}),
        ...(transcript !== undefined ? { transcript } : {}),
        ...(generatedSummary !== undefined ? { summary: generatedSummary } : {}),
        updatedAt: new Date(),
      })
      .where(eq(meetings.id, targetId))
      .returning();

    if (generatedSummary) {
      await syncActionItemsToDb(targetId, generatedSummary);
    }

    res.json(updated[0]);
  } catch (error) {
    console.error("Error updating meeting:", error);
    res.status(500).json({ error: "Failed to update meeting" });
  }
};

/**
 * POST /api/meetings/:id/summarize
 * Generate or re-generate AI summary for an existing meeting & sync action items
 */
export const summarizeMeeting = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const targetId = String(req.params.id);
    const { apiKey } = req.body;

    const existing = await db
      .select()
      .from(meetings)
      .where(eq(meetings.id, targetId));

    if (existing.length === 0) {
      res.status(404).json({ error: "Meeting not found" });
      return;
    }

    const meeting = existing[0];
    const summary = await generateMeetingSummary(
      meeting.transcript || "",
      apiKey,
      meeting.title
    );

    const updated = await db
      .update(meetings)
      .set({
        summary,
        updatedAt: new Date(),
      })
      .where(eq(meetings.id, targetId))
      .returning();

    // Sync relational action items table
    await syncActionItemsToDb(targetId, summary);

    res.json({
      message: "AI Summary generated and stored successfully",
      summary,
      meeting: updated[0],
    });
  } catch (error) {
    console.error("Error summarizing meeting:", error);
    res.status(500).json({ error: "Failed to generate AI meeting summary" });
  }
};

/**
 * DELETE /api/meetings/:id
 * Delete a meeting
 */
export const deleteMeeting = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const targetId = String(req.params.id);

    const deleted = await db
      .delete(meetings)
      .where(eq(meetings.id, targetId))
      .returning();

    if (deleted.length === 0) {
      res.status(404).json({ error: "Meeting not found" });
      return;
    }

    res.json({ message: "Meeting deleted successfully", meeting: deleted[0] });
  } catch (error) {
    console.error("Error deleting meeting:", error);
    res.status(500).json({ error: "Failed to delete meeting" });
  }
};
