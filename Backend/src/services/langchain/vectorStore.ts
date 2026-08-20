import { embed, embedMany } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { sql, eq, and, desc } from "drizzle-orm";
import db from "../../db";
import { userMemoryEmbeddings, UserMemoryEmbeddingRecord } from "../../db/schema";
import { logger } from "../../utils/logger";

export interface MemoryChunkInput {
  id: string;
  userId: string;
  sourceType: "meeting_summary" | "meeting_transcript" | "action_item" | "decision";
  sourceId: string;
  content: string;
  metadata?: Record<string, any>;
}

export interface RetrievedMemoryChunk {
  id: string;
  userId: string;
  sourceType: string;
  sourceId: string;
  content: string;
  metadata: Record<string, any>;
  similarity: number;
}

function getApiKeysPool(): string[] {
  const primaryKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;
  const fallbackKey = process.env.GEMINI_FALL_BACK_KEY;
  const rawKeysString = process.env.GEMINI_API_KEYS;

  const pool: string[] = [];
  if (primaryKey) pool.push(primaryKey);
  if (rawKeysString) {
    rawKeysString
      .split(",")
      .map((k) => k.replace(/^["']|["']$/g, "").trim())
      .filter((k) => k.length > 0)
      .forEach((k) => {
        if (!pool.includes(k)) pool.push(k);
      });
  }
  if (fallbackKey && !pool.includes(fallbackKey)) pool.push(fallbackKey);

  return pool;
}

/**
 * Generate embedding vector for a single text string (1536 dims) with key rotation
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const apiKeys = getApiKeysPool();

  if (apiKeys.length === 0) {
    throw new Error("No Gemini API keys available for embedding generation");
  }

  let lastError: any = null;

  for (let i = 0; i < apiKeys.length; i++) {
    const apiKey = apiKeys[i];
    try {
      const google = createGoogleGenerativeAI({ apiKey });
      const { embedding } = await embed({
        model: google.embedding("gemini-embedding-001"),
        value: text,
        providerOptions: {
          google: {
            outputDimensionality: 1536,
          },
        },
      });
      return embedding;
    } catch (err: any) {
      lastError = err;
      logger.warn(`Embedding generation failed with key #${i + 1}, trying next key in pool...`, {
        error: err?.message || String(err),
      });
    }
  }

  throw lastError || new Error("All API keys in rotation pool failed to generate embedding");
}

/**
 * Upsert memory chunks into user_memory_embeddings vector database
 */
export async function storeUserMemoryChunks(chunks: MemoryChunkInput[]): Promise<void> {
  if (chunks.length === 0) return;

  try {
    for (const chunk of chunks) {
      const vector = await generateEmbedding(chunk.content);

      // Check if chunk already exists
      const existing = await db.select().from(userMemoryEmbeddings).where(eq(userMemoryEmbeddings.id, chunk.id));

      if (existing.length > 0) {
        await db
          .update(userMemoryEmbeddings)
          .set({
            content: chunk.content,
            metadata: chunk.metadata || {},
            embedding: vector,
            updatedAt: new Date(),
          })
          .where(eq(userMemoryEmbeddings.id, chunk.id));
      } else {
        await db.insert(userMemoryEmbeddings).values({
          id: chunk.id,
          userId: chunk.userId,
          sourceType: chunk.sourceType,
          sourceId: chunk.sourceId,
          content: chunk.content,
          metadata: chunk.metadata || {},
          embedding: vector,
        });
      }
    }
  } catch (error) {
    logger.error("Error storing user memory chunks in pgvector", error as Error);
    throw error;
  }
}

/**
 * Delete memory chunks by source ID (e.g. when a meeting or action item is deleted)
 */
export async function deleteUserMemoryBySource(sourceId: string): Promise<void> {
  try {
    await db.delete(userMemoryEmbeddings).where(eq(userMemoryEmbeddings.sourceId, sourceId));
  } catch (error) {
    logger.error("Error deleting user memory by sourceId", error as Error, { sourceId });
  }
}

/**
 * Perform vector similarity search scoped to a specific userId
 */
export async function searchUserMemory(
  userId: string,
  query: string,
  topK = 6,
  sourceTypeFilter?: string
): Promise<RetrievedMemoryChunk[]> {
  try {
    const queryEmbedding = await generateEmbedding(query);

    let whereClause = eq(userMemoryEmbeddings.userId, userId);
    if (sourceTypeFilter) {
      whereClause = and(
        eq(userMemoryEmbeddings.userId, userId),
        eq(userMemoryEmbeddings.sourceType, sourceTypeFilter)
      ) as any;
    }

    // Perform cosine similarity search: similarity = 1 - (embedding <=> queryEmbedding)
    const results = await db
      .select({
        id: userMemoryEmbeddings.id,
        userId: userMemoryEmbeddings.userId,
        sourceType: userMemoryEmbeddings.sourceType,
        sourceId: userMemoryEmbeddings.sourceId,
        content: userMemoryEmbeddings.content,
        metadata: userMemoryEmbeddings.metadata,
        similarity: sql<number>`1 - (${userMemoryEmbeddings.embedding} <=> ${JSON.stringify(queryEmbedding)}::vector)`,
      })
      .from(userMemoryEmbeddings)
      .where(whereClause)
      .orderBy(sql`${userMemoryEmbeddings.embedding} <=> ${JSON.stringify(queryEmbedding)}::vector`)
      .limit(topK);

    return results.map((r) => ({
      ...r,
      metadata: (r.metadata as Record<string, any>) || {},
    }));
  } catch (error) {
    logger.error("Vector similarity search failed for user memory", error as Error, { userId });
    return [];
  }
}
