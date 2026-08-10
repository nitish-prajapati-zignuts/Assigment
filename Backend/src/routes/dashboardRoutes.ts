import { Router } from "express";
import { getDashboardStats } from "../controllers/dashboardController";
import { protect } from "../middleware/authMiddleware";

const router = Router();

router.use(protect);

// GET /api/dashboard/stats - Fetch summary metrics & recent meetings
router.get("/stats", getDashboardStats);

export default router;
