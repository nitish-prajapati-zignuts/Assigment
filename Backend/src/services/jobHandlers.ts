/**
 * Job Handlers
 * Registers all job handlers with the job queue
 */

import { jobQueue } from "./jobQueue";
import { generateMeetingSummary } from "./aiService";
import db from "../db";
import { meetings, actionItems, users } from "../db/schema";
import { eq } from "drizzle-orm";
import { logger } from "../utils/logger";

interface SummarizeMeetingJobData {
  meetingId: string;
  transcript: string;
  title: string;
  language?: string;
  summaryLength?: any;
  template?: any;
  customPrompt?: string;
}

/**
 * Register all job handlers
 */
export const initializeJobHandlers = (): void => {
  /**
   * Summarize Meeting Job Handler
   * Generates AI summary and syncs action items
   */
  jobQueue.registerHandler<SummarizeMeetingJobData>(
    "summarize_meeting",
    async (data) => {
      const { meetingId, transcript, title, language, summaryLength, template, customPrompt } = data;

      try {
        logger.info("Starting meeting summarization", { meetingId, template, customPrompt: !!customPrompt });

        // Generate summary
        const summary = await generateMeetingSummary(
          transcript,
          undefined,
          title,
          language,
          summaryLength,
          template,
          customPrompt
        );

        // Sync action items
        await syncActionItemsToDb(meetingId, summary);

        // Update meeting with summary
        const updated = await db
          .update(meetings)
          .set({
            summary,
            updatedAt: new Date(),
          })
          .where(eq(meetings.id, meetingId))
          .returning();

        logger.info("Meeting summarization completed", {
          meetingId,
          actionItemCount: summary?.actionItems?.length || 0,
        });

        return {
          success: true,
          meetingId,
          summary,
          meeting: updated[0],
        };
      } catch (error) {
        logger.error("Meeting summarization failed", error as Error, { meetingId });
        throw error;
      }
    }
  );

  logger.info("Job handlers initialized");
};

/**
 * Helper: Sync action items to database
 * (copied from meetingController for reuse)
 */
async function syncActionItemsToDb(
  meetingId: string,
  summary: any | null
): Promise<void> {
  try {
    // Delete previous action items for this meeting
    await db.delete(actionItems).where(eq(actionItems.meetingId, meetingId));

    if (!summary || !summary.actionItems || summary.actionItems.length === 0) {
      return;
    }

    // Fetch users once to avoid N+1 queries
    const allUsers = await db.select().from(users);
    const userEmailMap = new Map(allUsers.map((u: { email: string; id: any; }) => [u.email.toLowerCase(), u.id]));

    const rowsToInsert = summary.actionItems.map((item: any, index: number) => {
      // Find matching user by email
      let matchedUserId: string | null = null;
      if (item.owner && item.owner !== "Unassigned") {
        matchedUserId = (userEmailMap.get(item.owner.toLowerCase()) as string) ?? null;
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
    logger.error("Error syncing action items", error as Error, { meetingId });
    throw error;
  }
}
