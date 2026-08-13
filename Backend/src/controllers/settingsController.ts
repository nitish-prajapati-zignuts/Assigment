import { Response } from "express";
import db from "../db";
import { userSettings, users } from "../db/schema";
import { eq } from "drizzle-orm";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { asyncHandler } from "../middleware/errorHandler";
import { NotFoundError, ValidationError, InternalServerError } from "../utils/errors";
import { logger } from "../utils/logger";

const DEFAULT_PROMPT = "Focus heavily on technical decisions, code deliverables, and explicit action item due dates.";

/**
 * GET /api/settings
 * Retrieves the current authenticated user's settings.
 * Auto-creates default settings if record does not exist yet.
 */
export const getUserSettings = asyncHandler(async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const userEmail = req.user?.email;

  if (!userEmail) {
    throw new ValidationError("User authentication required");
  }

  // Find user by email to get user ID
  const foundUsers = await db.select().from(users).where(eq(users.email, userEmail.toLowerCase()));
  if (foundUsers.length === 0) {
    throw new NotFoundError("User account");
  }
  const userId = foundUsers[0].id;

  const existingSettings = await db.select().from(userSettings).where(eq(userSettings.userId, userId));

  if (existingSettings.length > 0) {
    res.json(existingSettings[0]);
    return;
  }

  // Auto-create default user settings row
  const defaultRow = {
    userId,
    summaryLength: "Medium",
    template: "Standard",
    customPrompt: DEFAULT_PROMPT,
    autoExtractActionItems: true,
    emailNotifications: true,
    weeklyDigest: false,
    slackWebhookUrl: "",
    updatedAt: new Date(),
  };

  const inserted = await db.insert(userSettings).values(defaultRow).returning();
  logger.info("Created default user settings record", { userId, userEmail });
  res.json(inserted[0]);
});

/**
 * PUT /api/settings
 * Updates/Upserts user settings.
 */
export const updateUserSettings = asyncHandler(async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const userEmail = req.user?.email;
  const {
    summaryLength,
    template,
    customPrompt,
    autoExtractActionItems,
    emailNotifications,
    weeklyDigest,
    slackWebhookUrl,
  } = req.body;

  if (!userEmail) {
    throw new ValidationError("User authentication required");
  }

  const foundUsers = await db.select().from(users).where(eq(users.email, userEmail.toLowerCase()));
  if (foundUsers.length === 0) {
    throw new NotFoundError("User account");
  }
  const userId = foundUsers[0].id;

  const updatedData = {
    summaryLength: summaryLength || "Medium",
    template: template || "Standard",
    customPrompt: customPrompt !== undefined ? customPrompt : DEFAULT_PROMPT,
    autoExtractActionItems: autoExtractActionItems !== undefined ? Boolean(autoExtractActionItems) : true,
    emailNotifications: emailNotifications !== undefined ? Boolean(emailNotifications) : true,
    weeklyDigest: weeklyDigest !== undefined ? Boolean(weeklyDigest) : false,
    slackWebhookUrl: slackWebhookUrl || "",
    updatedAt: new Date(),
  };

  const existing = await db.select().from(userSettings).where(eq(userSettings.userId, userId));

  let result;
  if (existing.length > 0) {
    result = await db
      .update(userSettings)
      .set(updatedData)
      .where(eq(userSettings.userId, userId))
      .returning();
  } else {
    result = await db
      .insert(userSettings)
      .values({ userId, ...updatedData })
      .returning();
  }

  logger.info("Updated user settings", { userId, userEmail });

  const { createNotificationLog } = await import("./notificationController");
  createNotificationLog({
    userId,
    title: "Preferences Saved",
    message: `Your AI summarization rules & settings were updated.`,
    type: "general",
  });

  res.json(result[0]);
});


/**
 * GET /api/settings/sessions
 * Returns active login session history (IP address, device, browser, OS, location, last active timestamp).
 */
export const getUserSessions = asyncHandler(async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const userEmail = req.user?.email;

  if (!userEmail) {
    throw new ValidationError("User authentication required");
  }

  const foundUsers = await db.select().from(users).where(eq(users.email, userEmail.toLowerCase()));
  if (foundUsers.length === 0) {
    throw new NotFoundError("User account");
  }
  const userId = foundUsers[0].id;

  const { userSessions } = await import("../db/schema");
  const sessions = await db
    .select()
    .from(userSessions)
    .where(eq(userSessions.userId, userId));

  if (sessions.length === 0) {
    // Return mock current session details if user registered prior to session tracking
    const rawIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1";
    const ipAddress = Array.isArray(rawIp) ? rawIp[0] : String(rawIp).split(",")[0].trim();
    const userAgent = req.headers["user-agent"] || "";

    let device = "Desktop";
    if (/mobile/i.test(userAgent)) device = "Mobile";

    let browser = "Chrome";
    if (/firefox/i.test(userAgent)) browser = "Firefox";
    else if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) browser = "Safari";

    let os = "Mac OS X";
    if (/windows/i.test(userAgent)) os = "Windows";

    res.json([
      {
        id: "sess-current",
        userId,
        ipAddress: ipAddress === "::1" ? "127.0.0.1" : ipAddress,
        device,
        browser,
        os,
        location: "Current Session (Localhost)",
        isCurrent: true,
        lastActive: new Date(),
        createdAt: new Date(),
      },
    ]);
    return;
  }

  res.json(sessions);
});

