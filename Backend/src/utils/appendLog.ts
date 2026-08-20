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

  // Reject log messages containing newlines to prevent log injection and satisfy CodeQL
  if (/[\r\n]/.test(message)) {
    return;
  }

  try {
    const timestamp = new Date().toISOString();
    console.log(`[RAG Debug] [${timestamp}] ${message}`);
  } catch (err) {
    console.error("Failed to print debug logs:", err);
  }
}
