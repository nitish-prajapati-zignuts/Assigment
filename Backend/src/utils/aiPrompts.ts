import { SummaryLength, SummaryTemplate } from "../db/schema";

export interface BuildMeetingSummaryPromptParams {
  plainTranscript: string;
  title?: string;
  language?: string;
  summaryLength?: SummaryLength;
  template?: SummaryTemplate;
}

/**
 * Builds the AI prompt text for meeting summarization based on transcript, language, length, and template settings.
 */
export function buildMeetingSummaryPrompt({
  plainTranscript,
  title,
  language,
  summaryLength,
  template = "Standard",
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

  let templateInstruction = "";
  switch (template) {
    case "Executive":
      templateInstruction =
        "\nEXECUTIVE SUMMARY FOCUS: Frame all content for C-suite leadership. Populating `executiveDetails` (strategicImpact, financialOrTimelineRisks, executiveRecommendations) is REQUIRED.";
      break;
    case "Developer":
      templateInstruction =
        "\nDEVELOPER FOCUS: Focus on engineering deliverables. Populating `developerDetails` (codeDeliverables, architecturalChanges, apiContractsAndDependencies, technicalBlockers) is REQUIRED.";
      break;
    case "Technical":
      templateInstruction =
        "\nTECHNICAL DECISIONS FOCUS: Focus on system architecture choices. Populating `technicalDetails` (systemArchitectureChoices, techStackTradeoffs, engineeringConstraints) is REQUIRED.";
      break;
    case "Sales":
      templateInstruction =
        "\nSALES LEAD QUALIFICATION FOCUS: Focus on sales lead discovery. Populating `salesDetails` (clientPainPoints, budgetAndAuthority, timelineExpectations, nextSalesSteps) is REQUIRED.";
      break;
    case "Standard":
    default:
      templateInstruction =
        "\nSTANDARD SUMMARY FOCUS: Provide a balanced overview suitable for all team members.";
      break;
  }

  return `You are an expert AI executive assistant. Analyze the following meeting transcript and generate a structured summary.
      
Meeting Title: ${title || "Team Meeting"}
${languageInstruction}
${lengthInstruction}
${templateInstruction}
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
8. Speaker Analytics:
   - Identify distinct speakers from dialogue tags (e.g., 'Alice:', 'Bob:') or estimate participant dialogue distribution.
   - Calculate talkTimePercentage (0-100) and total wordCount for each speaker.
9. Sentiment Analysis:
   - Analyze overall emotional tone ('Positive', 'Neutral', 'Concerned', 'Heated') and calculate overall score (0-100).
   - Provide breakdown percentage values for positive, neutral, concerned, and heated tone in discussion.

CRITICAL RULES:
- The input transcript may contain raw text. All outputs MUST BE in plain text ONLY. DO NOT include any HTML elements (like <div>, <p>, <strong>, <span>) or markdown containers in any output fields.
- If NO clear decision was made, return an empty array [] for keyDecisions. DO NOT invent decisions.
- Handle missing action item details sensibly (Owner='Unassigned', DueDate='Not specified'). DO NOT invent ungrounded details.
`;
}
