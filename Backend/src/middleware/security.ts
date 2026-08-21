/**
 * Security Middleware
 * Implements various security headers and protections
 */

import xss from "xss";
import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";
import { db } from "../db";
import { requestLogs } from "../db/schema";

/**
 * Security Headers Middleware
 * Sets recommended security headers for production
 */
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Prevent clickjacking
  res.setHeader("X-Frame-Options", "DENY");

  // Prevent MIME type sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");

  // Enable XSS protection
  res.setHeader("X-XSS-Protection", "1; mode=block");

  // Referrer Policy
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

  // Content Security Policy (basic)
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self'; object-src 'none'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; font-src 'self'"
  );

  // Permissions Policy (formerly Feature Policy)
  res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");

  // Strict Transport Security (only in production)
  if (process.env.NODE_ENV === "production") {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  }

  next();
};

/**
 * Request Logging Middleware
 * Logs all incoming requests with details (excluding sensitive data)
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  // Capture serviceId before req.body can be mutated by route controllers
  const serviceId = req.body?.serviceId || null;

  // Capture response
  const originalSend = res.send;
  res.send = function (data: any) {
    const duration = Date.now() - startTime;
    const durationStr = `${duration}ms`;
    const method = req.method;
    const path = req.originalUrl.replace(/[\r\n]+/g, " ").replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
    const status = res.statusCode;
    const ip = req.ip || "";
    const userAgent = req.get("user-agent") || "";
    const userId = (req as any).user?.userId || null;

    logger.info(`${method} ${path}`, {
      method,
      path,
      status,
      duration: durationStr,
      ip,
      userAgent,
      userId,
      ...(serviceId && { serviceId }),
    });

    // Write request log to database asynchronously
    db.insert(requestLogs)
      .values({
        method,
        path,
        status,
        duration: durationStr,
        ipAddress: ip,
        userAgent,
        userId,
        serviceId,
      })
      .catch((err) => {
        logger.error("Failed to write request log to database", err);
      });

    return originalSend.call(this, data);
  };

  next();
};

/**
 * Input Sanitization Middleware
 * Removes potentially dangerous characters from input
 */
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  // Sanitize body
  if (req.body && typeof req.body === "object") {
    req.body = sanitizeObject(req.body);
  }

  // Sanitize query parameters
  if (req.query && typeof req.query === "object") {
    req.query = sanitizeObject(req.query);
  }

  next();
};

/**
 * Recursively sanitize object by removing potentially harmful patterns
 */
function sanitizeObject(obj: any): any {
  if (obj === null || obj === undefined) return obj;

  try {
    const jsonStr = JSON.stringify(obj, (key, value) => {
      if (key === "__proto__" || key === "constructor" || key === "prototype") {
        return undefined;
      }
      if (typeof value === "string") {
        return xss(value);
      }
      return value;
    });
    return jsonStr ? JSON.parse(jsonStr) : obj;
  } catch (e) {
    return obj;
  }
}

/**
 * Trust Proxy Middleware (for production behind reverse proxy)
 */
export const trustProxy = (req: Request, res: Response, next: NextFunction) => {
  if (process.env.NODE_ENV === "production") {
    // Trust the first proxy (adjust if behind multiple proxies)
    req.app.set("trust proxy", 1);
  }
  next();
};

/**
 * Disable Powered-By Header to avoid leaking Express info
 */
export const disablePoweredBy = (req: Request, res: Response, next: NextFunction) => {
  res.removeHeader("X-Powered-By");
  next();
};
