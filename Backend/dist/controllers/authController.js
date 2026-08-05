"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const jwt_1 = require("../utils/jwt");
/**
 * Register a new user
 * POST /api/auth/register
 */
const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            res.status(400).json({ error: "Name, email, and password are required." });
            return;
        }
        if (password.length < 6) {
            res.status(400).json({ error: "Password must be at least 6 characters long." });
            return;
        }
        const cleanEmail = email.toLowerCase().trim();
        // Check if user already exists
        const existingUser = await db_1.db
            .select()
            .from(schema_1.users)
            .where((0, drizzle_orm_1.eq)(schema_1.users.email, cleanEmail));
        if (existingUser.length > 0) {
            res.status(400).json({ error: "User with this email already exists." });
            return;
        }
        // Hash password
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(password, salt);
        const newUserId = Date.now().toString();
        const inserted = await db_1.db
            .insert(schema_1.users)
            .values({
            id: newUserId,
            name,
            email: cleanEmail,
            password: hashedPassword,
        })
            .returning();
        const createdUser = inserted[0];
        const token = (0, jwt_1.generateToken)({
            userId: createdUser.id,
            email: createdUser.email,
            name: createdUser.name,
        });
        res.status(201).json({
            message: "User registered successfully",
            token,
            user: {
                id: createdUser.id,
                name: createdUser.name,
                email: createdUser.email,
                createdAt: createdUser.createdAt,
            },
        });
    }
    catch (error) {
        console.error("Register Error:", error);
        res.status(500).json({ error: "Internal server error during registration." });
    }
};
exports.register = register;
/**
 * Authenticate user & get token
 * POST /api/auth/login
 */
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ error: "Email and password are required." });
            return;
        }
        const cleanEmail = email.toLowerCase().trim();
        const result = await db_1.db
            .select()
            .from(schema_1.users)
            .where((0, drizzle_orm_1.eq)(schema_1.users.email, cleanEmail));
        if (result.length === 0) {
            res.status(401).json({ error: "Invalid email or password." });
            return;
        }
        const user = result[0];
        // Compare passwords
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            res.status(401).json({ error: "Invalid email or password." });
            return;
        }
        const token = (0, jwt_1.generateToken)({
            userId: user.id,
            email: user.email,
            name: user.name,
        });
        res.json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt,
            },
        });
    }
    catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ error: "Internal server error during login." });
    }
};
exports.login = login;
/**
 * Get current authenticated user details
 * GET /api/auth/me
 */
const getMe = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: "Not authenticated" });
            return;
        }
        res.json({
            user: req.user,
        });
    }
    catch (error) {
        console.error("GetMe Error:", error);
        res.status(500).json({ error: "Failed to fetch user profile." });
    }
};
exports.getMe = getMe;
