import { Request, Response, NextFunction } from "express";
import { verifyToken, JwtPayload, decryptCookieValue } from "../utils/jwt";
import { AuthenticationError } from "../utils/errors";
import { logger } from "../utils/logger";

/**
 * Express Request interface extended with user JWT payload parameters (`userId`, `email`, `name`).
 */
export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

/**
 * Authentication Middleware (`protect`).
 * Intercepts incoming HTTP requests and verifies JWT authentication tokens extracted
 * from `Authorization: Bearer <token>` headers or `token` HTTP-only cookies.
 * Attaches decoded JWT user payload to `req.user` or returns 401 Unauthorized error.
 */
export const protect = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  let token: string | undefined;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (req.cookies) {
    const rawToken = req.cookies.token;
    token = rawToken ? decryptCookieValue(rawToken) : undefined;
  }

  if (!token) {
    logger.warn("Authentication failed: no token provided", {
      path: req.path,
      ip: req.ip,
    });
    throw new AuthenticationError("Access denied. No authentication token provided.");
  }

  try {
    const decodedPayload = verifyToken(token);
    req.user = decodedPayload;
    next();
  } catch (error) {
    logger.warn("JWT verification failed", {
      path: req.path,
      ip: req.ip,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    throw new AuthenticationError("Invalid or expired token.");
  }
};
