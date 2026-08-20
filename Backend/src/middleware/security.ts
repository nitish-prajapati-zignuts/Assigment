/**
 * Security Middleware
 * Implements various security headers and protections
 */

import xss from "xss";
import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

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

  // Capture response
  const originalSend = res.send;
  res.send = function (data: any) {
    const duration = Date.now() - startTime;

    logger.info(`${req.method} ${req.path}`, {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get("user-agent"),
      userId: (req as any).user?.userId,
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
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  if (obj !== null && typeof obj === "object") {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (key !== "__proto__" && key !== "constructor" && key !== "prototype") {
        Object.defineProperty(sanitized, key, {
          value: sanitizeObject(value),
          writable: true,
          enumerable: true,
          configurable: true,
        });
      }
    }
    return sanitized;
  }

  if (typeof obj === "string") {
    // Sanitize string using the well-tested xss library
    obj = xss(obj);
  }

  return obj;
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
