"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const meetingRoutes_1 = __importDefault(require("./routes/meetingRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const actionItemRoutes_1 = __importDefault(require("./routes/actionItemRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middleware
app.use((0, cors_1.default)({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    credentials: true,
}));
app.use(express_1.default.json());
// Routes
app.get("/health", (req, res) => {
    res.json({
        status: "ok",
        message: "Server is healthy",
        dbConnected: Boolean(process.env.DATABASE_URL),
    });
});
app.use("/api/auth", authRoutes_1.default);
app.use("/api/meetings", meetingRoutes_1.default);
app.use("/api/action-items", actionItemRoutes_1.default);
app.get("/", (req, res) => {
    res.json({
        message: "Meeting Management API is running!",
        endpoints: {
            health: "/health",
            auth: {
                register: "POST /api/auth/register",
                login: "POST /api/auth/login",
                me: "GET /api/auth/me",
            },
            meetings: "/api/meetings",
            actionItems: "/api/action-items",
        },
    });
});
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
