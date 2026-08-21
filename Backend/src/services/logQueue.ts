import { Queue, Worker } from "bullmq";
import IORedis from "ioredis";
import { config } from "../utils/config";
import db from "../db";
import { requestLogs } from "../db/schema";
import { logger } from "../utils/logger";

// Create a reusable Redis connection
export const redisConnection = new IORedis({
  host: config.REDIS_HOST,
  port: config.REDIS_PORT,
  maxRetriesPerRequest: null, // Required by BullMQ
});

// Create the log queue
export const logQueue = new Queue("request-logs", {
  connection: redisConnection,
});

// Create the worker to process log storage
export const logWorker = new Worker(
  "request-logs",
  async (job) => {
    const { method, path, status, duration, ipAddress, userAgent, userId, serviceId, createdAt } = job.data;
    try {
      await db.insert(requestLogs).values({
        method,
        path,
        status: Number(status),
        duration,
        ipAddress,
        userAgent,
        userId,
        serviceId,
        createdAt: createdAt ? new Date(createdAt) : new Date(),
      });
    } catch (error) {
      logger.error("Failed to write request log to database in BullMQ worker", error as Error);
      throw error; // Re-throw to trigger BullMQ retry logic
    }
  },
  {
    connection: redisConnection,
    concurrency: 5, // Process up to 5 logs concurrently
  }
);

logWorker.on("completed", (job) => {
  logger.info(`Request log job ${job.id} completed successfully`);
});

logWorker.on("failed", (job, err) => {
  logger.error(`Request log job ${job?.id} failed`, err);
});
