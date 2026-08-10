import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import db from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import { generateToken } from "../utils/jwt";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { asyncHandler } from "../middleware/errorHandler";
import { logger } from "../utils/logger";
import { 
  AuthenticationError, 
  ConflictError, 
  ValidationError, 
  InternalServerError 
} from "../utils/errors";
import { RegisterInput, LoginInput } from "../utils/validation";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: (process.env.NODE_ENV === "production" ? "none" : "lax") as "none" | "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

/**
 * POST /api/auth/register
 * Registers a new user account with hashed password (bcryptjs), creates database record,
 * and sets an HTTP-only JWT authentication cookie.
 */
export const register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { name, email, password } = req.body as RegisterInput;

  logger.debug("Registration attempt", { email });

  // Check if user already exists
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email));

  if (existingUser.length > 0) {
    throw new ConflictError("User with this email already exists");
  }

  // Hash password with salt rounds for security
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUserId = Date.now().toString();

  try {
    const inserted = await db
      .insert(users)
      .values({
        id: newUserId,
        name,
        email,
        password: hashedPassword,
      })
      .returning();

    const createdUser = inserted[0];
    const token = generateToken({
      userId: createdUser.id,
      email: createdUser.email,
      name: createdUser.name,
    });

    // Set HTTP-only Cookie in response headers
    res.cookie("token", token, COOKIE_OPTIONS);

    logger.info("User registered successfully", { userId: createdUser.id, email: createdUser.email });

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: createdUser.id,
        name: createdUser.name,
        email: createdUser.email,
        createdAt: createdUser.createdAt,
      },
    });
  } catch (error) {
    logger.error("Database error during registration", error as Error, { email });
    throw new InternalServerError("Failed to register user");
  }
});

/**
 * POST /api/auth/login
 * Authenticates user credentials using password comparison (bcrypt.compare),
 * generates a signed JWT token, and returns user session object with HTTP-only cookie.
 */
export const login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as LoginInput;

  logger.debug("Login attempt", { email });

  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, email));

  if (result.length === 0) {
    // Log failed attempt but don't reveal user doesn't exist
    logger.warn("Login failed: user not found", { email });
    throw new AuthenticationError("Invalid email or password");
  }

  const user = result[0];

  // Compare passwords
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    logger.warn("Login failed: invalid password", { email, userId: user.id });
    throw new AuthenticationError("Invalid email or password");
  }

  const token = generateToken({
    userId: user.id,
    email: user.email,
    name: user.name,
  });

  // Set HTTP-only Cookie in response headers
  res.cookie("token", token, COOKIE_OPTIONS);

  logger.info("User logged in successfully", { userId: user.id, email: user.email });

  res.json({
    message: "Login successful",
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    },
  });
});

/**
 * GET /api/auth/users
 * Fetches list of all registered application users (excluding password hashes)
 * for UI participant selection and action item assignment dropdowns.
 */
export const getUsers = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const allUsers = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        createdAt: users.createdAt,
      })
      .from(users);

    logger.debug("Fetched users list", { count: allUsers.length });

    res.json(allUsers);
  } catch (error) {
    logger.error("Failed to fetch users", error as Error);
    throw new InternalServerError("Failed to fetch registered users");
  }
});

/**
 * GET /api/auth/me
 * Retrieves current authenticated user session details from verified JWT payload.
 */
export const getMe = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (!req.user) {
      throw new AuthenticationError("Not authenticated");
    }

    logger.debug("User profile requested", { userId: req.user.userId });

    res.json({
      user: req.user,
    });
  }
);

/**
 * POST /api/auth/logout
 * Clears the HTTP-only JWT authentication cookie (token) to log out the user.
 */
export const logout = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: (process.env.NODE_ENV === "production" ? "none" : "lax") as "none" | "lax",
  });

  logger.info("User logged out successfully", { userId: (req as any).user?.userId });

  res.json({ message: "Logout successful" });
});
