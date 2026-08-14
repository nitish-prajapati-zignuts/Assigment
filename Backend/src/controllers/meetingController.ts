import { Request, Response } from "express";
import db from "../db";
import { meetings, actionItems, users, MeetingSummary, meetingChunks } from "../db/schema";
import { eq, and, inArray, desc, getTableColumns, sql } from "drizzle-orm";
import { generateMeetingSummary } from "../services/aiService";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { asyncHandler } from "../middleware/errorHandler";
import { logger } from "../utils/logger";
import { NotFoundError, ValidationError, InternalServerError, AuthorizationError } from "../utils/errors";
import { getPaginationOffset, calculatePagination, buildPaginatedResponse } from "../utils/queryOptimization";
import { MeetingQueryInput, CreateMeetingInput, UpdateMeetingInput } from "../utils/validation";
import { processAndSaveTranscriptEmbeddings } from "../services/aiService";
import { jobQueue } from "../services/jobQueue";
import { queryMeetingRAG } from "../services/aiService";
import { appendDebugLog } from "../utils/appendLog";

/**
 * Helper function that synchronizes extracted AI action items into the relational PostgreSQL `action_items` DB table.
 * Uses batch insert for performance and prevents N+1 queries by fetching users once.
 */
const syncActionItemsToDb = async (meetingId: string, summary: MeetingSummary | null): Promise<void> => {
  try {
    // Delete previous action items for this meeting (cascade handled by DB)
    await db.delete(actionItems).where(eq(actionItems.meetingId, meetingId));

    if (!summary || !summary.actionItems || summary.actionItems.length === 0) {
      return;
    }

    // Fetch users once to avoid N+1 queries
    const allUsers = await db.select().from(users);
    const userEmailMap = new Map(allUsers.map((u: { email: string; id: any }) => [u.email.toLowerCase(), u.id]));

    const rowsToInsert = summary.actionItems.map((item, index) => {
      // Find matching user by email
      let matchedUserId: string | null = null;
      if (item.owner && item.owner !== "Unassigned") {
        matchedUserId = (userEmailMap.get(item.owner.toLowerCase()) as string) || null;
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

    // Batch insert for better performance
    if (rowsToInsert.length > 0) {
      await db.insert(actionItems).values(rowsToInsert);
    }

    logger.debug("Action items synced", { meetingId, count: rowsToInsert.length });
  } catch (error) {
    logger.error("Error syncing action items to DB table", error as Error, { meetingId });
    throw new InternalServerError("Failed to sync action items");
  }
};

/**
 * GET /api/meetings
 * Retrieves meetings associated with the authenticated user with filtering and pagination.
 * Uses database indexes for efficient querying.
 */
export const getMeetings = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { search, type, page, limit, sortBy, sortOrder } = req.query as unknown as MeetingQueryInput;
  const userEmail = req.user?.email?.toLowerCase();

  if (!userEmail) {
    throw new ValidationError("User email is required");
  }

  try {
    // Fetch all meetings ordered by createdAt descending (newest first)
    const allMeetings = await db
      .select({ ...getTableColumns(meetings), hasChunks: sql<boolean>`COUNT(${meetingChunks.id}) > 0` })
      .from(meetings)
      .leftJoin(meetingChunks, eq(meetingChunks.meetingId, meetings.id))
      .where(and(
        eq(meetings.isArchived, false),
        eq(meetings.isDeleted, false)
      ))
      .groupBy(meetings.id)
      .orderBy(desc(meetings.createdAt));
    appendDebugLog(JSON.stringify(allMeetings));
    console.log("All Meetings", allMeetings);

    // Filter meetings where user is a participant
    let userMeetings = allMeetings.filter(
      (m: { participants: any[] }) =>
        Array.isArray(m.participants) && m.participants.some((p: string) => p.toLowerCase() === userEmail)
    );

    let filtered = userMeetings;

    // Apply search filter
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.transcript?.toLowerCase().includes(q) ||
          m.participants.some((p: string) => p.toLowerCase().includes(q))
      );
    }

    // Apply type filter
    if (type && (type as string) !== "All") {
      filtered = filtered.filter((m: { type: string }) => m.type === type);
    }

    // Ensure strict sorting by createdAt descending (newest first)
    filtered.sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });

    // Calculate pagination
    const offset = getPaginationOffset(page, limit);
    const total = filtered.length;
    const paginatedItems = filtered.slice(offset, offset + limit);
    const pagination = calculatePagination(page, limit, total);

    logger.debug("Fetched meetings", {
      userEmail,
      count: paginatedItems.length,
      total,
      page,
      limit,
    });

    res.json(buildPaginatedResponse(paginatedItems, pagination));
  } catch (error) {
    logger.error("Error fetching meetings", error as Error, { userEmail });
    throw new InternalServerError("Failed to fetch meetings");
  }
});

/**
 * GET /api/meetings/:id
 * Fetches a single meeting record by its unique ID with access control.
 */
export const getMeetingById = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const targetId = String(req.params.id);
  const userEmail = req.user?.email?.toLowerCase();

  try {
    const result = await db.select().from(meetings).where(eq(meetings.id, targetId));

    if (result.length === 0) {
      throw new NotFoundError("Meeting");
    }

    const meeting = result[0];

    // Check if user is a participant
    if (
      !Array.isArray(meeting.participants) ||
      !meeting.participants.some((p: string) => p.toLowerCase() === userEmail)
    ) {
      throw new AuthorizationError("You are not a participant in this meeting");
    }

    logger.debug("Fetched meeting", { meetingId: targetId, userEmail });

    res.json(meeting);
  } catch (error) {
    logger.error("Error fetching meeting", error as Error, { meetingId: targetId });
    throw error instanceof (Error as any) ? error : new InternalServerError("Failed to fetch meeting");
  }
});

/**
 * POST /api/meetings
 * Creates a new meeting with async AI summarization via job queue.
 * Returns immediately with meeting record, summary processes in background.
 */
export const createMeeting = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { title, date, participants, transcript, type, language, summaryLength, template, customPrompt } =
    req.body as CreateMeetingInput & { language?: string; summaryLength?: any; template?: any; customPrompt?: string };
  const userEmail = req.user?.email;

  if (!userEmail) {
    throw new ValidationError("User email is required");
  }

  try {
    // Ensure creating user is in participants
    let finalParticipants = participants || [];
    if (!finalParticipants.some((p) => p.toLowerCase() === userEmail.toLowerCase())) {
      finalParticipants = [...finalParticipants, userEmail];
    }

    const meetingId = Date.now().toString();

    // Create meeting without summary initially
    const newMeeting = {
      id: meetingId,
      title,
      date,
      type: type || "meeting",
      participants: finalParticipants,
      transcript: transcript || "",
      summary: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const inserted = await db.insert(meetings).values(newMeeting).returning();

    let jobId: string | undefined;

    // Queue async summarization if transcript provided
    if (transcript && transcript.trim().length > 0) {
      // Seed meeting chunks vector embeddings immediately
      await processAndSaveTranscriptEmbeddings(meetingId, transcript);
      jobId = await jobQueue.addJob("summarize_meeting", {
        meetingId,
        transcript,
        title,
        language,
        summaryLength,
        template,
        customPrompt,
      });

      logger.info("Meeting created with async summarization & vector embeddings initialized", {
        meetingId,
        jobId,
        userEmail,
        participantCount: finalParticipants.length,
      });
    } else {
      logger.info("Meeting created (no transcript)", {
        meetingId,
        userEmail,
        participantCount: finalParticipants.length,
      });
    }

    res.status(201).json({
      ...inserted[0],
      jobId,
    });
  } catch (error) {
    logger.error("Error creating meeting", error as Error, { userEmail });
    throw error instanceof (Error as any) ? error : new InternalServerError("Failed to create meeting");
  }
});

/**
 * PUT /api/meetings/:id
 * Updates an existing meeting with optional re-summarization.
 */
export const updateMeeting = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const targetId = String(req.params.id);
  const { title, date, type, participants, transcript, language, summaryLength, isMeetingPublished } =
    req.body as UpdateMeetingInput & { language?: string; summaryLength?: any; isMeetingPublished?: boolean };

  try {
    const existing = await db.select().from(meetings).where(eq(meetings.id, targetId));

    if (existing.length === 0) {
      throw new NotFoundError("Meeting");
    }

    let generatedSummary: MeetingSummary | null | undefined = undefined;

    // Re-generate summary if transcript changed
    if (transcript !== undefined && transcript!.trim().length > 0) {
      generatedSummary = await generateMeetingSummary(
        transcript!,
        title || existing[0].title,
        undefined,
        language,
        summaryLength
      );
    }

    const updated = await db
      .update(meetings)
      .set({
        ...(title ? { title } : {}),
        ...(date ? { date } : {}),
        ...(type ? { type } : {}),
        ...(participants ? { participants } : {}),
        ...(transcript !== undefined ? { transcript } : {}),
        ...(isMeetingPublished !== undefined ? { isMeetingPublished } : {}),
        ...(generatedSummary !== undefined ? { summary: generatedSummary } : {}),
        updatedAt: new Date(),
      })
      .where(eq(meetings.id, targetId))
      .returning();

    // Sync action items if summary was regenerated
    if (generatedSummary) {
      await syncActionItemsToDb(targetId, generatedSummary);
    }

    // Process and save updated embeddings if transcript is modified in update request
    if (transcript !== undefined && transcript !== null) {
      await processAndSaveTranscriptEmbeddings(targetId, transcript);
    }

    logger.info("Meeting updated", { meetingId: targetId });

    res.json(updated[0]);
  } catch (error) {
    logger.error("Error updating meeting", error as Error, { meetingId: targetId });
    throw error instanceof (Error as any) ? error : new InternalServerError("Failed to update meeting");
  }
});

/**
 * POST /api/meetings/:id/summarize
 * Queues async AI summarization on demand with immediate response.
 */
export const summarizeMeeting = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const targetId = String(req.params.id);
  const { language, summaryLength, template } = req.body || {};

  try {
    const existing = await db.select().from(meetings).where(eq(meetings.id, targetId));

    if (existing.length === 0) {
      throw new NotFoundError("Meeting");
    }

    const meeting = existing[0];

    if (!meeting.transcript || meeting.transcript.trim().length === 0) {
      throw new ValidationError("Meeting has no transcript to summarize");
    }

    // Queue async summarization
    const jobId = await jobQueue.addJob("summarize_meeting", {
      meetingId: targetId,
      transcript: meeting.transcript,
      title: meeting.title,
      language,
      summaryLength,
      template,
    });

    logger.info("Meeting summarization queued", { meetingId: targetId, jobId });

    res.json({
      message: "Meeting summarization queued. Check back shortly for results.",
      jobId,
      meeting,
    });
  } catch (error) {
    logger.error("Error queuing meeting summarization", error as Error, { meetingId: targetId });
    throw error instanceof (Error as any) ? error : new InternalServerError("Failed to queue meeting summarization");
  }
});

/**
 * POST /api/meetings/:id/chat
 * RAG chatbot Q&A endpoint for query transcripts.
 */
export const chatMeeting = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const targetId = String(req.params.id);
  const { question, history } = req.body;
  const userEmail = req.user?.email?.toLowerCase();

  try {
    const existing = await db.select().from(meetings).where(eq(meetings.id, targetId));

    if (existing.length === 0) {
      throw new NotFoundError("Meeting");
    }

    const meeting = existing[0];

    // Check participation
    if (
      !Array.isArray(meeting.participants) ||
      !meeting.participants.some((p: string) => p.toLowerCase() === userEmail)
    ) {
      throw new AuthorizationError("You are not a participant in this meeting");
    }

    if (!meeting.transcript || meeting.transcript.trim().length === 0) {
      throw new ValidationError("Meeting has no transcript to chat with");
    }

    const result = await queryMeetingRAG(question, meeting.transcript, history, undefined, targetId);

    res.json(result);
  } catch (error) {
    logger.error("RAG Chatbot handler error", error as Error, { meetingId: targetId });
    throw error instanceof (Error as any) ? error : new InternalServerError("Failed to query meeting chatbot");
  }
});

/**
 * DELETE /api/meetings/:id
 * Deletes a meeting and its associated action items (cascade).
 */
export const deleteMeeting = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const targetId = String(req.params.id);

  try {
    const deleted = await db.update(meetings).set({ isDeleted: true, isDeletedAt: new Date() }).where(eq(meetings.id, targetId)).returning();

    if (deleted.length === 0) {
      throw new NotFoundError("Meeting");
    }

    logger.info("Meeting deleted", { meetingId: targetId });

    res.json({ message: "Meeting deleted successfully", meeting: deleted[0] });
  } catch (error) {
    logger.error("Error deleting meeting", error as Error, { meetingId: targetId });
    throw error instanceof (Error as any) ? error : new InternalServerError("Failed to delete meeting");
  }
});

/**
 * PATCH /api/meetings/:id/publish
 * Toggles or sets the isMeetingPublished state and returns an encrypted share link.
 */
export const toggleMeetingPublish = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const targetId = String(req.params.id);
  const { isMeetingPublished, sharePassword, expiresInHours, removePassword, clearExpiration } = req.body as {
    isMeetingPublished?: boolean;
    sharePassword?: string | null;
    expiresInHours?: number | null;
    removePassword?: boolean;
    clearExpiration?: boolean;
  };

  try {
    const existing = await db.select().from(meetings).where(eq(meetings.id, targetId));
    if (existing.length === 0) {
      throw new NotFoundError("Meeting");
    }

    const currentMeeting = existing[0];
    const nextPublishedState =
      typeof isMeetingPublished === "boolean" ? isMeetingPublished : !currentMeeting.isMeetingPublished;

    const { hashSharePassword } = await import("../utils/shareUtils");

    let finalPasswordHash = currentMeeting.sharePassword;
    if (removePassword) {
      finalPasswordHash = null;
    } else if (sharePassword && sharePassword.trim().length > 0) {
      finalPasswordHash = await hashSharePassword(sharePassword.trim());
    }

    let finalExpiresAt: Date | null = currentMeeting.shareExpiresAt;
    if (clearExpiration) {
      finalExpiresAt = null;
    } else if (typeof expiresInHours === "number" && expiresInHours > 0) {
      finalExpiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);
    }

    const updated = await db
      .update(meetings)
      .set({
        isMeetingPublished: nextPublishedState,
        sharePassword: finalPasswordHash,
        shareExpiresAt: finalExpiresAt,
        updatedAt: new Date(),
      })
      .where(eq(meetings.id, targetId))
      .returning();

    const { encryptShareToken } = await import("../utils/shareUtils");
    const shareToken = encryptShareToken(targetId);

    logger.info("Meeting publish status updated", {
      meetingId: targetId,
      isMeetingPublished: nextPublishedState,
      hasPassword: !!finalPasswordHash,
      expiresAt: finalExpiresAt,
    });

    res.json({
      meeting: updated[0],
      isMeetingPublished: nextPublishedState,
      hasPassword: !!finalPasswordHash,
      shareExpiresAt: finalExpiresAt,
      shareToken,
    });
  } catch (error) {
    logger.error("Error toggling meeting publish status", error as Error, { meetingId: targetId });
    throw error instanceof (Error as any) ? error : new InternalServerError("Failed to update publish status");
  }
});

/**
 * GET /api/meetings/public/share/:token
 * Public endpoint to fetch a meeting via an encrypted share token (if published).
 */
export const getPublicMeetingByToken = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const token = String(req.params.token);
  const password = req.body?.password as string | undefined;

  try {
    const { decryptShareToken, compareSharePassword } = await import("../utils/shareUtils");
    const payload = decryptShareToken(token);

    if (!payload || !payload.meetingId) {
      throw new NotFoundError("Shared meeting link is invalid or corrupted");
    }

    const result = await db.select().from(meetings).where(eq(meetings.id, payload.meetingId));
    if (result.length === 0) {
      throw new NotFoundError("Meeting not found");
    }

    const meeting = result[0];
    if (!meeting.isMeetingPublished) {
      throw new AuthorizationError("This meeting link is not currently published by the owner");
    }

    // Check expiration window
    if (meeting.shareExpiresAt && new Date(meeting.shareExpiresAt) < new Date()) {
      res.status(403).json({
        error: "Link Expired",
        message: `This share link expired on ${new Date(meeting.shareExpiresAt).toLocaleString()}`,
        isExpired: true,
      });
      return;
    }

    // Check password protection
    if (meeting.sharePassword && meeting.sharePassword.trim().length > 0) {
      if (!password) {
        res.status(401).json({
          requiresPassword: true,
          message: "This shared meeting link is password protected",
        });
        return;
      }

      const isValidPassword = await compareSharePassword(password, meeting.sharePassword);
      if (!isValidPassword) {
        res.status(401).json({
          requiresPassword: true,
          error: "Incorrect Password",
          message: "The access password you entered is incorrect",
        });
        return;
      }
    }

    logger.debug("Public meeting accessed via token", { meetingId: meeting.id });

    // Return public meeting object
    res.json({
      id: meeting.id,
      title: meeting.title,
      date: meeting.date,
      type: meeting.type,
      participants: meeting.participants,
      summary: meeting.summary,
      transcript: meeting.transcript,
      createdAt: meeting.createdAt,
      updatedAt: meeting.updatedAt,
      isMeetingPublished: meeting.isMeetingPublished,
      shareExpiresAt: meeting.shareExpiresAt,
      hasPassword: !!meeting.sharePassword,
    });
  } catch (error) {
    logger.error("Error fetching public meeting by token", error as Error);
    throw error instanceof (Error as any) ? error : new InternalServerError("Failed to load shared meeting");
  }
});

export const archiveMeeting = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const targetId = String(req.params.id)
  try {
    if (!targetId) {
      throw new ValidationError("Meeting Details is Required.")
    }

    const getMeetingDetails = await db.select().from(meetings).where(eq(meetings.id, targetId))
    if (!getMeetingDetails) {
      throw new ValidationError("Meeting Details is Required.")
    }

    const setMeetingArchived = await db
      .update(meetings)
      .set({
        isArchived: true,
        isArchivedAt: new Date(),
      })
      .where(eq(meetings.id, targetId)).returning();

    // Cascade archive to action items
    await db
      .update(actionItems)
      .set({
        isArchived: true,
        isArchivedAt: new Date(),
      })
      .where(eq(actionItems.meetingId, targetId));

    res.json({
      message: "Meeting Archived Successfully"
    })

  } catch (error) {
    throw new ValidationError("Meeting Cannot Be Archived")
  }
})

export const unArchiveMeeting = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const targetId = String(req.params.id)
  try {
    if (!targetId) {
      throw new ValidationError("Meeting Details is Required.")
    }

    const getMeetingDetails = await db.select().from(meetings).where(eq(meetings.id, targetId))
    if (!getMeetingDetails) {
      throw new ValidationError("Meeting Details is Required.")
    }

    const setMeetingArchived = await db
      .update(meetings)
      .set({
        isArchived: false,
        isArchivedAt: new Date(),
      })
      .where(eq(meetings.id, targetId)).returning();

    // Cascade unarchive to action items
    await db
      .update(actionItems)
      .set({
        isArchived: false,
        isArchivedAt: new Date(),
      })
      .where(eq(actionItems.meetingId, targetId));

    res.json({
      message: "Meeting Archived Successfully"
    })

  } catch (error) {
    throw new ValidationError("Meeting Cannot Be Archived")
  }
})
