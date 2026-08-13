import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { ValidationError } from "../utils/errors";

/**
 * Generate a CSRF token
 */
export const generateCSRFToken = (): string => {
  return crypto.randomBytes(32).toString("hex");
};

/**
 * CSRF Token Generation Middleware
 * Generates a CSRF token and stores it in cookies and request object
 */
export const csrfTokenGenerator = (req: Request, res: Response, next: NextFunction): void => {
  let token = req.cookies?._csrf;

  if (!token) {
    token = generateCSRFToken();
    res.cookie("_csrf", token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });
  }

  (res as any).locals = { ...(res as any).locals, csrfToken: token };

  next();
};

/**
 * CSRF Token Validation Middleware
 * Validates CSRF tokens on state-changing requests (POST, PUT, DELETE, PATCH)
 */
export const csrfProtect = (req: Request, res: Response, next: NextFunction): void => {
  const statefulMethods = ["POST", "PUT", "DELETE", "PATCH"];

  // Bypass CSRF in non-production environments or for API clients like Postman
  if (process.env.NODE_ENV !== "production" || req.headers["user-agent"]?.includes("PostmanRuntime")) {
    return next();
  }

  if (!statefulMethods.includes(req.method)) {
    return next();
  }

  const tokenFromHeader = req.headers["x-csrf-token"] as string;
  const tokenFromBody = (req.body as any)?._csrf;
  const tokenFromQuery = (req.query as any)?._csrf;

  const submittedToken = tokenFromHeader || tokenFromBody || tokenFromQuery;
  const cookieToken = req.cookies?._csrf;

  if (!submittedToken) {
    throw new ValidationError("CSRF token is missing");
  }

  if (!cookieToken) {
    throw new ValidationError("CSRF token cookie is missing");
  }

  if (submittedToken !== cookieToken) {
    throw new ValidationError("CSRF token validation failed");
  }

  next();
};

/**
 * Alternative CSRF Protection using SameSite Cookies
 * Modern browsers with SameSite support don't need CSRF tokens for same-site requests
 * This is configured in the server setup
 */
export const sameSiteConfig = {
  development: {
    sameSite: "lax" as const,
    secure: false,
  },
  production: {
    sameSite: "strict" as const,
    secure: true,
  },
};

/**
 * Get appropriate SameSite configuration
 */
export const getSameSiteConfig = (env: string = process.env.NODE_ENV || "development") => {
  return env === "production" ? sameSiteConfig.production : sameSiteConfig.development;
};
