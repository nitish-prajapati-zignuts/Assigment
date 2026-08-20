import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { searchUserMemory, RetrievedMemoryChunk } from "./vectorStore";
import { db } from "../../db";
import { chatSessions, chatMessages } from "../../db/schema";
import { eq, asc } from "drizzle-orm";
import { logger } from "../../utils/logger";
import crypto from "crypto";

export interface LangChainChatResponse {
  answer: string;
  sessionId: string;
  retrievedSources: Array<{
    id: string;
    title: string;
    sourceType: string;
    meetingId?: string;
    actionItemId?: string;
  }>;
}

/**
 * Ensures a chat session exists or creates a new one for the user
 */
export async function getOrCreateChatSession(
  userId: string,
  sessionId?: string,
  sessionType: "global" | "meeting" = "global",
  meetingId?: string
): Promise<string> {
  if (sessionId) {
    const existing = await db.select().from(chatSessions).where(eq(chatSessions.id, sessionId));
    if (existing.length > 0) return existing[0].id;
  }

  const newId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  await db.insert(chatSessions).values({
    id: newId,
    userId,
    title: sessionType === "meeting" ? `Meeting Chat (${meetingId})` : "Global Memory Chat",
    sessionType,
    meetingId: meetingId || null,
  });

  return newId;
}

/**
 * Load recent history messages for a session
 */
export async function getSessionMessageHistory(
  sessionId: string,
  limit = 10
): Promise<Array<{ role: string; content: string }>> {
  try {
    const msgs = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.sessionId, sessionId))
      .orderBy(asc(chatMessages.createdAt))
      .limit(limit);

    return msgs.map((m) => ({
      role: m.role,
      content: m.content,
    }));
  } catch (error) {
    logger.warn("Could not load session message history", { sessionId });
    return [];
  }
}

/**
 * Save user and assistant messages into session persistence
 */
export async function appendChatMessages(
  sessionId: string,
  userText: string,
  assistantText: string,
  sources: any[] = []
): Promise<void> {
  try {
    const userMsgId = `msg-user-${Date.now()}`;
    const botMsgId = `msg-bot-${Date.now()}`;

    await db.insert(chatMessages).values([
      {
        id: userMsgId,
        sessionId,
        role: "user",
        content: userText,
      },
      {
        id: botMsgId,
        sessionId,
        role: "assistant",
        content: assistantText,
        sources,
      },
    ]);

    // Update session timestamp
    await db.update(chatSessions).set({ updatedAt: new Date() }).where(eq(chatSessions.id, sessionId));
  } catch (error) {
    logger.error("Failed to append chat messages", error as Error, { sessionId });
  }
}

/**
 * Initializes LangChain ChatGoogleGenerativeAI with fallback options
 */
function getLangChainChatModel(): ChatGoogleGenerativeAI {
  const apiKey =
    process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY || process.env.GEMINI_FALL_BACK_KEY;

  if (!apiKey) {
    throw new Error("No Gemini API Key available for LangChain Chat Model");
  }

  return new ChatGoogleGenerativeAI({
    apiKey,
    model: "gemini-3.5-flash-lite",
    temperature: 0.2,
  });
}

/**
 * LangChain User-Scoped Long-Term Memory Query Engine
 */
export async function queryUserLongTermMemory({
  userId,
  userEmail,
  question,
  sessionId,
  meetingIdFilter,
}: {
  userId: string;
  userEmail: string;
  question: string;
  sessionId?: string;
  meetingIdFilter?: string;
}): Promise<LangChainChatResponse> {
  const activeSessionId = await getOrCreateChatSession(
    userId,
    sessionId,
    meetingIdFilter ? "meeting" : "global",
    meetingIdFilter
  );

  // 1. Load history
  const historyMsgs = await getSessionMessageHistory(activeSessionId, 10);
  const formattedHistory = historyMsgs.map((h) => `${h.role.toUpperCase()}: ${h.content}`).join("\n");

  // 2. Perform LangChain vector retrieval from user_memory_embeddings
  let retrievedChunks: RetrievedMemoryChunk[] = await searchUserMemory(
    userId,
    question,
    8,
    meetingIdFilter ? undefined : undefined
  );

  // If meetingIdFilter is active, prioritize chunks for that meeting
  if (meetingIdFilter && retrievedChunks.length > 0) {
    retrievedChunks = retrievedChunks.filter(
      (c) => c.sourceId === meetingIdFilter || c.metadata?.meetingId === meetingIdFilter
    );
  }

  // Format context for LLM
  let contextText = "";
  const sourcesList: Array<{
    id: string;
    title: string;
    sourceType: string;
    meetingId?: string;
    actionItemId?: string;
  }> = [];

  if (retrievedChunks.length > 0) {
    contextText = retrievedChunks
      .map((chunk, idx) => {
        const title = chunk.metadata?.meetingTitle || chunk.metadata?.task || `${chunk.sourceType} #${chunk.sourceId}`;
        sourcesList.push({
          id: chunk.id,
          title: `${title} (${chunk.sourceType.replace("_", " ")})`,
          sourceType: chunk.sourceType,
          meetingId: chunk.metadata?.meetingId || (chunk.sourceType !== "action_item" ? chunk.sourceId : undefined),
          actionItemId: chunk.sourceType === "action_item" ? chunk.sourceId : undefined,
        });

        return `[Source #${idx + 1}: ${title} | Type: ${chunk.sourceType}]\n${chunk.content}`;
      })
      .join("\n\n");
  } else {
    contextText = "No relevant past meeting notes, decisions, or action items found in your memory.";
  }

  // 3. Build LangChain Runnable Chain
  const promptTemplate = PromptTemplate.fromTemplate(`
You are an intelligent AI Assistant with full long-term memory access to all meetings, key decisions, transcripts, and action items for user "${userEmail}".

YOUR LONG-TERM MEMORY INSTRUCTIONS:
1. Answer the user's question clearly, precisely, and accurately based on the RETRIEVED MEMORY CONTEXT provided below.
2. If the user asks about action items, deadlines, decisions, or specific meetings, reference them directly (e.g., "In the meeting 'Sprint Planning' on Oct 12..." or "Your action item 'Fix API Auth' is due next Friday").
3. If the context does not contain enough information to answer the question, state: "I could not find information regarding that in your past meetings or action items."
4. Be helpful, professional, and concise.

==================================================
RETRIEVED MEMORY CONTEXT FROM ALL USER MEETINGS & TASKS:
==================================================
{context}

==================================================
RECENT CONVERSATION HISTORY:
==================================================
{history}

==================================================
USER QUESTION: {question}
==================================================

GROUNDED RESPONSE:
`);

  try {
    const model = getLangChainChatModel();
    const chain = RunnableSequence.from([promptTemplate, model, new StringOutputParser()]);

    const answer = await chain.invoke({
      context: contextText,
      history: formattedHistory || "No previous history.",
      question,
    });

    // Save turn to chat history persistence
    await appendChatMessages(activeSessionId, question, answer, sourcesList);

    return {
      answer,
      sessionId: activeSessionId,
      retrievedSources: sourcesList,
    };
  } catch (error: any) {
    logger.error("LangChain long-term memory query failed", error as Error, { userId, question });

    // Fallback heuristic response if LLM call fails
    const fallbackAnswer =
      retrievedChunks.length > 0
        ? `Here is what I found in your past meeting memory:\n\n` +
          retrievedChunks
            .slice(0, 3)
            .map((c) => `• **${c.metadata?.meetingTitle || "Memory Item"}**: ${c.content}`)
            .join("\n\n")
        : "I was unable to process your request at this moment.";

    await appendChatMessages(activeSessionId, question, fallbackAnswer, sourcesList);

    return {
      answer: fallbackAnswer,
      sessionId: activeSessionId,
      retrievedSources: sourcesList,
    };
  }
}
