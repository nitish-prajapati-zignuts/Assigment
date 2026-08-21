import { Queue, Worker } from "bullmq";
import IORedis from "ioredis";
import { config } from "../utils/config";
import { logger } from "../utils/logger";

export type JobStatus = "pending" | "processing" | "completed" | "failed";

export interface Job<T = any> {
  id: string;
  type: string;
  status: JobStatus;
  data: T;
  result?: any;
  error?: string;
  attempts: number;
  maxAttempts: number;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

export interface JobHandler<T = any> {
  (data: T): Promise<any>;
}

// Reusable Redis connection
const redisConnection = new IORedis({
  host: config.REDIS_HOST,
  port: config.REDIS_PORT,
  maxRetriesPerRequest: null,
});

class JobQueue {
  private queue: Queue;
  private worker: Worker | null = null;
  private handlers: Map<string, JobHandler> = new Map();

  constructor() {
    this.queue = new Queue("syncra-jobs", {
      connection: redisConnection,
    });
  }

  /**
   * Return underlying BullMQ Queue for UI dashboard adapters
   */
  getNativeQueue(): Queue {
    return this.queue;
  }

  /**
   * Register a job handler
   */
  registerHandler<T>(type: string, handler: JobHandler<T>): void {
    this.handlers.set(type, handler);
    logger.debug(`Job handler registered: ${type}`);

    // Lazily start the worker when the first handler is registered
    if (!this.worker) {
      this.startWorker();
    }
  }

  /**
   * Start the BullMQ worker
   */
  private startWorker(): void {
    this.worker = new Worker(
      "syncra-jobs",
      async (bullJob) => {
        const handler = this.handlers.get(bullJob.name);
        if (!handler) {
          throw new Error(`No handler registered for job type: ${bullJob.name}`);
        }
        return await handler(bullJob.data);
      },
      {
        connection: redisConnection,
        concurrency: 3, // Keep the same concurrent job count as original (maxConcurrent = 3)
      }
    );

    this.worker.on("active", (job) => {
      logger.info(`Processing job: ${job.name}`, {
        jobId: job.id,
        attempt: job.attemptsMade + 1,
      });
    });

    this.worker.on("completed", (job) => {
      logger.info(`Job completed: ${job.name}`, {
        jobId: job.id,
      });
    });

    this.worker.on("failed", (job, err) => {
      logger.error(`Job failed: ${job?.name}`, err, {
        jobId: job?.id,
      });
    });
  }

  /**
   * Add a job to the queue
   */
  async addJob<T>(type: string, data: T, maxAttempts = 3): Promise<string> {
    const bullJob = await this.queue.add(type, data, {
      attempts: maxAttempts,
      backoff: {
        type: "exponential",
        delay: 1000,
      },
      removeOnComplete: false, // Keep completed jobs so getJob can query them
      removeOnFail: false, // Keep failed jobs so getJob can query them
    });

    logger.debug(`Job queued: ${type}`, { jobId: bullJob.id });
    return bullJob.id || "";
  }

  /**
   * Get job status
   */
  async getJob(jobId: string): Promise<Job | undefined> {
    const bullJob = await this.queue.getJob(jobId);
    if (!bullJob) return undefined;

    const state = await bullJob.getState();
    let status: JobStatus = "pending";
    if (state === "active") {
      status = "processing";
    } else if (state === "completed") {
      status = "completed";
    } else if (state === "failed") {
      status = "failed";
    }

    return {
      id: bullJob.id || "",
      type: bullJob.name,
      status,
      data: bullJob.data,
      result: bullJob.returnvalue,
      error: bullJob.failedReason,
      attempts: bullJob.attemptsMade,
      maxAttempts: bullJob.opts.attempts || 3,
      createdAt: new Date(bullJob.timestamp),
      startedAt: bullJob.processedOn ? new Date(bullJob.processedOn) : undefined,
      completedAt: bullJob.finishedOn ? new Date(bullJob.finishedOn) : undefined,
    };
  }

  /**
   * Mock getJobsByType
   */
  async getJobsByType(type: string): Promise<Job[]> {
    const bullJobs = await this.queue.getJobs(["waiting", "active", "completed", "failed"]);
    const mapped: Job[] = [];
    for (const job of bullJobs) {
      if (job.name === type) {
        const state = await job.getState();
        let status: JobStatus = "pending";
        if (state === "active") status = "processing";
        else if (state === "completed") status = "completed";
        else if (state === "failed") status = "failed";

        mapped.push({
          id: job.id || "",
          type: job.name,
          status,
          data: job.data,
          result: job.returnvalue,
          error: job.failedReason,
          attempts: job.attemptsMade,
          maxAttempts: job.opts.attempts || 3,
          createdAt: new Date(job.timestamp),
          startedAt: job.processedOn ? new Date(job.processedOn) : undefined,
          completedAt: job.finishedOn ? new Date(job.finishedOn) : undefined,
        });
      }
    }
    return mapped;
  }

  /**
   * cleanup - no-op for BullMQ as we can use BullMQ built-in cleaning
   */
  cleanup(): void {}

  /**
   * Get queue statistics
   */
  async getStats() {
    const counts = await this.queue.getJobCounts();
    return {
      total: counts.waiting + counts.active + counts.completed + counts.failed + counts.delayed,
      pending: counts.waiting + counts.delayed,
      processing: counts.active,
      completed: counts.completed,
      failed: counts.failed,
      queueLength: counts.waiting,
      activeJobs: counts.active,
    };
  }
}

// Singleton instance
export const jobQueue = new JobQueue();
