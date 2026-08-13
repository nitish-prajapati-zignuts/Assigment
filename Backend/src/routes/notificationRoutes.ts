import { Router } from "express";
import {
  getNotifications,
  markAllNotificationsRead,
  clearNotifications,
} from "../controllers/notificationController";
import { protect } from "../middleware/authMiddleware";

const router = Router();

router.use(protect);

router.get("/", getNotifications);
router.patch("/read-all", markAllNotificationsRead);
router.delete("/", clearNotifications);

export default router;
