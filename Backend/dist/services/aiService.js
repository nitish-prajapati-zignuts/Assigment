"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateMeetingSummary = exports.generateFallbackSummary = exports.cleanSummary = exports.stripHtml = exports.meetingSummarySchema = exports.actionItemSchema = exports.keyDecisionSchema = void 0;
const ai_1 = require("ai");
const google_1 = require("@ai-sdk/google");
const zod_1 = require("zod");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.keyDecisionSchema = zod_1.z.object({
    category: zod_1.z
        .string()
        .describe("Category of the decision (e.g., Technology/Platform, Feature Approval/Rejection, Timeline Agreed, Scope Change, Budget/Staffing, Responsibility Assigned, General Decision)."),
    decision: zod_1.z
        .string()
        .describe("Clear, concise statement of the decision made during the meeting."),
    context: zod_1.z
        .string()
        .optional()
        .describe("Brief context, background, or rationale for the decision if mentioned."),
});
exports.actionItemSchema = zod_1.z.object({
    task: zod_1.z
        .string()
        .describe("Clear action task description extracted from the transcript."),
    owner: zod_1.z
        .string()
        .describe("Name of the person assigned to the task. Use 'Unassigned' if not mentioned."),
    dueDate: zod_1.z
        .string()
        .describe("Due date string (e.g. YYYY-MM-DD or relative like 'Next Friday'). Use 'Not specified' if not mentioned."),
    priority: zod_1.z
        .enum(["Low", "Medium", "High", "Urgent"])
        .describe("Inferred priority level based on context (default 'Medium')."),
    status: zod_1.z
        .enum(["Open", "In Progress", "Blocked", "Completed", "Pending"])
        .describe("Current status of the task (default 'Open')."),
});
exports.meetingSummarySchema = zod_1.z.object({
    purpose: zod_1.z
        .string()
        .describe("Concise statement describing the primary goal or purpose of the meeting."),
    discussionPoints: zod_1.z
        .array(zod_1.z.string())
        .describe("Key topics, themes, and important discussion points covered during the meeting."),
    majorOutcomes: zod_1.z
        .array(zod_1.z.string())
        .describe("Decisions made, key milestones reached, or key conclusions agreed upon."),
    importantConcerns: zod_1.z
        .array(zod_1.z.string())
        .describe("Risks, obstacles, unresolved issues, or critical questions raised."),
    nextSteps: zod_1.z
        .array(zod_1.z.string())
        .describe("Action items, assigned tasks, follow-up deadlines, and next milestones."),
    keyDecisions: zod_1.z
        .array(exports.keyDecisionSchema)
        .describe("List of clear, explicit key decisions made during the meeting (e.g. Technology/Platform, Feature Approval, Timeline, Scope, Budget, Responsibility). If NO clear decisions were made, return an empty array []; DO NOT invent decisions."),
    actionItems: zod_1.z
        .array(exports.actionItemSchema)
        .describe("List of extracted actionable tasks with Task Description, Owner, Due Date, Priority, and Status. Handle missing information sensibly (Owner='Unassigned', DueDate='Not specified'). DO NOT invent ungrounded details."),
});
const stripHtml = (input) => {
    if (!input)
        return "";
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
    }
    else {
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
exports.stripHtml = stripHtml;
const cleanSummary = (summary) => {
    return {
        purpose: (0, exports.stripHtml)(summary.purpose) || "General meeting discussion and updates.",
        discussionPoints: (summary.discussionPoints || [])
            .map(exports.stripHtml)
            .filter((s) => s.length > 0),
        majorOutcomes: (summary.majorOutcomes || [])
            .map(exports.stripHtml)
            .filter((s) => s.length > 0),
        importantConcerns: (summary.importantConcerns || [])
            .map(exports.stripHtml)
            .filter((s) => s.length > 0),
        nextSteps: (summary.nextSteps || [])
            .map(exports.stripHtml)
            .filter((s) => s.length > 0),
        keyDecisions: (summary.keyDecisions || [])
            .map((kd) => ({
            category: (0, exports.stripHtml)(kd.category) || "General Decision",
            decision: (0, exports.stripHtml)(kd.decision),
            context: kd.context ? (0, exports.stripHtml)(kd.context) : undefined,
        }))
            .filter((kd) => kd.decision.length > 0),
        actionItems: (summary.actionItems || [])
            .map((item) => ({
            ...item,
            task: (0, exports.stripHtml)(item.task),
            owner: (0, exports.stripHtml)(item.owner) || "Unassigned",
            dueDate: (0, exports.stripHtml)(item.dueDate) || "Not specified",
            priority: item.priority || "Medium",
            status: item.status || "Pending",
        }))
            .filter((item) => item.task.length > 0),
    };
};
exports.cleanSummary = cleanSummary;
/**
 * Heuristic fallback generator when AI API Key is not set or API call is skipped
 */
const generateFallbackSummary = (rawTranscript, title) => {
    const plainTranscript = (0, exports.stripHtml)(rawTranscript);
    const lines = plainTranscript
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.length > 0 && !l.startsWith("<"));
    const cleanText = plainTranscript.trim();
    if (!cleanText) {
        return (0, exports.cleanSummary)({
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
    const extractedDecisions = [];
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
    const extractedActionItems = points.slice(0, 3).map((p) => {
        let owner = "Unassigned";
        // Simple heuristic name detection
        if (p.toLowerCase().includes("sarah"))
            owner = "Sarah";
        else if (p.toLowerCase().includes("alex"))
            owner = "Alex";
        else if (p.toLowerCase().includes("john"))
            owner = "John";
        else if (p.includes("@")) {
            const match = p.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
            if (match)
                owner = match[0].split("@")[0];
        }
        return {
            task: p,
            owner,
            dueDate: "Not specified",
            priority: "Medium",
            status: "Pending",
        };
    });
    return (0, exports.cleanSummary)({
        purpose: title
            ? `Meeting regarding ${title}: ${points[0] || cleanText.slice(0, 100)}`
            : `Review and discussion covering key updates: ${points[0] || cleanText.slice(0, 100)}`,
        discussionPoints: points.length > 0
            ? points.slice(0, 4)
            : ["Discussed project workflow, current progress, and operational updates."],
        majorOutcomes: points.length > 2
            ? [points[1] || "Agreed on project approach and key action points."]
            : ["Reviewed status and validated current action items."],
        importantConcerns: points.length > 4
            ? [points[3] || "Monitor progress and address pending dependencies promptly."]
            : ["Keep team aligned on project dependencies and deadlines."],
        nextSteps: points.length > 5
            ? points.slice(4, 7)
            : [
                "Complete assigned action items discussed in transcript.",
                "Share updated documentation with team members.",
            ],
        keyDecisions: extractedDecisions,
        actionItems: extractedActionItems,
    });
};
exports.generateFallbackSummary = generateFallbackSummary;
/**
 * Generate AI-Powered Structured Meeting Summary using Vercel AI SDK
 */
const generateMeetingSummary = async (rawTranscript, customApiKey, title) => {
    const apiKey = customApiKey || process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;
    const plainTranscript = (0, exports.stripHtml)(rawTranscript);
    if (!plainTranscript || plainTranscript.trim().length === 0) {
        return (0, exports.generateFallbackSummary)("", title);
    }
    if (!apiKey) {
        console.warn("⚠️ No Gemini/Google AI API Key provided. Using structured heuristic summary fallback.");
        return (0, exports.generateFallbackSummary)(plainTranscript, title);
    }
    try {
        const google = (0, google_1.createGoogleGenerativeAI)({
            apiKey,
        });
        const { object } = await (0, ai_1.generateObject)({
            model: google("gemini-3.5-flash"),
            schema: exports.meetingSummarySchema,
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
        return (0, exports.cleanSummary)(object);
    }
    catch (error) {
        console.error("Error generating AI summary via Vercel AI SDK:", error);
        console.warn("Falling back to structured heuristic summary generator.");
        return (0, exports.generateFallbackSummary)(plainTranscript, title);
    }
};
exports.generateMeetingSummary = generateMeetingSummary;
