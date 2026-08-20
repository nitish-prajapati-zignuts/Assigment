import { db } from "../../db";
import { meetings, actionItems, users, MeetingRecord, ActionItemRecord } from "../../db/schema";
import { eq, inArray } from "drizzle-orm";
import { MemoryChunkInput, storeUserMemoryChunks, deleteUserMemoryBySource } from "./vectorStore";
import { stripHtml } from "../aiService";
import { logger } from "../../utils/logger";

/**
 * Extract participant user IDs from meeting participant email list
 */
async function getParticipantUserIds(participantEmails: string[]): Promise<string[]> {
  if (!participantEmails || participantEmails.length === 0) return [];
  try {
    const allDbUsers = await db.select({ id: users.id, email: users.email }).from(users);
    const cleanedEmails = participantEmails.map((e) => e.trim().toLowerCase());
    return allDbUsers.filter((u) => cleanedEmails.includes(u.email.trim().toLowerCase())).map((u) => u.id);
  } catch (error) {
    logger.warn("Could not find user IDs for meeting participants", { participantEmails });
    return [];
  }
}

/**
 * Index a meeting record into user_memory_embeddings for all relevant users
 */
export async function indexMeetingMemory(meeting: MeetingRecord, targetUserId?: string): Promise<void> {
  if (!meeting) return;

  try {
    // Determine target users (either explicit targetUserId, or match participants by email)
    let userIds: string[] = [];
    if (targetUserId) {
      userIds = [targetUserId];
    } else if (Array.isArray(meeting.participants)) {
      userIds = await getParticipantUserIds(meeting.participants);
    }

    if (userIds.length === 0) {
      return;
    }

    const meetingTitle = meeting.title || "Untitled Meeting";
    const meetingDate = meeting.date || new Date().toISOString();
    const chunksToStore: MemoryChunkInput[] = [];

    // 1. Index Summary Purpose & Overview
    if (meeting.summary?.purpose) {
      for (const userId of userIds) {
        chunksToStore.push({
          id: `mem-${userId}-mtg-${meeting.id}-purpose`,
          userId,
          sourceType: "meeting_summary",
          sourceId: meeting.id,
          content: `Meeting Title: "${meetingTitle}" (Date: ${meetingDate})\nPurpose: ${meeting.summary.purpose}`,
          metadata: { meetingId: meeting.id, meetingTitle, meetingDate, section: "purpose" },
        });
      }
    }

    // 2. Index Discussion Points & Major Outcomes
    if (meeting.summary?.discussionPoints && Array.isArray(meeting.summary.discussionPoints)) {
      const discussionText = meeting.summary.discussionPoints.map((d) => `- ${d}`).join("\n");
      for (const userId of userIds) {
        chunksToStore.push({
          id: `mem-${userId}-mtg-${meeting.id}-discussion`,
          userId,
          sourceType: "meeting_summary",
          sourceId: meeting.id,
          content: `Meeting Title: "${meetingTitle}" (Date: ${meetingDate})\nMain Discussion Points:\n${discussionText}`,
          metadata: { meetingId: meeting.id, meetingTitle, meetingDate, section: "discussionPoints" },
        });
      }
    }

    if (meeting.summary?.majorOutcomes && Array.isArray(meeting.summary.majorOutcomes)) {
      const outcomesText = meeting.summary.majorOutcomes.map((o) => `- ${o}`).join("\n");
      for (const userId of userIds) {
        chunksToStore.push({
          id: `mem-${userId}-mtg-${meeting.id}-outcomes`,
          userId,
          sourceType: "meeting_summary",
          sourceId: meeting.id,
          content: `Meeting Title: "${meetingTitle}" (Date: ${meetingDate})\nMajor Outcomes:\n${outcomesText}`,
          metadata: { meetingId: meeting.id, meetingTitle, meetingDate, section: "majorOutcomes" },
        });
      }
    }

    // 3. Index Key Decisions
    if (meeting.summary?.keyDecisions && Array.isArray(meeting.summary.keyDecisions)) {
      meeting.summary.keyDecisions.forEach((kd, idx) => {
        const decisionContent = `Meeting Title: "${meetingTitle}" (Date: ${meetingDate})\nKey Decision [Category: ${kd.category}]: ${kd.decision} ${kd.context ? `(Context: ${kd.context})` : ""}`;
        for (const userId of userIds) {
          chunksToStore.push({
            id: `mem-${userId}-mtg-${meeting.id}-dec-${idx}`,
            userId,
            sourceType: "decision",
            sourceId: meeting.id,
            content: decisionContent,
            metadata: { meetingId: meeting.id, meetingTitle, meetingDate, category: kd.category },
          });
        }
      });
    }

    // 4. Index Action Items
    if (meeting.summary?.actionItems && Array.isArray(meeting.summary.actionItems)) {
      meeting.summary.actionItems.forEach((ai, idx) => {
        const actionContent = `Meeting Title: "${meetingTitle}" (Date: ${meetingDate})\nAction Item Task: "${ai.task}"\nOwner: ${ai.owner || "Unassigned"}\nPriority: ${ai.priority || "Medium"}\nStatus: ${ai.status || "Pending"}\nDue Date: ${ai.dueDate || "Not specified"}`;
        for (const userId of userIds) {
          chunksToStore.push({
            id: `mem-${userId}-mtg-${meeting.id}-act-${idx}`,
            userId,
            sourceType: "action_item",
            sourceId: meeting.id,
            content: actionContent,
            metadata: {
              meetingId: meeting.id,
              meetingTitle,
              meetingDate,
              task: ai.task,
              owner: ai.owner,
              priority: ai.priority,
              status: ai.status,
              dueDate: ai.dueDate,
            },
          });
        }
      });
    }

    // 4. Index Transcript in ~250 word windows
    if (meeting.transcript) {
      const plainText = stripHtml(meeting.transcript);
      const words = plainText.split(/\s+/);
      const chunkSize = 250;
      const overlap = 40;

      let windowIdx = 1;
      for (let i = 0; i < words.length; i += chunkSize - overlap) {
        const windowWords = words.slice(i, i + chunkSize);
        if (windowWords.length < 20) break;

        const snippet = windowWords.join(" ");
        for (const userId of userIds) {
          chunksToStore.push({
            id: `mem-${userId}-mtg-${meeting.id}-tx-${windowIdx}`,
            userId,
            sourceType: "meeting_transcript",
            sourceId: meeting.id,
            content: `Meeting Title: "${meetingTitle}" (Snippet #${windowIdx}):\n${snippet}`,
            metadata: { meetingId: meeting.id, meetingTitle, meetingDate, windowIdx },
          });
        }
        windowIdx++;
      }
    }

    if (chunksToStore.length > 0) {
      await storeUserMemoryChunks(chunksToStore);
      logger.info(`Indexed long-term memory for meeting ${meeting.id} across ${userIds.length} user(s)`, {
        chunksCount: chunksToStore.length,
      });
    }
  } catch (error) {
    logger.error("Failed to index meeting memory", error as Error, { meetingId: meeting.id });
  }
}

/**
 * Index an action item record into user_memory_embeddings
 */
export async function indexActionItemMemory(actionItem: ActionItemRecord, userId?: string): Promise<void> {
  if (!actionItem) return;

  try {
    const targetUserId = userId || actionItem.userId;
    if (!targetUserId) return;

    // Fetch associated meeting title if available
    let meetingTitle = "General Task";
    if (actionItem.meetingId) {
      const mtg = await db
        .select({ title: meetings.title })
        .from(meetings)
        .where(eq(meetings.id, actionItem.meetingId));
      if (mtg.length > 0) {
        meetingTitle = mtg[0].title;
      }
    }

    const content = `Action Item / Task: "${actionItem.task}"
Meeting: "${meetingTitle}"
Assigned Owner: ${actionItem.owner || "Unassigned"}
Priority: ${actionItem.priority || "Medium"}
Current Status: ${actionItem.status || "Pending"}
Due Date: ${actionItem.dueDate || "Not specified"}`;

    const chunk: MemoryChunkInput = {
      id: `mem-${targetUserId}-action-${actionItem.id}`,
      userId: targetUserId,
      sourceType: "action_item",
      sourceId: actionItem.id,
      content,
      metadata: {
        actionItemId: actionItem.id,
        meetingId: actionItem.meetingId,
        meetingTitle,
        task: actionItem.task,
        owner: actionItem.owner,
        priority: actionItem.priority,
        status: actionItem.status,
        dueDate: actionItem.dueDate,
      },
    };

    await storeUserMemoryChunks([chunk]);
    logger.info(`Indexed long-term memory for action item ${actionItem.id}`, { userId: targetUserId });
  } catch (error) {
    logger.error("Failed to index action item memory", error as Error, { actionItemId: actionItem.id });
  }
}

/**
 * Re-indexes all past meetings and action items for a given user
 */
export async function syncAllUserMemories(
  userId: string,
  userEmail: string
): Promise<{ meetingsIndexed: number; actionItemsIndexed: number }> {
  logger.info(`Starting full memory sync for user: ${userId} (${userEmail})`);

  let meetingsIndexed = 0;
  let actionItemsIndexed = 0;

  try {
    // 1. Fetch user's meetings
    const allMeetings = await db.select().from(meetings);
    const userMeetings = allMeetings.filter(
      (m) =>
        Array.isArray(m.participants) && m.participants.some((p: string) => p.toLowerCase() === userEmail.toLowerCase())
    );

    for (const mtg of userMeetings) {
      await indexMeetingMemory(mtg, userId);
      meetingsIndexed++;
    }

    // 2. Fetch user's action items
    const userActionItems = await db.select().from(actionItems).where(eq(actionItems.userId, userId));

    for (const item of userActionItems) {
      await indexActionItemMemory(item, userId);
      actionItemsIndexed++;
    }

    logger.info(
      `Full memory sync completed for user ${userId}: ${meetingsIndexed} meetings, ${actionItemsIndexed} action items.`
    );
    return { meetingsIndexed, actionItemsIndexed };
  } catch (error) {
    logger.error("Error performing full memory sync", error as Error, { userId });
    throw error;
  }
}
