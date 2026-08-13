import { generateText } from "ai";
import { google, createGoogleGenerativeAI } from "@ai-sdk/google";
import dotenv from "dotenv";

dotenv.config();

export interface ContentChunk {
  id: string;
  type: "transcript" | "summary" | "action_items" | "decisions";
  title: string;
  content: string;
}

export interface RetrievedChunk extends ContentChunk {
  score: number;
}

/**
 * 1. Semantic Chunking Stage:
 * Chunks meeting transcript into overlapping text windows and indexes structured summary components.
 */
export function chunkMeetingContent(meeting: any): ContentChunk[] {
  const chunks: ContentChunk[] = [];
  const meetingTitle = meeting.title || "Meeting";

  // Index Overview & Purpose
  if (meeting.summary?.purpose) {
    chunks.push({
      id: "chunk-summary-purpose",
      type: "summary",
      title: "Meeting Overview & Purpose",
      content: `Meeting Purpose: ${meeting.summary.purpose}`,
    });
  }

  // Index Discussion Points
  if (meeting.summary?.discussionPoints && Array.isArray(meeting.summary.discussionPoints)) {
    chunks.push({
      id: "chunk-summary-discussion",
      type: "summary",
      title: "Main Discussion Points",
      content: `Discussion Points:\n${meeting.summary.discussionPoints.map((d: string) => `- ${d}`).join("\n")}`,
    });
  }

  // Index Major Outcomes
  if (meeting.summary?.majorOutcomes && Array.isArray(meeting.summary.majorOutcomes)) {
    chunks.push({
      id: "chunk-summary-outcomes",
      type: "summary",
      title: "Major Outcomes",
      content: `Major Outcomes:\n${meeting.summary.majorOutcomes.map((o: string) => `- ${o}`).join("\n")}`,
    });
  }

  // Index Action Items
  if (meeting.summary?.actionItems && Array.isArray(meeting.summary.actionItems)) {
    const formattedActions = meeting.summary.actionItems
      .map(
        (a: any) =>
          `Task: ${a.task} | Owner: ${a.owner || "Unassigned"} | Due: ${a.dueDate || "Not specified"} | Priority: ${a.priority || "Medium"} | Status: ${a.status || "Open"}`
      )
      .join("\n");

    chunks.push({
      id: "chunk-action-items",
      type: "action_items",
      title: "Action Items & Deliverables",
      content: `Extracted Action Items:\n${formattedActions}`,
    });
  }

  // Index Key Decisions
  if (meeting.summary?.keyDecisions && Array.isArray(meeting.summary.keyDecisions)) {
    const formattedDecisions = meeting.summary.keyDecisions
      .map((kd: any) => `Category: ${kd.category} | Decision: ${kd.decision} ${kd.context ? `(${kd.context})` : ""}`)
      .join("\n");

    chunks.push({
      id: "chunk-key-decisions",
      type: "decisions",
      title: "Key Decisions Made",
      content: `Key Decisions:\n${formattedDecisions}`,
    });
  }

  // Index Transcript in ~300-word overlapping chunks
  if (meeting.transcript) {
    const plainTranscript = meeting.transcript.replace(/<[^>]*>?/gm, "").trim();
    const words = plainTranscript.split(/\s+/);
    const chunkSize = 250;
    const overlap = 40;

    let chunkIdx = 1;
    for (let i = 0; i < words.length; i += chunkSize - overlap) {
      const windowWords = words.slice(i, i + chunkSize);
      if (windowWords.length < 20) break; // Skip tiny trailing chunks

      chunks.push({
        id: `chunk-transcript-${chunkIdx}`,
        type: "transcript",
        title: `Transcript Snippet #${chunkIdx}`,
        content: windowWords.join(" "),
      });
      chunkIdx++;
    }
  }

  return chunks;
}

/**
 * 2. Vector Context Retrieval Stage:
 * Computes TF-IDF term overlap relevance score between user question and indexed content chunks.
 */
export function retrieveRelevantChunks(chunks: ContentChunk[], query: string, topK = 3): RetrievedChunk[] {
  if (chunks.length === 0) return [];

  const queryTerms = query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter((t) => t.length > 2);

  if (queryTerms.length === 0) {
    // Return summary chunks by default
    return chunks.slice(0, topK).map((c) => ({ ...c, score: 1.0 }));
  }

  const scored = chunks.map((chunk) => {
    const text = (chunk.title + " " + chunk.content).toLowerCase();
    let matches = 0;

    queryTerms.forEach((term) => {
      if (text.includes(term)) {
        matches += 1;
        // Extra boost if term appears in title or structured summaries
        if (chunk.title.toLowerCase().includes(term)) matches += 0.5;
        if (chunk.type !== "transcript") matches += 0.3;
      }
    });

    const score = matches / Math.max(queryTerms.length, 1);
    return { ...chunk, score };
  });

  // Sort descending by score
  scored.sort((a, b) => b.score - a.score);

  // Filter non-zero or return top K
  const relevant = scored.filter((c) => c.score > 0);
  return (relevant.length > 0 ? relevant : scored).slice(0, topK);
}

/**
 * 3. Augmented Prompt Generation (RAG Engine):
 * Synthesizes retrieved context into Gemini LLM prompt to generate grounded answer with citations.
 */
export async function generateRAGAnswer({
  meeting,
  question,
  history = [],
}: {
  meeting: any;
  question: string;
  history?: { role: "user" | "assistant"; content: string }[];
}): Promise<{ answer: string; retrievedSources: { title: string; type: string }[] }> {
  // Step 1: Chunk content & retrieve context
  const chunks = chunkMeetingContent(meeting);
  const topChunks = retrieveRelevantChunks(chunks, question, 4);

  const contextText = topChunks
    .map((c, idx) => `[Source #${idx + 1}: ${c.title}]\n${c.content}`)
    .join("\n\n");

  const promptText = `
You are an expert AI Meeting Assistant answering questions about a meeting titled "${meeting.title || "Meeting"}".

CRITICAL RAG (RETRIEVAL-AUGMENTED GENERATION) INSTRUCTIONS:
1. Base your response STRICTLY on the retrieved context below.
2. If the retrieved context contains the answer, explain it clearly and concisely.
3. Reference the relevant sources if helpful (e.g., "According to the Action Items..." or "In Transcript Snippet #1...").
4. If the question cannot be answered from the meeting context, politely state: "I could not find information regarding that in this meeting's notes or transcript."

====================================
RETRIEVED MEETING CONTEXT:
====================================
${contextText || "No context retrieved."}

====================================
CONVERSATION HISTORY:
${history.map((h) => `${h.role.toUpperCase()}: ${h.content}`).join("\n")}
====================================

USER QUESTION: "${question}"

PROVIDE ACCURATE, GROUNDED ANSWER:
`;

  const primaryGoogleKey = process.env.GEMINI_API_KEY;
  const rotationKeys = (process.env.GEMINI_API_KEYS || "")
    .split(",")
    .map((k) => k.trim())
    .filter((k) => k.length > 0);

  const sources = topChunks.map((c) => ({ title: c.title, type: c.type }));

  // Try Primary Google Key
  if (primaryGoogleKey) {
    try {
      const { text } = await generateText({
        model: google("gemini-3.5-flash-lite"),
        prompt: promptText,
      });
      return { answer: text, retrievedSources: sources };
    } catch (err: any) {
      console.warn("RAG Primary Gemini Key failed, trying rotation pool:", err?.message || err);
    }
  }

  // Try Rotation Pool
  for (const apiKey of rotationKeys) {
    try {
      const g = createGoogleGenerativeAI({ apiKey });
      const { text } = await generateText({
        model: g("gemini-3.5-flash-lite"),
        prompt: promptText,
      });
      return { answer: text, retrievedSources: sources };
    } catch (err) {
      // Continue to next key
    }
  }

  // Fallback heuristic answer if AI keys fail
  const fallbackAnswer = topChunks.length > 0
    ? `Based on retrieved meeting records for "${meeting.title}":\n\n` +
      topChunks.map((c) => `**${c.title}**:\n${c.content}`).join("\n\n")
    : "No matching context found in this meeting notes.";

  return { answer: fallbackAnswer, retrievedSources: sources };
}
