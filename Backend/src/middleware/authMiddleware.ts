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
