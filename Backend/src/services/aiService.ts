import { generateObject } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { z } from "zod";
import { MeetingSummary, KeyDecision, ActionItem } from "../db/schema";
import dotenv from "dotenv";

dotenv.config();

export const keyDecisionSchema = z.object({
  category: z
    .string()
    .describe(
      "Category of the decision (e.g., Technology/Platform, Feature Approval/Rejection, Timeline Agreed, Scope Change, Budget/Staffing, Responsibility Assigned, General Decision)."
    ),
  decision: z
    .string()
    .describe("Clear, concise statement of the decision made during the meeting."),
  context: z
    .string()
    .optional()
    .describe("Brief context, background, or rationale for the decision if mentioned."),
});

export const actionItemSchema = z.object({
  task: z
    .string()
    .describe("Clear action task description extracted from the transcript."),
  owner: z
    .string()
    .describe("Name of the person assigned to the task. Use 'Unassigned' if not mentioned."),
  dueDate: z
    .string()
    .describe("Due date string (e.g. YYYY-MM-DD or relative like 'Next Friday'). Use 'Not specified' if not mentioned."),
  priority: z
    .enum(["Low", "Medium", "High", "Urgent"])
    .describe("Inferred priority level based on context (default 'Medium')."),
  status: z
    .enum(["Open", "In Progress", "Blocked", "Completed", "Pending"])
    .describe("Current status of the task (default 'Open')."),
});

export const meetingSummarySchema = z.object({
  purpose: z
    .string()
    .describe("Concise statement describing the primary goal or purpose of the meeting."),
  discussionPoints: z
    .array(z.string())
    .describe("Key topics, themes, and important discussion points covered during the meeting."),
  majorOutcomes: z
    .array(z.string())
    .describe("Decisions made, key milestones reached, or key conclusions agreed upon."),
  importantConcerns: z
    .array(z.string())
    .describe("Risks, obstacles, unresolved issues, or critical questions raised."),
  nextSteps: z
    .array(z.string())
    .describe("Action items, assigned tasks, follow-up deadlines, and next milestones."),
  keyDecisions: z
    .array(keyDecisionSchema)
    .describe(
      "List of clear, explicit key decisions made during the meeting (e.g. Technology/Platform, Feature Approval, Timeline, Scope, Budget, Responsibility). If NO clear decisions were made, return an empty array []; DO NOT invent decisions."
    ),
  actionItems: z
    .array(actionItemSchema)
    .describe(
      "List of extracted actionable tasks with Task Description, Owner, Due Date, Priority, and Status. Handle missing information sensibly (Owner='Unassigned', DueDate='Not specified'). DO NOT invent ungrounded details."
    ),
});

export const stripHtml = (input: string | null | undefined): string => {
  if (!input) return "";

  let str = input;

  if (/<[a-z][\s\S]*>/i.test(str)) {
    str = str
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/<\/(p|div|li|tr|h[1-6])>/gi, "\n")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">")
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'")
      .replace(/&rsquo;/gi, "'")
      .replace(/&lsquo;/gi, "'")
      .replace(/&rdquo;/gi, '"')
      .replace(/&ldquo;/gi, '"')
      .replace(/&mdash;/gi, "—")
      .replace(/&ndash;/gi, "–")
      .replace(/[ \t]+/g, " ")
      .replace(/\n\s*\n+/g, "\n")
      .trim();
  } else {
    str = str
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">")
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'")
      .replace(/&rsquo;/gi, "'")
      .replace(/&lsquo;/gi, "'")
      .replace(/&rdquo;/gi, '"')
      .replace(/&ldquo;/gi, '"')
      .replace(/&mdash;/gi, "—")
      .replace(/&ndash;/gi, "–")
      .replace(/[ \t]+/g, " ")
      .trim();
  }

  return str;
};

export const cleanSummary = (summary: MeetingSummary): MeetingSummary => {
  return {
    purpose: stripHtml(summary.purpose) || "General meeting discussion and updates.",
    discussionPoints: (summary.discussionPoints || [])
      .map(stripHtml)
      .filter((s) => s.length > 0),
    majorOutcomes: (summary.majorOutcomes || [])
      .map(stripHtml)
      .filter((s) => s.length > 0),
    importantConcerns: (summary.importantConcerns || [])
      .map(stripHtml)
      .filter((s) => s.length > 0),
    nextSteps: (summary.nextSteps || [])
      .map(stripHtml)
      .filter((s) => s.length > 0),
    keyDecisions: (summary.keyDecisions || [])
      .map((kd) => ({
        category: stripHtml(kd.category) || "General Decision",
        decision: stripHtml(kd.decision),
        context: kd.context ? stripHtml(kd.context) : undefined,
      }))
      .filter((kd) => kd.decision.length > 0),
    actionItems: (summary.actionItems || [])
      .map((item) => ({
        ...item,
        task: stripHtml(item.task),
        owner: stripHtml(item.owner) || "Unassigned",
        dueDate: stripHtml(item.dueDate) || "Not specified",
        priority: item.priority || "Medium",
        status: item.status || "Pending",
      }))
      .filter((item) => item.task.length > 0),
  };
};

/**
 * Heuristic fallback generator when AI API Key is not set or API call is skipped
 */
export const generateFallbackSummary = (
  rawTranscript: string,
  title?: string
): MeetingSummary => {
  const plainTranscript = stripHtml(rawTranscript);

  const lines = plainTranscript
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith("<"));

  const cleanText = plainTranscript.trim();

  if (!cleanText) {
    return cleanSummary({
      purpose: title ? `Discuss ${title}` : "General team sync and progress review.",
      discussionPoints: ["Initial overview of project status and updates."],
      majorOutcomes: ["Aligned on current project direction."],
      importantConcerns: ["Ensure timeline deadlines are maintained."],
      nextSteps: ["Schedule follow-up sync for next status update."],
      keyDecisions: [],
      actionItems: [],
    });
  }

  // Extract key sentences or lines for points
  const points = lines.slice(0, 8);

  const extractedDecisions: KeyDecision[] = [];
  const lowerText = cleanText.toLowerCase();

  if (lowerText.includes("agreed") || lowerText.includes("decided") || lowerText.includes("outcome") || lowerText.includes("approved")) {
    const decisionLine = lines.find((l) => {
      const low = l.toLowerCase();
      return low.includes("agreed") || low.includes("decided") || low.includes("approved") || low.includes("outcome");
    });

    if (decisionLine) {
      extractedDecisions.push({
        category: lowerText.includes("timeline")
          ? "Timeline Agreed"
          : lowerText.includes("tech") || lowerText.includes("stack") || lowerText.includes("api")
            ? "Technology/Platform"
            : "General Decision",
        decision: decisionLine,
        context: "Extracted from meeting transcript records.",
      });
    }
  }

  // Extract Action Items from transcript lines
  const extractedActionItems: ActionItem[] = points.slice(0, 3).map((p) => {
    let owner = "Unassigned";

    // Simple heuristic name detection
    if (p.toLowerCase().includes("sarah")) owner = "Sarah";
    else if (p.toLowerCase().includes("alex")) owner = "Alex";
    else if (p.toLowerCase().includes("john")) owner = "John";
    else if (p.includes("@")) {
      const match = p.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
      if (match) owner = match[0].split("@")[0];
    }

    return {
      task: p,
      owner,
      dueDate: "Not specified",
      priority: "Medium" as const,
      status: "Pending" as const,
    };
  });

  return cleanSummary({
    purpose: title
      ? `Meeting regarding ${title}: ${points[0] || cleanText.slice(0, 100)}`
      : `Review and discussion covering key updates: ${points[0] || cleanText.slice(0, 100)}`,
    discussionPoints:
      points.length > 0
        ? points.slice(0, 4)
        : ["Discussed project workflow, current progress, and operational updates."],
    majorOutcomes:
      points.length > 2
        ? [points[1] || "Agreed on project approach and key action points."]
        : ["Reviewed status and validated current action items."],
    importantConcerns:
      points.length > 4
        ? [points[3] || "Monitor progress and address pending dependencies promptly."]
        : ["Keep team aligned on project dependencies and deadlines."],
    nextSteps:
      points.length > 5
        ? points.slice(4, 7)
        : [
          "Complete assigned action items discussed in transcript.",
          "Share updated documentation with team members.",
        ],
    keyDecisions: extractedDecisions,
    actionItems: extractedActionItems,
  });
};

/**
 * Generate AI-Powered Structured Meeting Summary using Vercel AI SDK
 */
export const generateMeetingSummary = async (
  rawTranscript: string,
  customApiKey?: string,
  title?: string
): Promise<MeetingSummary> => {
  const apiKey = customApiKey || process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;
  const plainTranscript = stripHtml(rawTranscript);

  if (!plainTranscript || plainTranscript.trim().length === 0) {
    return generateFallbackSummary("", title);
  }

  if (!apiKey) {
    console.warn("⚠️ No Gemini/Google AI API Key provided. Using structured heuristic summary fallback.");
    return generateFallbackSummary(plainTranscript, title);
  }

  try {
    const google = createGoogleGenerativeAI({
      apiKey,
    });

    const { object } = await generateObject({
      model: google("gemini-3.5-flash"),
      schema: meetingSummarySchema,
      prompt: `You are an expert AI executive assistant. Analyze the following meeting transcript and generate a structured summary.
      
Meeting Title: ${title || "Team Meeting"}
Transcript:
"""
${plainTranscript}
"""

Ensure the summary strictly covers:
1. Purpose of the meeting
2. Important discussion points
3. Major outcomes
4. Important concerns
5. Next steps
6. Key Decisions Made (Categorize each into e.g., Technology/Platform, Feature Approval/Rejection, Timeline Agreed, Scope Change, Budget/Staffing, Responsibility Assigned, General Decision). 
7. Action Items Extracted:
   - task: Clear action task description in simple plain text.
   - owner: Assignee name or 'Unassigned' if missing.
   - dueDate: Due date (YYYY-MM-DD or relative like 'Next Friday') or 'Not specified' if missing.
   - priority: Priority level ('Low', 'Medium', 'High', 'Urgent').
   - status: Current status ('Pending', 'In Progress', 'Completed').

CRITICAL RULES:
- The input transcript may contain raw text. All outputs MUST BE in plain text ONLY. DO NOT include any HTML elements (like <div>, <p>, <strong>, <span>) or markdown containers in any output fields.
- If NO clear decision was made, return an empty array [] for keyDecisions. DO NOT invent decisions.
- Handle missing action item details sensibly (Owner='Unassigned', DueDate='Not specified'). DO NOT invent ungrounded details.
`,
    });

    return cleanSummary(object);
  } catch (error) {
    console.error("Error generating AI summary via Vercel AI SDK:", error);
    console.warn("Falling back to structured heuristic summary generator.");
    return generateFallbackSummary(plainTranscript, title);
  }
};
