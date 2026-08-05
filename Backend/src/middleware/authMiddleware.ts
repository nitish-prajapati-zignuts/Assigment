import { Request, Response, NextFunction } from "express";
import { verifyToken, JwtPayload } from "../utils/jwt";

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
 * 
 * @param req - Authenticated Express request object.
 * @param res - Express response object.
 * @param next - Express next middleware callback function.
 * @returns void
 */
export const protect = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  let token: string | undefined;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (req.headers.cookie) {
    const cookies = req.headers.cookie.split(";").reduce((acc, current) => {
      const [key, value] = current.trim().split("=");
      if (key && value) acc[key] = value;
      return acc;
    }, {} as Record<string, string>);
    token = cookies["token"];
  }

  if (!token) {
    res.status(401).json({
      error: "Unauthorized",
      message: "Access denied. No authentication token provided.",
    });
    return;
  }

  try {
    const decodedPayload = verifyToken(token);
    req.user = decodedPayload;
    next();
  } catch (error) {
    console.error("JWT Verification Error:", error);
    res.status(401).json({
      error: "Unauthorized",
      message: "Invalid or expired token.",
    });
  }
};
