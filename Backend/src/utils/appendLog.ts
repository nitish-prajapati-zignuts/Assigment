import fs from "fs";
import path from "path";
import { config } from "./config";

const logFilePath = path.join(__dirname, "..", "services", "rag_debug_logs.txt");

/**
 * Global helper to append debug logs to a text file for developer trace tracking.
 * Operations are ignored if ENABLE_DEBUG_LOGGING environment variable is disabled.
 */
export function appendDebugLog(message: string): void {
  // Check if logging is enabled globally via environment variables
  if (!config.ENABLE_DEBUG_LOGGING) {
    return;
  }

  try {
    const timestamp = new Date().toISOString();
    const sanitizedMessage = typeof message === "string"
      ? message.replace(/[\r]/g, "").replace(/[^\x20-\x7E\n\t]/g, "?")
      : "";
    console.log(`[RAG Debug] [${timestamp}] ${sanitizedMessage}`);
  } catch (err) {
    console.error("Failed to print debug logs:", err);
  }
}
