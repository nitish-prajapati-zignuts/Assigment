import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import meetingRoutes from "./routes/meetingRoutes";
import authRoutes from "./routes/authRoutes";
import actionItemRoutes from "./routes/actionItemRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    credentials: true,
  })
);
app.use(express.json());

// Routes
app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    message: "Server is healthy",
    dbConnected: Boolean(process.env.DATABASE_URL),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/meetings", meetingRoutes);
app.use("/api/action-items", actionItemRoutes);

app.get("/", (req: Request, res: Response) => {
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
