import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "./schema";
import { config } from "../utils/config";
import { logger } from "../utils/logger";

/**
 * Database Connection Pool
 * Initializes Neon serverless PostgreSQL connection with WebSocket Pool driver and Drizzle ORM
 */
neonConfig.webSocketConstructor = ws;

const connectionString = config.DATABASE_URL;

if (!connectionString) {
  const error = "DATABASE_URL environment variable is not set";
  logger.error(error, new Error(error));
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

export const db = drizzle(pool, { schema });

pool.on("error", (err: Error | undefined) => {
  logger.error("Unexpected pool error", err);
});

logger.info("Database pool initialized", {
  environment: config.NODE_ENV,
  maxConnections: 10,
});

export default db;
