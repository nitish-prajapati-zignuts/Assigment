import { Router } from "express";
import { register, login, logout, getUsers, getMe, changePassword } from "../controllers/authController";
import { protect } from "../middleware/authMiddleware";
import { validateBody } from "../middleware/validation";
import { registerSchema, loginSchema, updatePasswordSchema } from "../utils/validation";
import { asyncHandler } from "../middleware/errorHandler";

const router = Router();

// Public routes (with validation)
router.post("/register", validateBody(registerSchema), register);
router.post("/login", validateBody(loginSchema), login);
router.post("/logout", logout);
router.get("/users", asyncHandler(getUsers));
router.post("/change-password", protect, validateBody(updatePasswordSchema), changePassword);

// Protected routes
router.get("/me", protect, getMe);

export default router;
