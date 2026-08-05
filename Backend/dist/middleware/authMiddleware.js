"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.protect = void 0;
const jwt_1 = require("../utils/jwt");
/**
 * Protect middleware: Verifies JWT token in Bearer header
 */
const protect = (req, res, next) => {
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
        const decodedPayload = (0, jwt_1.verifyToken)(token);
        req.user = decodedPayload;
        next();
    }
    catch (error) {
        console.error("JWT Verification Error:", error);
        res.status(401).json({
            error: "Unauthorized",
            message: "Invalid or expired token.",
        });
    }
};
exports.protect = protect;
