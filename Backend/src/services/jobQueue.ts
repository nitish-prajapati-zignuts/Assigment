/**
 * Job Queue System for Async Processing
 * Implements a simple in-memory queue for background task processing
 * In production, use Bull (Redis-based) or similar for persistence and scalability
 */

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

/**
 * Simple in-memory job queue
 * For production, integrate with Bull + Redis
 */
class JobQueue {
  private jobs: Map<string, Job> = new Map();
  private handlers: Map<string, JobHandler> = new Map();
  private queue: string[] = []; // Array of job IDs
  private isProcessing = false;
  private maxConcurrent = 3;
  private activeJobs = 0;

  /**
   * Register a job handler
   */
  registerHandler<T>(type: string, handler: JobHandler<T>): void {
    this.handlers.set(type, handler);
    logger.debug(`Job handler registered: ${type}`);
  }

  /**
   * Add a job to the queue
   */
  async addJob<T>(type: string, data: T, maxAttempts = 3): Promise<string> {
    const jobId = `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const job: Job<T> = {
      id: jobId,
      type,
      status: "pending",
      data,
      attempts: 0,
      maxAttempts,
      createdAt: new Date(),
    };

    this.jobs.set(jobId, job);
    this.queue.push(jobId);

    logger.debug(`Job queued: ${type}`, { jobId });

    // Start processing if not already processing
    if (!this.isProcessing) {
      this.processQueue();
    }

    return jobId;
  }

  /**
   * Get job status
   */
  getJob(jobId: string): Job | undefined {
    return this.jobs.get(jobId);
  }

  /**
   * Get all jobs by type
   */
  getJobsByType(type: string): Job[] {
    return Array.from(this.jobs.values()).filter((job) => job.type === type);
  }

  /**
   * Get jobs by status
   */
  getJobsByStatus(status: JobStatus): Job[] {
    return Array.from(this.jobs.values()).filter((job) => job.status === status);
  }

  /**
   * Process the queue
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing) return;

    this.isProcessing = true;

    while (this.queue.length > 0 || this.activeJobs > 0) {
      // Fill up to maxConcurrent
      while (this.activeJobs < this.maxConcurrent && this.queue.length > 0) {
        const jobId = this.queue.shift();
        if (jobId) {
          this.activeJobs++;
          this.processJob(jobId).finally(() => {
            this.activeJobs--;
          });
        }
      }

      // Wait a bit before checking again
      if (this.queue.length > 0 || this.activeJobs > 0) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    this.isProcessing = false;
    logger.debug("Job queue processing completed");
  }

  /**
   * Process a single job
   */
  private async processJob(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job) return;

    try {
      job.status = "processing";
      job.startedAt = new Date();
      job.attempts++;

      logger.info(`Processing job: ${job.type}`, {
        jobId,
        attempt: job.attempts,
        maxAttempts: job.maxAttempts,
      });

      const handler = this.handlers.get(job.type);
      if (!handler) {
        throw new Error(`No handler registered for job type: ${job.type}`);
      }

      const result = await handler(job.data);

      job.result = result;
      job.status = "completed";
      job.completedAt = new Date();

      logger.info(`Job completed: ${job.type}`, {
        jobId,
        duration: job.completedAt.getTime() - job.startedAt!.getTime(),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      logger.error(`Job failed: ${job.type}`, error as Error, {
        jobId,
        attempt: job.attempts,
        maxAttempts: job.maxAttempts,
      });

      if (job.attempts < job.maxAttempts) {
        // Retry with exponential backoff
        job.status = "pending";
        const backoffMs = Math.pow(2, job.attempts - 1) * 1000; // 1s, 2s, 4s, etc.
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
        this.queue.push(jobId);
      } else {
        job.status = "failed";
        job.error = errorMessage;
        job.completedAt = new Date();
      }
    }
  }

  /**
   * Clear old completed jobs to prevent memory leak
   */
  cleanup(maxAgeMs = 24 * 60 * 60 * 1000): void {
    const now = Date.now();
    let removed = 0;

    for (const [jobId, job] of this.jobs.entries()) {
      if (
        (job.status === "completed" || job.status === "failed") &&
        now - job.createdAt.getTime() > maxAgeMs
      ) {
        this.jobs.delete(jobId);
        removed++;
      }
    }

    if (removed > 0) {
      logger.debug(`Cleaned up ${removed} old jobs`);
    }
  }

  /**
   * Get queue statistics
   */
  getStats() {
    const allJobs = Array.from(this.jobs.values());

    return {
      total: allJobs.length,
      pending: allJobs.filter((j) => j.status === "pending").length,
      processing: allJobs.filter((j) => j.status === "processing").length,
      completed: allJobs.filter((j) => j.status === "completed").length,
      failed: allJobs.filter((j) => j.status === "failed").length,
      queueLength: this.queue.length,
      activeJobs: this.activeJobs,
    };
  }
}

// Singleton instance
export const jobQueue = new JobQueue();

// Auto-cleanup every hour
setInterval(() => {
  jobQueue.cleanup();
}, 60 * 60 * 1000);
