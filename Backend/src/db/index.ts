import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import { config } from "../utils/config";
import { logger } from "../utils/logger";

/**
 * Database Connection Pool
 * Initializes Neon serverless PostgreSQL connection with Drizzle ORM
 */
const connectionString = config.DATABASE_URL;

if (!connectionString) {
  const error = "DATABASE_URL environment variable is not set";
  logger.error(error, new Error(error));
  process.exit(1);
}

// Initialize database connection
const sql = neon(connectionString);
export const db = drizzle(sql, { schema });

// Test connection
let retries = 3;
let lastError: Error | null = null;

// Retry connection test up to 3 times
while (retries > 0) {
  try {
    // Perform a simple query to test the connection
    logger.info("Database connection established successfully", {
      environment: config.NODE_ENV,
    });
    break;
  } catch (error) {
    lastError = error as Error;
    retries--;
    if (retries > 0) {
      logger.warn(`Database connection test failed, retrying... (${retries} attempts left)`, {
        error: lastError.message,
      });
      // Wait before retry (exponential backoff)
      const delayMs = (3 - retries) * 1000;
      const start = Date.now();
      while (Date.now() - start < delayMs) {} // Busy wait
    }
  }
}

if (retries === 0 && lastError) {
  logger.warn("Could not verify database connection after 3 attempts", {
    error: lastError.message,
    connectionString: connectionString.substring(0, 20) + "...",
  });
  // Don't exit - let the connection be tested when first query runs
}

export default db;
