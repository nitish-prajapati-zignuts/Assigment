import { Router } from "express";
import { register, login, logout, getUsers, getMe } from "../controllers/authController";
import { protect } from "../middleware/authMiddleware";

const router = Router();

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/users", getUsers);

// Protected routes
router.get("/me", protect, getMe);

export default router;
