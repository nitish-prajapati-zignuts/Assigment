import { Router, Request, Response } from "express";
import { protect } from "../middleware/authMiddleware";
import { asyncHandler } from "../middleware/errorHandler";
import { jobQueue } from "../services/jobQueue";
import { NotFoundError } from "../utils/errors";

const router = Router();

router.use(protect);

/**
 * GET /api/jobs/:id
 * Get status and result of a queued background job
 */
router.get(
  "/:id",
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const jobId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const job = jobQueue.getJob(jobId);

    if (!job) {
      throw new NotFoundError("Job");
    }

    res.json({
      id: job.id,
      type: job.type,
      status: job.status,
      result: job.result,
      error: job.error,
      createdAt: job.createdAt,
      startedAt: job.startedAt,
      completedAt: job.completedAt,
    });
  })
);

export default router;
