import { Router } from "express";
import { getUserSettings, updateUserSettings, getUserSessions } from "../controllers/settingsController";
import { protect } from "../middleware/authMiddleware";

const router = Router();

// Protect all settings routes with protect middleware
router.use(protect);

router.get("/", getUserSettings);
router.put("/", updateUserSettings);
router.get("/sessions", getUserSessions);

export default router;
