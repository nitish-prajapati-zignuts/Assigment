import { Request, Response } from "express";
import { db } from "../db";
import { meetings, actionItems, users, MeetingSummary } from "../db/schema";
import { eq } from "drizzle-orm";
import { generateMeetingSummary } from "../services/aiService";

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
 * Fetch all meetings with optional search and type filter
 */
export const getMeetings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, type } = req.query;

    const allMeetings = await db.select().from(meetings);
    let filtered = allMeetings;

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
export const getMeetingById = async (req: Request, res: Response): Promise<void> => {
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
export const createMeeting = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, date, type, participants, transcript, apiKey } = req.body;

    if (!title || !date || !type) {
      res.status(400).json({ error: "Title, date, and type are required." });
      return;
    }

    const cleanTranscript = transcript || "";

    // Generate structured AI meeting summary
    const summary = cleanTranscript.trim().length > 0
      ? await generateMeetingSummary(cleanTranscript, apiKey, title)
      : null;

    const meetingId = Date.now().toString();

    const newMeeting = {
      id: meetingId,
      title,
      date,
      type,
      participants: Array.isArray(participants) ? participants : [],
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
export const updateMeeting = async (req: Request, res: Response): Promise<void> => {
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
export const summarizeMeeting = async (req: Request, res: Response): Promise<void> => {
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
export const deleteMeeting = async (req: Request, res: Response): Promise<void> => {
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
