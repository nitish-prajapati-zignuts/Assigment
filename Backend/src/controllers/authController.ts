import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import { generateToken } from "../utils/jwt";
import { AuthenticatedRequest } from "../middleware/authMiddleware";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: (process.env.NODE_ENV === "production" ? "none" : "lax") as "none" | "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

/**
 * Register a new user
 * POST /api/auth/register
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ error: "Name, email, and password are required." });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: "Password must be at least 6 characters long." });
      return;
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, cleanEmail));

    if (existingUser.length > 0) {
      res.status(400).json({ error: "User with this email already exists." });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUserId = Date.now().toString();

    const inserted = await db
      .insert(users)
      .values({
        id: newUserId,
        name,
        email: cleanEmail,
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
    console.error("Register Error:", error);
    res.status(500).json({ error: "Internal server error during registration." });
  }
};

/**
 * Authenticate user & get token
 * POST /api/auth/login
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required." });
      return;
    }

    const cleanEmail = email.toLowerCase().trim();

    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, cleanEmail));

    if (result.length === 0) {
      res.status(401).json({ error: "Invalid email or password." });
      return;
    }

    const user = result[0];

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ error: "Invalid email or password." });
      return;
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    // Set HTTP-only Cookie in response headers
    res.cookie("token", token, COOKIE_OPTIONS);

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
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Internal server error during login." });
  }
};

/**
 * Get all registered application users
 * GET /api/auth/users
 */
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const allUsers = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        createdAt: users.createdAt,
      })
      .from(users);

    res.json(allUsers);
  } catch (error) {
    console.error("GetUsers Error:", error);
    res.status(500).json({ error: "Failed to fetch registered users." });
  }
};

/**
 * Get current authenticated user details
 * GET /api/auth/me
 */
export const getMe = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    res.json({
      user: req.user,
    });
  } catch (error) {
    console.error("GetMe Error:", error);
    res.status(500).json({ error: "Failed to fetch user profile." });
  }
};

/**
 * Clear auth cookie and logout user
 * POST /api/auth/logout
 */
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: (process.env.NODE_ENV === "production" ? "none" : "lax") as "none" | "lax",
    });
    res.json({ message: "Logout successful" });
  } catch (error) {
    console.error("Logout Error:", error);
    res.status(500).json({ error: "Failed to logout." });
  }
};
