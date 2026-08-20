import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { asyncHandler } from "../middleware/errorHandler";
import { queryUserLongTermMemory, getSessionMessageHistory } from "../services/langchain/userMemoryChain";
import { syncAllUserMemories } from "../services/langchain/memoryIndexer";
import { db } from "../db";
import { chatSessions, chatMessages } from "../db/schema";
import { eq, desc } from "drizzle-orm";
import { ValidationError, NotFoundError, InternalServerError } from "../utils/errors";
import { logger } from "../utils/logger";

/**
 * POST /api/service (serviceId: "chat.global")
 * Queries long-term memory across all user meetings and action items using LangChain
 */
export const queryGlobalChatMemory = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user?.userId || (req.user as any)?.id;
  const userEmail = req.user?.email;

  if (!userId || !userEmail) {
    throw new ValidationError("User authentication context is required");
  }

  const { question, sessionId, meetingId } = req.body as {
    question: string;
    sessionId?: string;
    meetingId?: string;
  };

  if (!question || question.trim().length === 0) {
    throw new ValidationError("Question cannot be empty");
  }

  try {
    const result = await queryUserLongTermMemory({
      userId,
      userEmail,
      question,
      sessionId,
      meetingIdFilter: meetingId,
    });

    res.json(result);
  } catch (error) {
    logger.error("Error in queryGlobalChatMemory", error as Error, { userId });
    throw error instanceof Error ? error : new InternalServerError("Failed to query global memory chatbot");
  }
});

/**
 * GET /api/service (serviceId: "chat.sessions.list")
 * List recent chat sessions for the logged-in user
 */
export const getChatSessionsList = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user?.userId || (req.user as any)?.id;
  if (!userId) {
    throw new ValidationError("User authentication required");
  }

  try {
    const sessions = await db
      .select()
      .from(chatSessions)
      .where(eq(chatSessions.userId, userId))
      .orderBy(desc(chatSessions.updatedAt))
      .limit(20);

    res.json({ sessions });
  } catch (error) {
    logger.error("Error fetching chat sessions", error as Error, { userId });
    throw new InternalServerError("Failed to fetch chat sessions");
  }
});

/**
 * GET /api/service (serviceId: "chat.sessions.get")
 * Get message history for a given session
 */
export const getChatSessionMessages = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user?.userId || (req.user as any)?.id;
  const sessionId = String(req.params.id || req.query.sessionId);

  if (!userId || !sessionId) {
    throw new ValidationError("Session ID is required");
  }

  try {
    const session = await db.select().from(chatSessions).where(eq(chatSessions.id, sessionId));

    if (session.length === 0 || session[0].userId !== userId) {
      throw new NotFoundError("Chat session");
    }

    const messages = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.sessionId, sessionId))
      .orderBy(desc(chatMessages.createdAt));

    res.json({ session: session[0], messages: messages.reverse() });
  } catch (error) {
    logger.error("Error fetching session messages", error as Error, { sessionId });
    throw error instanceof Error ? error : new InternalServerError("Failed to fetch chat session messages");
  }
});

/**
 * POST /api/service (serviceId: "memory.sync")
 * Manually trigger full memory re-indexing for the user's past meetings & action items
 */
export const triggerUserMemorySync = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user?.userId || (req.user as any)?.id;
  const userEmail = req.user?.email;

  if (!userId || !userEmail) {
    throw new ValidationError("User authentication required");
  }

  try {
    const result = await syncAllUserMemories(userId, userEmail);
    res.json({
      message: "Long-term memory sync completed successfully",
      stats: result,
    });
  } catch (error) {
    logger.error("Error triggering user memory sync", error as Error, { userId });
    throw new InternalServerError("Failed to perform memory synchronization");
  }
});
