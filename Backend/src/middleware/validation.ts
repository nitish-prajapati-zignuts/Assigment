/**
 * Validation Middleware
 * Validates request body, query params, and URL params using Zod schemas
 */

import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { ValidationError } from "../utils/errors";
import { logger } from "../utils/logger";

/**
 * Generic validation middleware factory
 */
export const validate = (schema: ZodSchema, source: "body" | "query" | "params" = "body") => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const dataToValidate = source === "body" ? req.body : source === "query" ? req.query : req.params;
      const validatedData = schema.parse(dataToValidate);

      // Replace original data with validated data
      if (source === "body") {
        req.body = validatedData;
      } else if (source === "query") {
        req.query = validatedData as any;
      } else {
        req.params = validatedData as any;
      }

      next();
    } catch (error: any) {
      logger.warn(`Validation failed for ${source}`, { path: req.path, errors: error.errors });

      const details: Record<string, string> = {};
      if (error.errors && Array.isArray(error.errors)) {
        error.errors.forEach((err: any) => {
          const path = err.path.join(".") || "root";
          details[path] = err.message;
        });
      }

      const firstErrorMessage = Object.values(details)[0];
      const errorMessage = firstErrorMessage || "Request validation failed";

      next(new ValidationError(errorMessage, details));
    }
  };
};

/**
 * Specific validators for common use cases
 */
export const validateBody = (schema: ZodSchema) => validate(schema, "body");
export const validateQuery = (schema: ZodSchema) => validate(schema, "query");
export const validateParams = (schema: ZodSchema) => validate(schema, "params");
