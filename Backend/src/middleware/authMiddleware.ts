import { Request, Response, NextFunction } from "express";
import { verifyToken, JwtPayload } from "../utils/jwt";

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

/**
 * Protect middleware: Verifies JWT token in Bearer header
 */
export const protect = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      error: "Unauthorized",
      message: "Access denied. No token provided in Authorization header.",
    });
    return;
  }

  const token = authHeader.split(" ")[1];

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
