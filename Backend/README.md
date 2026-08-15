# Backend Architecture — AI-Powered Meeting Transcript System

> **Version:** 1.0.0 &nbsp;|&nbsp; **Runtime:** Node.js + TypeScript &nbsp;|&nbsp; **Framework:** Express.js  
> **Database:** Neon Serverless PostgreSQL &nbsp;|&nbsp; **ORM:** Drizzle ORM &nbsp;|&nbsp; **AI Provider:** Google Gemini (Vercel AI SDK)

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [High-Level Architecture](#2-high-level-architecture)
3. [Directory Structure](#3-directory-structure)
4. [Layered Architecture & Request Lifecycle](#4-layered-architecture--request-lifecycle)
5. [Database Schema & Entity-Relationship Model](#5-database-schema--entity-relationship-model)
6. [AI Summarization Pipeline](#6-ai-summarization-pipeline)
7. [RAG (Retrieval-Augmented Generation) System](#7-rag-retrieval-augmented-generation-system)
8. [Background Job Queue](#8-background-job-queue)
9. [Security Architecture](#9-security-architecture)
10. [Middleware Chain](#10-middleware-chain)
11. [API Reference](#11-api-reference)
12. [Caching Strategy](#12-caching-strategy)
13. [Environment Configuration](#13-environment-configuration)
14. [Error Handling & Logging](#14-error-handling--logging)
15. [Database Migrations](#15-database-migrations)
16. [Getting Started](#16-getting-started)
17. [Production Considerations](#17-production-considerations)

---

## 1. System Overview

This backend powers an **AI-based Meeting Transcript & Action Item Tracking Platform**. It provides:

- **JWT-authenticated REST API** for meeting CRUD, action items, user management, and dashboard analytics.
- **AI-powered meeting summarization** using Google Gemini models via the Vercel AI SDK, with structured output (Zod schema enforcement) producing rich summaries containing discussion points, key decisions, action items, speaker analytics, and sentiment analysis.
- **RAG (Retrieval-Augmented Generation) Chat** allowing users to ask natural-language questions about meeting content, backed by pgvector cosine similarity search.
- **Asynchronous job processing** for long-running AI operations (summarization, embedding generation) via an in-memory queue with retry & exponential backoff.
- **Multi-template summary support** — Standard, Executive, Developer, Technical, and Sales templates each extract domain-specific intelligence.
- **Public meeting sharing** with AES-256-GCM encrypted share tokens and optional password-protected access.

---

## 2. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT (Frontend)                             │
│                        React / Next.js Application                         │
└──────────────────────────────┬──────────────────────────────────────────────┘
                               │  HTTPS / REST
                               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         EXPRESS.JS APPLICATION                              │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                     MIDDLEWARE PIPELINE                               │   │
│  │                                                                      │   │
│  │  Security Headers → CORS → Body Parser → Cookie Parser →            │   │
│  │  Input Sanitization → Request Logger → Request Timeout →             │   │
│  │  CSRF Protection → Rate Limiting (General)                           │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                               │                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                        ROUTE LAYER                                   │   │
│  │                                                                      │   │
│  │  /api/auth      → Auth Rate Limiter → Auth Controller               │   │
│  │  /api/meetings   → API Rate Limiter → Auth Middleware → Controller  │   │
│  │  /api/action-items → API Rate Limiter → Auth Middleware → Controller│   │
│  │  /api/jobs       → API Rate Limiter → Auth Middleware → Controller  │   │
│  │  /api/settings   → API Rate Limiter → Auth Middleware → Controller  │   │
│  │  /api/dashboard  → API Rate Limiter → Auth Middleware → Controller  │   │
│  │  /api/notifications → API Rate Limiter → Auth Middleware → Controller│  │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                               │                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                     SERVICE LAYER                                    │   │
│  │                                                                      │   │
│  │  AI Service (Gemini Summarization + Embedding Generation)            │   │
│  │  RAG Service (Semantic Chunking + TF-IDF Retrieval + LLM Answer)    │   │
│  │  Job Queue (Async Task Processing with Retry Logic)                  │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                               │                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                     DATA ACCESS LAYER                                │   │
│  │                                                                      │   │
│  │  Drizzle ORM → Neon Serverless PostgreSQL (+ pgvector extension)    │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                     CROSS-CUTTING CONCERNS                           │   │
│  │                                                                      │   │
│  │  In-Memory Cache │ Structured Logger │ Error Handler │ Zod Schemas  │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                     EXTERNAL SERVICES                                       │
│                                                                             │
│  ┌─────────────────────┐  ┌──────────────────────┐  ┌──────────────────┐  │
│  │  Neon PostgreSQL     │  │  Google Gemini API    │  │  Gemini Embedding│  │
│  │  (Data + pgvector)   │  │  (gemini-3.5-flash)   │  │  (embedding-001) │  │
│  └─────────────────────┘  └──────────────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Directory Structure

```
Backend/
├── drizzle/                          # Database migration files (SQL)
│   ├── 0000_special_vanisher.sql     # Initial schema: users, meetings, action_items
│   ├── 0001_clever_tarantula.sql     # pgvector, sessions, settings, notifications, share
│   └── meta/                         # Drizzle migration metadata (journal, snapshots)
│
├── src/
│   ├── index.ts                      # Application entry point & middleware assembly
│   ├── swagger.json                  # OpenAPI 3.0 specification for Swagger UI
│   │
│   ├── controllers/                  # Request handlers (business logic orchestration)
│   │   ├── authController.ts         # Register, login, logout, change password, get users
│   │   ├── meetingController.ts      # Full meeting CRUD, summarize, chat, archive, share, clone
│   │   ├── actionItemController.ts   # Action item CRUD, leaderboard aggregation
│   │   ├── dashboardController.ts    # Dashboard stats aggregation
│   │   ├── settingsController.ts     # User settings & session management
│   │   └── notificationController.ts # Notification retrieval, mark-read, clear
│   │
│   ├── routes/                       # Express route definitions (URL → Controller mapping)
│   │   ├── authRoutes.ts             # /api/auth/*
│   │   ├── meetingRoutes.ts          # /api/meetings/*
│   │   ├── actionItemRoutes.ts       # /api/action-items/*
│   │   ├── jobRoutes.ts              # /api/jobs/*
│   │   ├── settingsRoutes.ts         # /api/settings/*
│   │   ├── dashboardRoutes.ts        # /api/dashboard/*
│   │   └── notificationRoutes.ts     # /api/notifications/*
│   │
│   ├── services/                     # Core business services
│   │   ├── aiService.ts              # AI summarization, embedding generation, RAG Q&A
│   │   ├── ragService.ts             # Semantic chunking, TF-IDF retrieval, RAG answer engine
│   │   ├── jobQueue.ts               # In-memory async job queue with retry/backoff
│   │   └── jobHandlers.ts            # Registered job handlers (summarize_meeting)
│   │
│   ├── middleware/                    # Express middleware functions
│   │   ├── authMiddleware.ts         # JWT Bearer token & cookie extraction
│   │   ├── rateLimiter.ts            # Tiered rate limiting (general, auth, AI, API)
│   │   ├── security.ts               # Security headers, request logging, input sanitization
│   │   ├── csrf.ts                   # CSRF token generation & validation
│   │   ├── errorHandler.ts           # Global error handler, async wrapper, 404 handler
│   │   ├── fileUpload.ts             # File validation, MIME/extension checks, malware scan
│   │   └── validation.ts             # Generic Zod schema validation middleware factory
│   │
│   ├── db/                           # Database layer
│   │   ├── schema.ts                 # Drizzle table definitions, TypeScript interfaces, types
│   │   └── index.ts                  # Neon serverless connection with retry logic
│   │
│   └── utils/                        # Shared utilities
│       ├── config.ts                 # Zod-validated environment configuration
│       ├── errors.ts                 # Typed error class hierarchy (AppError → domain errors)
│       ├── logger.ts                 # Structured JSON logger (debug/info/warn/error)
│       ├── jwt.ts                    # JWT sign/verify functions
│       ├── validation.ts             # Centralized Zod schemas for all API inputs
│       ├── aiPrompts.ts              # AI prompt builders (summarization & RAG)
│       ├── cache.ts                  # In-memory TTL cache with middleware & invalidation
│       ├── queryOptimization.ts      # Pagination, sorting, batch query helpers
│       ├── shareUtils.ts             # AES-256-GCM share token encryption/decryption
│       └── appendLog.ts             # Debug log file appender for RAG diagnostics
│
├── drizzle.config.ts                 # Drizzle Kit configuration (schema path, dialect)
├── tsconfig.json                     # TypeScript compiler configuration (ES2022, strict)
├── package.json                      # Dependencies, scripts, project metadata
├── .env.example                      # Environment variable template
├── .prettierrc                       # Code formatting configuration
└── .gitignore                        # Git ignore rules
```

---

## 4. Layered Architecture & Request Lifecycle

The backend follows a strict **layered architecture** pattern with clear separation of concerns:

### Layer Responsibilities

| Layer           | Directory          | Responsibility                                                                                  |
| --------------- | ------------------ | ----------------------------------------------------------------------------------------------- |
| **Middleware**  | `src/middleware/`  | Cross-cutting concerns: auth, rate limiting, CSRF, validation, security headers, error handling |
| **Routes**      | `src/routes/`      | URL-to-controller mapping, middleware composition per route group                               |
| **Controllers** | `src/controllers/` | Request parsing, business logic orchestration, response formatting                              |
| **Services**    | `src/services/`    | Core business logic: AI inference, RAG pipeline, job queue management                           |
| **Data Access** | `src/db/`          | Database schema, connection management, Drizzle ORM queries                                     |
| **Utilities**   | `src/utils/`       | Shared functions: config, errors, logging, JWT, caching, validation schemas                     |

### Request Lifecycle (Typical Authenticated Request)

```
1. HTTP Request arrives
       │
2. ┌───▼────────────────────┐
   │ disablePoweredBy        │  Remove X-Powered-By header
   │ securityHeaders         │  Set X-Frame-Options, CSP, HSTS, etc.
   └───┬────────────────────┘
3. ┌───▼────────────────────┐
   │ CORS                   │  Validate origin against CORS_ORIGINS whitelist
   └───┬────────────────────┘
4. ┌───▼────────────────────┐
   │ Body Parsers           │  JSON + URL-encoded parsing (limit: MAX_REQUEST_SIZE)
   │ Cookie Parser          │  Parse cookies for CSRF & JWT token extraction
   └───┬────────────────────┘
5. ┌───▼────────────────────┐
   │ sanitizeInput          │  Strip NoSQL injection patterns & script tags from body/query
   │ requestLogger          │  Log request method, path, duration, IP, user agent
   └───┬────────────────────┘
6. ┌───▼────────────────────┐
   │ Request Timeout        │  Set configurable request/response timeout
   └───┬────────────────────┘
7. ┌───▼────────────────────┐
   │ CSRF Protection        │  Generate token → validate on POST/PUT/DELETE/PATCH
   └───┬────────────────────┘
8. ┌───▼────────────────────┐
   │ General Rate Limiter   │  In-memory sliding window (RATE_LIMIT_MAX_REQUESTS / window)
   └───┬────────────────────┘
9. ┌───▼────────────────────┐
   │ Route-Level Middleware  │  Route-specific rate limiter (auth/api/ai)
   │                        │  → Zod validation (body/query/params)
   │                        │  → JWT Authentication (protect middleware)
   └───┬────────────────────┘
10.┌───▼────────────────────┐
   │ Controller             │  Business logic execution
   │                        │  → Service calls (AI, DB, Cache)
   │                        │  → Response formatting
   └───┬────────────────────┘
11.┌───▼────────────────────┐
   │ Error Handler          │  Catch-all: log structured error, return JSON error response
   └────────────────────────┘
```

---

## 5. Database Schema & Entity-Relationship Model

The system uses **Neon Serverless PostgreSQL** with the **pgvector** extension for vector similarity search.

### Entity-Relationship Diagram

```
┌────────────────────┐       1:N        ┌────────────────────────────┐
│       users         │◄────────────────│      user_sessions          │
│────────────────────│                  │────────────────────────────│
│ id (PK)            │                  │ id (PK)                    │
│ name               │                  │ user_id (FK → users.id)    │
│ email (UNIQUE)     │                  │ ip_address                 │
│ password (bcrypt)  │                  │ device, browser, os        │
│ created_at         │                  │ location                   │
│ updated_at         │                  │ is_current                 │
│ is_deleted         │                  │ last_active                │
└────────┬───────────┘                  └────────────────────────────┘
         │
         │ 1:1                    1:N
         ├──────────────┐  ┌──────┤
         ▼              ▼  ▼      │
┌─────────────────┐  ┌────────────────────────────────┐
│  user_settings   │  │          meetings               │
│─────────────────│  │────────────────────────────────│
│ user_id (PK,FK) │  │ id (PK)                        │
│ summary_length   │  │ title                          │
│ template         │  │ date                           │
│ custom_prompt    │  │ type                           │
│ auto_extract_    │  │ participants (JSONB: string[]) │
│  action_items    │  │ transcript (TEXT)               │
│ email_notifs     │  │ summary (JSONB: MeetingSummary)│
│ weekly_digest    │  │ is_meeting_published           │
│ slack_webhook    │  │ share_password (bcrypt hash)   │
│ updated_at       │  │ share_expires_at               │
└─────────────────┘  │ is_deleted, is_archived        │
                     │ is_pinned                      │
         1:N         │ created_at, updated_at         │
    ┌────────────────┤                                │
    │                └──────────┬─────────────────────┘
    │                           │ 1:N
    ▼                           ▼
┌───────────────────────┐  ┌───────────────────────────┐
│   notifications        │  │     action_items           │
│───────────────────────│  │───────────────────────────│
│ id (PK, auto-inc)     │  │ id (PK)                   │
│ user_id (FK)          │  │ meeting_id (FK → meetings) │
│ title                 │  │ user_id (FK → users, NULL) │
│ message               │  │ task                       │
│ type                  │  │ owner                      │
│ is_read               │  │ due_date                   │
│ created_at            │  │ priority                   │
└───────────────────────┘  │ status                     │
                           │ is_archived                │
                           │ created_at, updated_at     │
                           └───────────────────────────┘

                     meetings 1:N
                           │
                           ▼
                  ┌─────────────────────────┐
                  │    meeting_chunks         │
                  │─────────────────────────│
                  │ id (PK)                 │
                  │ meeting_id (FK)         │
                  │ content (TEXT)           │
                  │ embedding (VECTOR 1536) │  ← pgvector
                  │ created_at              │
                  └─────────────────────────┘
```

### Table Details

| Table            | Records            | Purpose                                           | Key Indexes                                                                         |
| ---------------- | ------------------ | ------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `users`          | User accounts      | Authentication & identity                         | `email` (unique), `created_at`                                                      |
| `meetings`       | Meeting records    | Core meeting data + AI summaries (JSONB)          | `date`, `type`, `created_at`, `participants`                                        |
| `action_items`   | Extracted tasks    | AI-extracted or manually created action items     | `meeting_id+status` (composite), `owner+status` (composite), `priority`, `due_date` |
| `user_settings`  | Per-user config    | AI summary preferences (length, template, prompt) | `user_id` (PK/FK)                                                                   |
| `user_sessions`  | Login sessions     | Session tracking with IP, device, browser, OS     | `user_id`                                                                           |
| `notifications`  | User notifications | In-app notification system                        | `user_id`, `created_at`                                                             |
| `meeting_chunks` | Vector embeddings  | pgvector-indexed chunks for RAG similarity search | `meeting_id`                                                                        |

### The `MeetingSummary` JSONB Structure

The `meetings.summary` column stores a rich, structured JSONB object:

```typescript
interface MeetingSummary {
  purpose: string; // Meeting purpose statement
  discussionPoints: string[]; // Key topics discussed
  majorOutcomes: string[]; // Decisions & conclusions
  importantConcerns: string[]; // Risks & unresolved issues
  unansweredQuestions?: string[]; // Open questions
  nextSteps: string[]; // Follow-up actions
  keyDecisions?: KeyDecision[]; // Categorized decisions
  actionItems?: ActionItem[]; // Extracted tasks with owner/priority/status
  speakerAnalytics?: SpeakerAnalytics[]; // Per-speaker talk-time & word count
  sentimentAnalysis?: SentimentAnalysis; // Tone analysis with breakdown percentages
  templateStyle?: SummaryTemplate; // "Standard" | "Executive" | "Developer" | "Technical" | "Sales"
  executiveDetails?: ExecutiveSummaryDetails; // C-suite focused intelligence
  developerDetails?: DeveloperTaskDetails; // Engineering deliverables
  technicalDetails?: TechnicalDecisionDetails; // Architecture choices
  salesDetails?: SalesQualificationDetails; // Lead qualification data
}
```

---

## 6. AI Summarization Pipeline

The summarization system uses **Google Gemini** models through the **Vercel AI SDK** with **Zod schema enforcement** for guaranteed structured output.

### Execution Flow

```
                          ┌──────────────────────────────┐
                          │  Meeting Transcript (raw)     │
                          └──────────┬───────────────────┘
                                     │
                          ┌──────────▼───────────────────┐
                          │  stripHtml() Sanitization     │
                          │  Remove HTML tags, decode     │
                          │  entities, normalize spaces   │
                          └──────────┬───────────────────┘
                                     │
                          ┌──────────▼───────────────────┐
                          │  buildMeetingSummaryPrompt()  │
                          │  Inject: language, length,    │
                          │  template, customPrompt       │
                          └──────────┬───────────────────┘
                                     │
           ┌─────────────────────────┼─────────────────────────┐
           ▼                         ▼                         ▼
  ┌─────────────────┐    ┌──────────────────────┐   ┌──────────────────┐
  │ Step 1:          │    │ Step 2:               │   │ Step 3:           │
  │ Primary Key      │    │ Rotation Pool (RPI)   │   │ Fallback Key      │
  │ GOOGLE_AI_KEY    │──►│ GEMINI_API_KEYS       │──►│ GEMINI_FALL_BACK  │
  │                  │    │ (comma-separated,     │   │ _KEY              │
  │ gemini-3.5-flash │    │  de-duplicated)       │   │                   │
  └────────┬─────────┘    │ Iterates each key     │   │ gemini-3.5-flash  │
           │              └────────┬──────────────┘   └────────┬──────────┘
           │                       │                           │
           ├───────── on failure ──┤──────── on failure ───────┤
           │                       │                           │
           ▼                       ▼                           ▼
  ┌────────────────────────────────────────────────────────────────────────┐
  │ Step 4: Heuristic Fallback Generator (generateFallbackSummary)        │
  │ - Line-based text extraction                                          │
  │ - Keyword-matched decision extraction (agreed/decided/approved)       │
  │ - Simple speaker analytics via regex (speaker:content)                │
  │ - Keyword-frequency sentiment analysis                                │
  └───────────────────────────────┬────────────────────────────────────────┘
                                  │
                       ┌──────────▼───────────────────┐
                       │  cleanSummary() Post-Process  │
                       │  Strip residual HTML from all │
                       │  fields, apply sensible       │
                       │  defaults for empty values    │
                       └──────────┬───────────────────┘
                                  │
                       ┌──────────▼───────────────────┐
                       │  Return MeetingSummary object │
                       └──────────────────────────────┘
```

### Key Design Decisions

| Decision                                   | Rationale                                                                                                                                  |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **Zod Schema-enforced `generateObject()`** | Guarantees type-safe, structured JSON output from LLM — eliminates fragile regex parsing                                                   |
| **4-tier key fallback cascade**            | Maximizes uptime: Primary → RPI Rotation → Fallback Key → Heuristic                                                                        |
| **Rotation Policy Implementation (RPI)**   | `GEMINI_API_KEYS` supports multiple comma-separated keys with automatic de-duplication and sequential failover                             |
| **Heuristic fallback**                     | Ensures users always receive a summary, even without API keys configured                                                                   |
| **Post-processing via `cleanSummary()`**   | LLMs occasionally emit HTML fragments; this ensures all output is sanitized plain text                                                     |
| **Multi-template support**                 | Template-specific prompt injection activates domain-focused extraction (Executive → strategic impact; Developer → code deliverables, etc.) |

### Summary Templates

| Template  | Target Audience     | Additional Fields Populated                                                                                     |
| --------- | ------------------- | --------------------------------------------------------------------------------------------------------------- |
| Standard  | All team members    | Base fields only                                                                                                |
| Executive | C-suite leadership  | `executiveDetails.strategicImpact`, `financialOrTimelineRisks`, `executiveRecommendations`                      |
| Developer | Engineering teams   | `developerDetails.codeDeliverables`, `architecturalChanges`, `apiContractsAndDependencies`, `technicalBlockers` |
| Technical | Solution architects | `technicalDetails.systemArchitectureChoices`, `techStackTradeoffs`, `engineeringConstraints`                    |
| Sales     | Sales/BD teams      | `salesDetails.clientPainPoints`, `budgetAndAuthority`, `timelineExpectations`, `nextSalesSteps`                 |

---

## 7. RAG (Retrieval-Augmented Generation) System

The system implements **two complementary RAG pipelines** for meeting Q&A:

### Pipeline A: pgvector-based Semantic RAG (`aiService.ts`)

```
User Question
      │
      ▼
┌─────────────────────────┐
│ Generate question        │
│ embedding via            │
│ gemini-embedding-001     │
│ (1536 dimensions)        │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│ Cosine similarity search │
│ against meeting_chunks   │
│ table using pgvector     │
│ <=> operator             │
│                          │
│ WHERE meeting_id = ?     │
│ ORDER BY distance ASC    │
│ LIMIT 5                  │
│ FILTER similarity >= 0.75│
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│ Build RAG prompt with    │
│ retrieved chunks +       │
│ chat history +           │
│ user question            │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│ generateObject() via     │
│ Gemini (4-tier fallback) │
│ → Structured answer      │
└─────────────────────────┘
```

#### Embedding Generation Process

When a meeting is summarized, `processAndSaveTranscriptEmbeddings()` is invoked:

1. **Paragraph splitting** — Split transcript by double-newlines; filter chunks < 20 chars.
2. **Batch embedding** — Use `embedMany()` with `gemini-embedding-001` model at 1536 dimensions.
3. **Deduplication** — Delete existing chunks for the meeting before inserting new ones.
4. **Storage** — Insert chunks with their vector embeddings into `meeting_chunks` table.

### Pipeline B: TF-IDF Chunking RAG (`ragService.ts`)

This pipeline serves as a **secondary RAG engine** that doesn't require vector embeddings:

```
Meeting Object
      │
      ▼
┌──────────────────────────────┐
│  chunkMeetingContent()        │
│                               │
│  Creates typed ContentChunks: │
│  - summary.purpose            │
│  - summary.discussionPoints   │
│  - summary.majorOutcomes      │
│  - summary.actionItems        │
│  - summary.keyDecisions       │
│  - transcript (250-word       │
│    windows, 40-word overlap)  │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│  retrieveRelevantChunks()     │
│                               │
│  TF-IDF term overlap scoring: │
│  - Tokenize query (>2 chars)  │
│  - Score each chunk by term   │
│    match count                │
│  - Title match: +0.5 boost    │
│  - Structured chunk: +0.3     │
│  - Sort desc, return top K    │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│  generateRAGAnswer()          │
│                               │
│  Assemble prompt with:        │
│  - [Source #N: Title] context  │
│  - Conversation history        │
│  - Critical RAG instructions   │
│  → Send to Gemini LLM         │
└──────────────────────────────┘
```

### Fallback Hierarchy

| Priority | Source                       | Mechanism                                                |
| -------- | ---------------------------- | -------------------------------------------------------- |
| 1        | pgvector similarity search   | Cosine distance on 1536-dim embeddings, threshold ≥ 0.75 |
| 2        | Text heuristic keyword match | Line-by-line keyword intersection from transcript        |
| 3        | Full transcript head         | First 30 lines of transcript as context                  |
| 4        | Heuristic string answer      | No LLM — direct chunk content concatenation              |

---

## 8. Background Job Queue

### Architecture

The system uses a **singleton in-memory job queue** (`JobQueue` class) for asynchronous task processing.

```
┌──────────────────────┐     addJob()      ┌─────────────────────────────────┐
│  Controller           │──────────────────►│         JobQueue                 │
│  (summarizeMeeting)   │                   │                                 │
└──────────────────────┘                   │  ┌─────────────────────────┐    │
                                           │  │  In-Memory Store (Map)   │    │
         ┌─────────────────────────────────│  │  Job ID → Job State      │    │
         │  GET /api/jobs/:id (polling)    │  └─────────────────────────┘    │
         │                                 │                                 │
         │                                 │  processQueue() loop:           │
         │                                 │  - Max 3 concurrent jobs        │
         │                                 │  - Exponential backoff retries  │
         │                                 │  - Auto-cleanup after 24h       │
         ▼                                 │                                 │
┌──────────────────────┐                   │  Registered Handlers:           │
│  Client Polls Status  │                   │  - "summarize_meeting"          │
│  pending → processing │                   │    → generateMeetingSummary()   │
│  → completed          │                   │    → processAndSaveEmbeddings() │
└──────────────────────┘                   │    → syncActionItemsToDb()      │
                                           └─────────────────────────────────┘
```

### Job Configuration

| Property         | Value       | Description                               |
| ---------------- | ----------- | ----------------------------------------- |
| Max concurrent   | 3           | Maximum jobs processing simultaneously    |
| Max attempts     | 3           | Retry count before marking as failed      |
| Backoff strategy | Exponential | 1s → 2s → 4s between retries              |
| Auto-cleanup     | 24 hours    | Completed/failed jobs removed from memory |
| Cleanup interval | 1 hour      | Periodic garbage collection               |

### Job State Machine

```
pending ──── processJob() ────► processing
   ▲                               │
   │                          ┌────┼────┐
   │                          │    │    │
   │                    success│  fail  │fail (exhausted)
   │                          │    │    │
   │                          ▼    │    ▼
   └──── retry (backoff) ◄────    │   failed
                                  │
                            completed
```

---

## 9. Security Architecture

### Security Stack

| Layer                      | Implementation                        | Details                                                                                             |
| -------------------------- | ------------------------------------- | --------------------------------------------------------------------------------------------------- |
| **Transport**              | HSTS (production)                     | `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`                           |
| **Authentication**         | JWT (Bearer token / HTTP-only cookie) | HS256 signed, configurable expiry (default: 7 days)                                                 |
| **Authorization**          | Participant-based access control      | Users can only access meetings where their email is in `participants[]`                             |
| **CSRF Protection**        | Double-submit cookie pattern          | Random 32-byte hex token stored in cookie, validated via `X-CSRF-Token` header                      |
| **Password Hashing**       | bcryptjs                              | Salt rounds: 10 (auto-generated salt)                                                               |
| **Input Validation**       | Zod schemas on all endpoints          | Body, query, and params validated before controller execution                                       |
| **Input Sanitization**     | Recursive object sanitizer            | Strips `$` (NoSQL injection) and `<script>` tags from all inputs                                    |
| **Rate Limiting**          | In-memory sliding window              | 4 tiers: General, Auth, AI, API — each with independent windows and limits                          |
| **CORS**                   | Whitelist-based                       | `CORS_ORIGINS` env var (comma-separated), credential support enabled                                |
| **Security Headers**       | Helmet-equivalent custom middleware   | X-Frame-Options, X-Content-Type-Options, X-XSS-Protection, CSP, Referrer-Policy, Permissions-Policy |
| **Share Token Encryption** | AES-256-GCM                           | 12-byte IV + 16-byte auth tag, URL-safe Base64 encoding                                             |
| **File Upload**            | MIME + extension + content validation | Whitelist: .txt, .csv, .pdf, .docx, .doc, .odt; malicious pattern scanning                          |
| **Information Hiding**     | `X-Powered-By` removal                | Prevents Express framework fingerprinting                                                           |

### Rate Limiting Tiers

| Tier    | Window | Max Requests | Applied To          | Env Override              |
| ------- | ------ | ------------ | ------------------- | ------------------------- |
| General | 15 min | 100          | All requests        | `RATE_LIMIT_MAX_REQUESTS` |
| Auth    | 15 min | 100          | `/api/auth/*`       | `AUTH_RATE_LIMITER`       |
| AI      | 1 hour | 100          | AI endpoints        | `AI_RATE_LIMITER`         |
| API     | 5 min  | 1000         | All `/api/*` routes | `API_RATE_LIMITER`        |

### JWT Token Flow

```
┌──────────┐          ┌──────────┐          ┌──────────┐
│  Client   │          │  Server   │          │  DB      │
└────┬─────┘          └────┬─────┘          └────┬─────┘
     │                     │                     │
     │ POST /api/auth/login│                     │
     │ {email, password}   │                     │
     │─────────────────────►                     │
     │                     │  Lookup user by email│
     │                     │─────────────────────►
     │                     │  User record         │
     │                     │◄─────────────────────│
     │                     │                     │
     │                     │ bcrypt.compare()     │
     │                     │ jwt.sign({userId,    │
     │                     │   email, name})      │
     │                     │                     │
     │  Set-Cookie: token  │                     │
     │  + JSON: {token}    │                     │
     │◄─────────────────────                     │
     │                     │                     │
     │ GET /api/meetings   │                     │
     │ Authorization:      │                     │
     │   Bearer <token>    │                     │
     │─────────────────────►                     │
     │                     │ jwt.verify(token)    │
     │                     │ → {userId, email}    │
     │                     │ attach to req.user   │
     │                     │                     │
     │  200 OK {meetings}  │                     │
     │◄─────────────────────                     │
```

---

## 10. Middleware Chain

The middleware executes in this **exact order** as registered in `src/index.ts`:

```
 ① disablePoweredBy          → Remove X-Powered-By header
 ② securityHeaders           → Set security response headers (XFO, CSP, HSTS, etc.)
 ③ CORS                      → Validate request origin, set Access-Control-* headers
 ④ express.json()            → Parse JSON body (limit: MAX_REQUEST_SIZE)
 ⑤ express.urlencoded()      → Parse URL-encoded body
 ⑥ cookieParser()            → Parse cookies (needed for CSRF & JWT cookie auth)
 ⑦ sanitizeInput             → Strip dangerous patterns from req.body and req.query
 ⑧ requestLogger             → Log method, path, status, duration, IP, user-agent
 ⑨ Request Timeout           → Set req/res timeout to REQUEST_TIMEOUT ms
 ⑩ csrfTokenGenerator        → Generate CSRF token cookie if missing
 ⑪ csrfProtect               → Validate CSRF token on POST/PUT/DELETE/PATCH (prod only)
 ⑫ generalRateLimiter        → Global rate limit check (toggleable via ENABLE_RATE_LIMITER)
    ─── Route-Level ───
 ⑬ Route-specific rate limiter (authRateLimiter / apiRateLimiter)
 ⑭ Zod validation middleware  (validateBody / validateQuery / validateParams)
 ⑮ protect (JWT auth)         (on protected routes)
 ⑯ Controller handler
    ─── Error Boundary ───
 ⑰ notFoundHandler           → Catch 404s for unmatched routes
 ⑱ errorHandler              → Global catch-all error handler (returns structured JSON)
```

---

## 11. API Reference

### Authentication (`/api/auth`)

| Method | Endpoint                    | Auth | Rate Limit | Description                                          |
| ------ | --------------------------- | ---- | ---------- | ---------------------------------------------------- |
| `POST` | `/api/auth/register`        | ✗    | Auth       | Register new user (Zod: name, email, password rules) |
| `POST` | `/api/auth/login`           | ✗    | Auth       | Login with email/password → JWT token                |
| `POST` | `/api/auth/logout`          | ✗    | Auth       | Clear auth cookies                                   |
| `GET`  | `/api/auth/me`              | ✓    | Auth       | Get current authenticated user profile               |
| `GET`  | `/api/auth/users`           | ✗    | Auth       | List all registered users                            |
| `POST` | `/api/auth/change-password` | ✓    | Auth       | Change password (current + new + confirm)            |

### Meetings (`/api/meetings`)

| Method   | Endpoint                                   | Auth | Description                                                        |
| -------- | ------------------------------------------ | ---- | ------------------------------------------------------------------ |
| `GET`    | `/api/meetings`                            | ✓    | List meetings (paginated, filterable: search, type, archive, sort) |
| `GET`    | `/api/meetings/:id`                        | ✓    | Get single meeting with full summary                               |
| `POST`   | `/api/meetings`                            | ✓    | Create new meeting                                                 |
| `PUT`    | `/api/meetings/:id`                        | ✓    | Update meeting                                                     |
| `POST`   | `/api/meetings/:id/summarize`              | ✓    | Trigger AI summarization (async job)                               |
| `POST`   | `/api/meetings/:id/chat`                   | ✓    | RAG Q&A chat with meeting context                                  |
| `PATCH`  | `/api/meetings/:id/publish`                | ✓    | Toggle public share link (AES-256-GCM token)                       |
| `POST`   | `/api/meetings/:id/delete`                 | ✓    | Soft-delete meeting                                                |
| `POST`   | `/api/meetings/:id/archive`                | ✓    | Archive meeting                                                    |
| `POST`   | `/api/meetings/:id/unArchive`              | ✓    | Unarchive meeting                                                  |
| `POST`   | `/api/meetings/:id/restore`                | ✓    | Restore from trash                                                 |
| `POST`   | `/api/meetings/:id/pin`                    | ✓    | Toggle pin status                                                  |
| `DELETE` | `/api/meetings/:id/permanent`              | ✓    | Permanently delete (irreversible)                                  |
| `POST`   | `/api/meetings/create/clone`               | ✓    | Clone a meeting                                                    |
| `GET`    | `/api/meetings/public/share/:token`        | ✗    | Access shared meeting via encrypted token                          |
| `POST`   | `/api/meetings/public/share/:token/verify` | ✗    | Verify password for password-protected share                       |

### Action Items (`/api/action-items`)

| Method   | Endpoint                               | Auth | Description                                                                |
| -------- | -------------------------------------- | ---- | -------------------------------------------------------------------------- |
| `GET`    | `/api/action-items`                    | ✓    | List all action items (paginated, filterable: status, priority, meetingId) |
| `GET`    | `/api/action-items/leaderboard`        | ✓    | Aggregated leaderboard by owner                                            |
| `GET`    | `/api/action-items/meeting/:meetingId` | ✓    | Get action items for specific meeting                                      |
| `GET`    | `/api/action-items/:id`                | ✓    | Get single action item                                                     |
| `POST`   | `/api/action-items`                    | ✓    | Create action item manually                                                |
| `PUT`    | `/api/action-items/:id`                | ✓    | Full update                                                                |
| `PATCH`  | `/api/action-items/:id`                | ✓    | Partial update (e.g., status change)                                       |
| `DELETE` | `/api/action-items/:id`                | ✓    | Delete action item                                                         |

### Jobs (`/api/jobs`)

| Method | Endpoint        | Auth | Description                                           |
| ------ | --------------- | ---- | ----------------------------------------------------- |
| `GET`  | `/api/jobs/:id` | ✓    | Poll job status (pending/processing/completed/failed) |

### Settings (`/api/settings`)

| Method | Endpoint                 | Auth | Description                                            |
| ------ | ------------------------ | ---- | ------------------------------------------------------ |
| `GET`  | `/api/settings`          | ✓    | Get user settings (summary preferences, notifications) |
| `PUT`  | `/api/settings`          | ✓    | Update user settings                                   |
| `GET`  | `/api/settings/sessions` | ✓    | List user login sessions                               |

### Dashboard (`/api/dashboard`)

| Method | Endpoint               | Auth | Description                                    |
| ------ | ---------------------- | ---- | ---------------------------------------------- |
| `GET`  | `/api/dashboard/stats` | ✓    | Aggregated dashboard metrics & recent meetings |

### Notifications (`/api/notifications`)

| Method   | Endpoint                      | Auth | Description                    |
| -------- | ----------------------------- | ---- | ------------------------------ |
| `GET`    | `/api/notifications`          | ✓    | Get user notifications         |
| `PATCH`  | `/api/notifications/read-all` | ✓    | Mark all notifications as read |
| `DELETE` | `/api/notifications`          | ✓    | Clear all notifications        |

### System Endpoints

| Method | Endpoint           | Auth | Description                                               |
| ------ | ------------------ | ---- | --------------------------------------------------------- |
| `GET`  | `/health`          | ✗    | Health check (status, environment, timestamp)             |
| `GET`  | `/api/diagnostics` | ✗    | Server diagnostics — dev only (memory, uptime, job stats) |
| `GET`  | `/api-docs`        | ✗    | Swagger UI interactive API documentation                  |
| `GET`  | `/`                | ✗    | API index listing all available endpoints                 |

---

## 12. Caching Strategy

The system uses an **in-memory TTL cache** singleton with automatic expiration and invalidation.

### Cache Configuration

| Parameter   | Value                                | Description                        |
| ----------- | ------------------------------------ | ---------------------------------- |
| Default TTL | 5 minutes                            | Auto-expiration for cached entries |
| Storage     | `Map<string, CacheEntry>`            | In-process memory storage          |
| Cleanup     | Automatic via `setTimeout` per entry | No stale entries persist           |

### Cache Key Schema

```
users:all                          → All users list
user:{id}                          → Single user by ID
user:email:{email}                 → User lookup by email
meetings:{userId}:{page}:{limit}  → Paginated meeting list
meeting:{id}                       → Single meeting
action_items:{userId}:{page}:{limit} → Paginated action items
action_item:{id}                   → Single action item
action_items:meeting:{meetingId}   → Action items by meeting
```

### Invalidation Patterns

Cache invalidation is **event-driven** — when mutations occur, related cache keys are proactively invalidated:

- **User mutation** → Invalidates `user:{id}`, `user:email:{email}`, `users:all`
- **Meeting mutation** → Invalidates `meeting:{id}`, all `meetings:{userId}:*` entries
- **Action item mutation** → Invalidates `action_item:{id}`, `action_items:meeting:{meetingId}`, all `action_items:{userId}:*`

### `getOrCompute()` Pattern

```typescript
const data = await cache.getOrCompute(
  cacheKey,
  async () => {
    // Expensive DB query or computation
    return await db.select().from(meetings);
  },
  5 * 60 * 1000
); // 5 min TTL
```

---

## 13. Environment Configuration

All environment variables are **validated at startup** using a Zod schema. The server will **exit immediately** on validation failure with a descriptive error.

| Variable                       | Required | Default               | Description                                              |
| ------------------------------ | -------- | --------------------- | -------------------------------------------------------- |
| `NODE_ENV`                     | ✗        | `development`         | Environment mode (`development` / `production` / `test`) |
| `PORT`                         | ✗        | `5000`                | Server listen port                                       |
| `DATABASE_URL`                 | ✓        | —                     | Neon PostgreSQL connection string                        |
| `JWT_SECRET`                   | ✓ (prod) | Fallback string       | Minimum 32 characters in production                      |
| `JWT_EXPIRES_IN`               | ✗        | `7d`                  | Token expiry duration                                    |
| `GOOGLE_GENERATIVE_AI_API_KEY` | ✗        | —                     | Primary Gemini API key                                   |
| `GEMINI_FALL_BACK_KEY`         | ✗        | —                     | Fallback Gemini key (Step 3 in cascade)                  |
| `GEMINI_API_KEYS`              | ✗        | —                     | Comma-separated keys for rotation policy                 |
| `CORS_ORIGINS`                 | ✗        | `localhost:3000,3001` | Allowed CORS origins (comma-separated)                   |
| `MAX_REQUEST_SIZE`             | ✗        | `10mb`                | Maximum request body size                                |
| `REQUEST_TIMEOUT`              | ✗        | `30000`               | Request timeout in milliseconds                          |
| `RATE_LIMIT_WINDOW_MS`         | ✗        | `900000` (15 min)     | General rate limit window                                |
| `RATE_LIMIT_MAX_REQUESTS`      | ✗        | `100`                 | Max requests per general window                          |
| `ENABLE_RATE_LIMITER`          | ✗        | `true`                | Toggle rate limiting on/off                              |
| `AUTH_RATE_LIMITER`            | ✗        | `100`                 | Max auth requests per 15-min window                      |
| `AI_RATE_LIMITER`              | ✗        | `100`                 | Max AI requests per 1-hour window                        |
| `API_RATE_LIMITER`             | ✗        | `1000`                | Max API requests per 5-min window                        |
| `ENABLE_DEBUG_LOGGING`         | ✗        | `false`               | Enable RAG debug log file output                         |

### Production Safety Checks

The configuration layer enforces additional validation in production:

1. **JWT_SECRET** must not be the default fallback — exits with error.
2. **AI API keys** — warns (non-fatal) if no keys are configured; summarization falls back to heuristics.

---

## 14. Error Handling & Logging

### Error Class Hierarchy

```
Error (native)
  └── AppError (base, 500)
        ├── ValidationError      (400, VALIDATION_ERROR)
        ├── AuthenticationError  (401, AUTHENTICATION_ERROR)
        ├── AuthorizationError   (403, AUTHORIZATION_ERROR)
        ├── NotFoundError        (404, NOT_FOUND)
        ├── ConflictError        (409, CONFLICT)
        ├── RateLimitError       (429, RATE_LIMIT_EXCEEDED)
        ├── InternalServerError  (500, INTERNAL_ERROR)
        └── BadGatewayError      (502, BAD_GATEWAY)
```

### Error Response Format

All errors return a consistent JSON structure:

```json
{
  "error": "VALIDATION_ERROR",
  "message": "Email must be a valid email format",
  "code": "VALIDATION_ERROR",
  "statusCode": 400,
  "details": {
    "email": "Invalid email format"
  }
}
```

### Structured Logging

The `Logger` class outputs **JSON-formatted log entries** to stdout/stderr:

```json
{
  "timestamp": "2026-08-15T12:30:00.000Z",
  "level": "info",
  "message": "POST /api/meetings",
  "context": {
    "method": "POST",
    "path": "/api/meetings",
    "status": 201,
    "duration": "145ms",
    "ip": "::1",
    "userId": "usr-abc123"
  }
}
```

| Level   | Output                   | When                                                              |
| ------- | ------------------------ | ----------------------------------------------------------------- |
| `debug` | `console.log` (dev only) | Cache hits/misses, job state changes, verbose internals           |
| `info`  | `console.log`            | Request logs, server startup, job completions                     |
| `warn`  | `console.warn`           | Auth failures, rate limits, deprecation notices, AI key failovers |
| `error` | `console.error`          | Unhandled errors, 5xx responses (includes stack trace in dev)     |

### Sensitive Data Redaction

The error handler automatically redacts these fields from logged request bodies:  
`password`, `token`, `secret`, `apiKey`, `authorization`

---

## 15. Database Migrations

Migrations are managed by **Drizzle Kit** and stored in the `drizzle/` directory as raw SQL files.

### Migration History

| Migration               | File              | Changes                                                                                                                                                       |
| ----------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `0000_special_vanisher` | Initial schema    | `users`, `meetings`, `action_items` tables with indexes & FK constraints                                                                                      |
| `0001_clever_tarantula` | Feature expansion | `pgvector` extension, `meeting_chunks`, `notifications`, `user_sessions`, `user_settings` tables; `share_password` and `share_expires_at` columns on meetings |

### Migration Commands

```bash
# Generate new migration from schema changes
npm run db:generate

# Push schema directly to database (development)
npm run db:push

# Open Drizzle Studio (visual DB browser)
npm run db:studio
```

---

## 16. Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9
- **Neon PostgreSQL** account (with pgvector extension enabled)
- **Google Gemini API key** (for AI features)

### Setup

```bash
# 1. Install dependencies
cd Backend
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your DATABASE_URL, JWT_SECRET, and API keys

# 3. Push database schema
npm run db:push

# 4. Start development server
npm run dev
# Server starts on http://localhost:4000

# 5. Access API documentation
# Open http://localhost:4000/api-docs in browser
```

### Available Scripts

| Script         | Command                               | Description                                |
| -------------- | ------------------------------------- | ------------------------------------------ |
| `dev`          | `nodemon --exec ts-node src/index.ts` | Start dev server with hot-reload           |
| `build`        | `tsc`                                 | Compile TypeScript to JavaScript           |
| `start`        | `node dist/index.js`                  | Start production server                    |
| `db:generate`  | `drizzle-kit generate`                | Generate migration SQL from schema changes |
| `db:push`      | `drizzle-kit push`                    | Push schema to database                    |
| `db:studio`    | `drizzle-kit studio`                  | Open visual database browser               |
| `lint`         | `tsc --noEmit`                        | Type-check without emitting                |
| `format`       | `prettier --write "src/**/*"`         | Format all source files                    |
| `format:check` | `prettier --check "src/**/*"`         | Check formatting compliance                |

---

## 17. Production Considerations

### Current Limitations (In-Memory Implementations)

The following components are currently implemented as **in-memory** solutions and should be replaced for production horizontally-scaled deployments:

| Component         | Current                    | Recommended Production                                                                            |
| ----------------- | -------------------------- | ------------------------------------------------------------------------------------------------- |
| **Job Queue**     | In-memory `Map` + array    | **Bull** or **BullMQ** (Redis-backed) for persistence, distributed workers, dead-letter queues    |
| **Rate Limiter**  | In-memory `RateLimitStore` | **Redis-backed** sliding window (e.g., `rate-limiter-flexible`) for shared state across instances |
| **Cache**         | In-memory `Map` with TTL   | **Redis** or **Memcached** for distributed caching                                                |
| **Session Store** | Database-only              | Consider **Redis-backed sessions** for high-frequency session validation                          |

### Scaling Recommendations

1. **Horizontal scaling** — Migrating in-memory stores to Redis enables running multiple Node.js instances behind a load balancer.
2. **pgvector indexing** — Add `ivfflat` or `hnsw` indexes on the `embedding` column for sub-linear similarity search at scale:
   ```sql
   CREATE INDEX ON meeting_chunks USING hnsw (embedding vector_cosine_ops);
   ```
3. **Connection pooling** — The current Neon serverless driver handles connection pooling automatically, but for high throughput, consider explicit pooling with `@neondatabase/serverless` pool mode.
4. **AI API rate management** — The RPI (Rotation Policy Implementation) with multiple keys provides horizontal key scaling. Monitor quota usage per key.
5. **Observability** — Integrate structured logging with a log aggregation platform (Datadog, Grafana Loki) and add APM tracing.

### Security Checklist for Production

- [ ] Set `JWT_SECRET` to a cryptographically random 32+ character value
- [ ] Set `NODE_ENV=production` to enable HSTS, strict CSRF enforcement
- [ ] Configure `CORS_ORIGINS` with exact production domain(s)
- [ ] Enable `ENABLE_RATE_LIMITER=true`
- [ ] Use HTTPS termination at reverse proxy (Nginx/Cloudflare)
- [ ] Review and restrict `MAX_REQUEST_SIZE` based on expected payload sizes
- [ ] Rotate `GEMINI_API_KEYS` periodically and monitor quotas
- [ ] Set appropriate `REQUEST_TIMEOUT` for AI endpoints (summarization can be slow)

---

> **This document was auto-generated from the backend source code analysis. For interactive API testing, visit `/api-docs` (Swagger UI) when the server is running.**

---

Solid foundation — you've actually implemented two RAG pipelines, which is more than most people attempt. But as-is, this looks like a **v1 prototype dressed up as a system**. Here's what a senior architect would push back on, and how to fix it for your portfolio/resume story.

## The biggest structural issue: two competing RAG pipelines

Right now you have `aiService.ts` (pgvector) and `ragService.ts` (TF-IDF) doing the same job with no clear ownership boundary. In an interview, this reads as "I didn't converge on a design" rather than "I built resilience." Fix the narrative:

- **Collapse to one primary retrieval path** (vector) with **TF-IDF/BM25 as a genuine hybrid signal**, not a separate fallback system. Real production RAG (Weaviate, Pinecone-backed apps, LlamaIndex defaults) almost always does **hybrid search**: vector similarity + sparse keyword scoring, merged with **Reciprocal Rank Fusion (RRF)** rather than picking one or the other.
- Keep the "no embeddings available" heuristic path, but frame it explicitly as a **degraded-mode fallback**, not pipeline B.

This alone is a good interview talking point: "I initially built two separate retrieval systems, then refactored into a single hybrid retriever using RRF — here's why."

## Chunking is the weakest link

Your current strategy (`split by \n\n`, filter <20 chars, or 250-word/40-word overlap windows) is naive:

- **No token-aware chunking.** You're splitting by words/paragraphs, not by actual tokenizer output, so chunk sizes are inconsistent relative to what the embedding model actually sees.
- **No semantic chunking.** Consider sentence-boundary-aware splitting with a target token count (e.g. 300–500 tokens) and 10–15% overlap — libraries like `langchain`'s `RecursiveCharacterTextSplitter` or a simple custom implementation are fine to hand-roll here for portfolio purposes.
- **No metadata enrichment per chunk.** Store `speaker`, `timestamp/position`, `section_type` (discussion/decision/action item) alongside `content` and `embedding`. This lets you do metadata-filtered retrieval later ("what did the security team say about X") — a much stronger RAG story than plain similarity search.

## Retrieval quality gaps

- **Static top-K=5 and threshold=0.75** — arbitrary, unvalidated. Add a fallback: if fewer than N chunks clear the threshold, widen the search rather than silently under-retrieving.
- **No query transformation.** Multi-turn chat questions like "what about the budget?" have no context without rewriting against chat history. Add a lightweight query-rewrite step (send chat history + question to the LLM, get back a standalone query) before embedding.
- **No re-ranking.** After retrieving top-20 by cosine similarity, re-rank with a cross-encoder or even just an LLM-based relevance score before feeding top-5 into the answer prompt. This is usually the single highest-leverage RAG improvement.

## Indexing — you already flagged this but didn't do it

Your doc says "add hnsw index" under Production Considerations but it's not implemented. For a resume project, actually add it:

```sql
CREATE INDEX ON meeting_chunks USING hnsw (embedding vector_cosine_ops);
```

Doing brute-force cosine scan (`ORDER BY distance`) on unindexed pgvector doesn't scale past a few thousand rows — worth mentioning if asked "how does this scale."

## Missing: evaluation

This is what separates "I called an LLM API" from "I built a RAG system" in an interview. Add:

- A small golden Q&A dataset (20-30 question/answer pairs per meeting type)
- Basic retrieval metrics: precision@k, recall@k
- Even a simple RAGAS-style faithfulness/relevance check using the LLM itself as judge

You don't need infrastructure for this — a script that runs your retrieval + generation against the golden set and logs scores is enough to talk about intelligently.

## Suggested target architecture

```
Query → Query Rewrite (LLM, uses chat history)
      → Embed query
      → Hybrid retrieve: vector search (pgvector, hnsw) + BM25/TF-IDF
      → Merge via RRF
      → Re-rank top-20 → top-5 (cross-encoder or LLM scorer)
      → Build prompt with chunks + metadata + citations
      → generateObject() with Gemini (keep your fallback cascade — that part's solid)
      → Return answer + source chunk references
```

Given this maps directly onto the **RAG-powered document Q&A project** you've had on your roadmap, want me to help you scope this into a standalone project (separate from the meeting transcript app) with a cleaner architecture doc and a defensible "why hybrid + RRF over pure vector" story for interviews?
