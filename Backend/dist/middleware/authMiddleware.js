"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.protect = void 0;
const jwt_1 = require("../utils/jwt");
/**
 * Protect middleware: Verifies JWT token in Bearer header
 */
const protect = (req, res, next) => {
    let token;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
    }
    else if (req.headers.cookie) {
        const cookies = req.headers.cookie.split(";").reduce((acc, current) => {
            const [key, value] = current.trim().split("=");
            if (key && value)
                acc[key] = value;
            return acc;
        }, {});
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
