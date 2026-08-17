import dotenv from "dotenv";

// Load environment variables FIRST before any other imports
dotenv.config();

import { generateDocs } from "./utils/docGenerator";
// Run document generation to ensure Swagger, Postman collection, and Frontend ServiceIds are in sync
generateDocs();

import express, { Request, Response } from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { config, isDevelopment } from "./utils/config";
import { logger } from "./utils/logger";
import { errorHandler, notFoundHandler, asyncHandler } from "./middleware/errorHandler";
import { securityHeaders, requestLogger, sanitizeInput, disablePoweredBy } from "./middleware/security";
import { generalRateLimiter, authRateLimiter, apiRateLimiter } from "./middleware/rateLimiter";
import { csrfTokenGenerator, csrfProtect } from "./middleware/csrf";
import { initializeJobHandlers } from "./services/jobHandlers";
import cookieParser from "cookie-parser";

const swaggerDocument = require("./swagger.json");
import serviceRoutes from "./routes/serviceRoutes";

// Initialize job queue handlers
initializeJobHandlers();

const app = express();
const PORT = config.PORT;

// ============================================
// SECURITY MIDDLEWARE (must be early)
// ============================================
app.use(disablePoweredBy);
app.use(securityHeaders);

// ============================================
// CORS CONFIGURATION
// ============================================
const corsOrigins = config.CORS_ORIGINS.split(",").map((origin) => origin.trim());
app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
    maxAge: 86400,
  })
);

// ============================================
// BODY PARSING & REQUEST MIDDLEWARE
// ============================================
app.use(express.json({ limit: config.MAX_REQUEST_SIZE }));
app.use(express.urlencoded({ limit: config.MAX_REQUEST_SIZE, extended: true }));
app.use(cookieParser()); // Parse cookies for CSRF validation
app.use(sanitizeInput);
app.use(requestLogger);

// ============================================
// REQUEST TIMEOUT
// ============================================
app.use((req: Request, res: Response, next) => {
  req.setTimeout(config.REQUEST_TIMEOUT);
  res.setTimeout(config.REQUEST_TIMEOUT);
  next();
});

// ============================================
// CSRF PROTECTION
// ============================================
app.use(csrfTokenGenerator); // Generate CSRF tokens
app.use(csrfProtect); // Validate CSRF tokens on state-changing requests

// ============================================
// GLOBAL RATE LIMITING
// ============================================
app.use(asyncHandler(generalRateLimiter));

// ============================================
// HEALTH CHECK (no rate limit)
// ============================================
app.get(
  "/health",
  asyncHandler((req: Request, res: Response) => {
    res.json({
      status: "ok",
      message: "Server is healthy",
      environment: config.NODE_ENV,
      timestamp: new Date().toISOString(),
    });
  })
);

// ============================================
// DIAGNOSTICS ENDPOINT (development only)
// ============================================
if (isDevelopment()) {
  app.get(
    "/api/diagnostics",
    asyncHandler((req: Request, res: Response) => {
      const { jobQueue } = require("./services/jobQueue");
      res.json({
        server: {
          environment: config.NODE_ENV,
          port: PORT,
          uptime: Math.floor(process.uptime()),
          memory: process.memoryUsage(),
        },
        jobQueue: jobQueue.getStats(),
      });
    })
  );
}

// ============================================
// ROUTES
// ============================================

// Swagger API documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Centralized Service API route
app.use("/api/service", asyncHandler(apiRateLimiter), serviceRoutes);

// API documentation endpoint
app.get(
  "/",
  asyncHandler((req: Request, res: Response) => {
    res.json({
      message: "Meeting Management API",
      version: "1.0.0",
      environment: config.NODE_ENV,
      endpoints: {
        health: "GET /health",
        diagnostics: isDevelopment() ? "GET /api/diagnostics" : undefined,
        serviceGateway: {
          dispatch: "POST /api/service",
          registry: "GET /api/service/registry"
        }
      },
      documentation: "/api-docs",
    });
  })
);

// ============================================
// ERROR HANDLING (must be last)
// ============================================
app.use(notFoundHandler);
app.use(errorHandler);

// ============================================
// SERVER STARTUP
// ============================================
app.listen(PORT, () => {
  logger.info(`Server started successfully`, {
    port: PORT,
    environment: config.NODE_ENV,
    corsOrigins: corsOrigins,
  });
});
