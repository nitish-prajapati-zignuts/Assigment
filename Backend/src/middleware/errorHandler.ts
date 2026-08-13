import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";
import { isAppError, AppError, ErrorResponse } from "../utils/errors";

/**
 * Express error handler middleware
 * Must be registered as the last middleware in the app
 */
export const errorHandler = (error: Error | AppError, req: Request, res: Response, next: NextFunction): void => {
  const isDevelopment = process.env.NODE_ENV !== "production";

  // Extract error details
  const appError = isAppError(error)
    ? error
    : new AppError(error.message || "Internal server error", 500, "INTERNAL_ERROR");

  const { statusCode, code, message, details } = appError;

  // Log the error
  const logContext = {
    method: req.method,
    path: req.path,
    statusCode,
    errorCode: code,
    userId: (req as any).user?.userId,
    ip: req.ip,
    userAgent: req.get("user-agent"),
    requestBody: isDevelopment ? sanitizeBody(req.body) : undefined,
    queryParams: isDevelopment ? req.query : undefined,
  };

  if (statusCode >= 500) {
    logger.error(message, error, logContext);
  } else if (statusCode >= 400) {
    logger.warn(message, logContext);
  } else {
    logger.info(message, logContext);
  }
  console.log("Response", message);
  // Format error response
  const response: ErrorResponse = {
    error: code,
    message,
    code,
    statusCode,
    ...(details && Object.keys(details).length > 0 && { details }),
  };

  console.log(response);

  res.status(statusCode).json(response);
};

/**
 * Middleware to catch async errors in route handlers
 * Wraps async controllers to catch promise rejections
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * 404 Not Found middleware
 * Handles requests that don't match any route
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const error = new AppError(`Route not found: ${req.method} ${req.path}`, 404, "ROUTE_NOT_FOUND");
  next(error);
};

/**
 * Sanitize sensitive data from logs
 */
function sanitizeBody(body: any): any {
  if (!body || typeof body !== "object") return body;

  const sanitized = { ...body };
  const sensitiveFields = ["password", "token", "secret", "apiKey", "authorization"];

  sensitiveFields.forEach((field) => {
    if (field in sanitized) {
      sanitized[field] = "***REDACTED***";
    }
  });

  return sanitized;
}
