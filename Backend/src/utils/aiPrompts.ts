import { SummaryLength } from "../db/schema";

export interface BuildMeetingSummaryPromptParams {
  plainTranscript: string;
  title?: string;
  language?: string;
  summaryLength?: SummaryLength;
}

/**
 * Builds the AI prompt text for meeting summarization based on transcript, language, and length settings.
 */
export function buildMeetingSummaryPrompt({
  plainTranscript,
  title,
  language,
  summaryLength,
}: BuildMeetingSummaryPromptParams): string {
  const languageInstruction = language
    ? `\nIMPORTANT LANGUAGE REQUIREMENT:\n- Generate all output summary text, topics, concerns, next steps, key decisions, and action item tasks in ${language}.`
    : "";

  let lengthInstruction = "";
  if (summaryLength === "Short") {
    lengthInstruction =
      "\nSUMMARY LENGTH REQUIREMENT: Keep the output concise and brief (1-2 bullet points per section, high-level summary only).";
  } else if (summaryLength === "Long") {
    lengthInstruction =
      "\nSUMMARY LENGTH REQUIREMENT: Provide an in-depth, thorough, and highly detailed summary covering all nuanced topics, deep context, key decisions, and comprehensive action items.";
  } else {
    lengthInstruction =
      "\nSUMMARY LENGTH REQUIREMENT: Provide a balanced, medium-length summary with clear key discussion points and action items.";
  }

  return `You are an expert AI executive assistant. Analyze the following meeting transcript and generate a structured summary.
      
Meeting Title: ${title || "Team Meeting"}
${languageInstruction}
${lengthInstruction}
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
`;
}
