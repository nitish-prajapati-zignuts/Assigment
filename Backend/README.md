# AI-Powered Meeting Notes - Backend API

This is the Express & TypeScript backend API for the **AI-Powered Meeting Notes & Action Item Summarizer** application.

---

## 🛠️ Technology Stack

- **Runtime**: Node.js & Express
- **Language**: TypeScript
- **Database & ORM**: PostgreSQL (Neon Serverless) managed with Drizzle ORM & Drizzle Kit
- **Async Job Queue**: Built-in in-memory asynchronous queue (`JobQueue` singleton) for non-blocking AI task processing
- **AI Integration**: Vercel AI SDK (`ai`, `@ai-sdk/google`) powered by an automated API Key Rotator (`GEMINI_API_KEYS`, `GOOGLE_GENERATIVE_AI_API_KEY`, `GEMINI_API_KEY`, `GEMINI_FALL_BACK_KEY`) with retry loops
- **Prompt Engine**: Modular prompt construction (`buildMeetingSummaryPrompt`) in `src/utils/aiPrompts.ts`
- **Rate Limiting**: Custom configurable rate limiters (`AUTH_RATE_LIMITER`, `AI_RATE_LIMITER`, `API_RATE_LIMITER`)
- **Authentication**: JWT (JSON Web Tokens) in HTTP-only cookies (`auth_token`) and `bcryptjs` password hashing

---

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `Backend/` directory:

```env
PORT=4000
DATABASE_URL=postgresql://<user>:<password>@<host>/<dbname>?sslmode=require
JWT_SECRET=your_jwt_secret_key_here
GEMINI_API_KEYS=key1,key2,key3
GOOGLE_GENERATIVE_AI_API_KEY=your_primary_gemini_api_key
GEMINI_FALL_BACK_KEY=your_backup_gemini_api_key
ENABLE_RATE_LIMITER=true
AUTH_RATE_LIMITER=100
AI_RATE_LIMITER=100
API_RATE_LIMITER=1000
NODE_ENV=development
```

### 3. Database Push & Development Server

```bash
npm run db:push
npm run dev
```

The API will start at `http://localhost:4000`.

---

## ⚙️ Core System Architecture & Features

- **Custom AI Summary Templates & Prompt Styles**:
   - Supports 5 role-tailored prompt styles (*Standard Briefing*, *Executive Summary*, *Developer Tasks*, *Technical Decisions*, *Sales Qualification*).
   - Generates template-specific structured payload objects (`executiveDetails`, `developerDetails`, `technicalDetails`, `salesDetails`) saved in database `summary` JSON column.

- **Sentiment & Speaker Analytics Engine**:
   - Mandatory tone detection (*Positive*, *Neutral*, *Concerned*, *Heated*) and talk-time distribution per speaker.
   - Calculated via AI LLM schema and rule-based text parser fallback engine.

- **Protected & Expiring Public Share Links (`/share/[token]`)**:
   - Encrypted Base64URL AES-256-GCM token resolution.
   - **Bcrypt Password Access**: Optional password restriction (`sharePassword`). `POST /api/meetings/public/share/:token/verify` verifies hashed passwords before unlocking contents.
   - **Expiration Windows**: Configurable link expiry (`shareExpiresAt`) for 1 hour, 24 hours, 7 days, 30 days, or permanent access.

- **Chronological Meetings Ordering**:
   - All `GET /api/meetings` database queries sort records directly via `orderBy(desc(meetings.createdAt))` to return newest created meetings first.

- **Async Job Queue (`JobQueue`)**:
   - Non-blocking background worker processes AI meeting summarization (`summarize_meeting`).
   - Resilient retry strategy with exponential backoff on failure.

- **RAG Chatbot Q&A System with pgvector (`POST /api/meetings/:id/chat`)**:
   - Vector-similarity chunk retrieval using cosine distance query matching.
   - Text heuristic fallback implementation guaranteeing zero downtime.
- **Dedicated Dashboard Stats & Analytics Endpoint (`GET /api/dashboard/stats`)**:
   - Computes aggregated user statistics directly in the database layer (Total Meetings, Action Items, Open, Completed, Overdue, Blocked, Saved Transcripts).

- **Resilient Key Rotation & Multi-Tier AI Retry Loop**:
   - Round-robin key rotator across custom user keys, `GEMINI_API_KEYS`, primary keys, and fallback keys.
   - Resilient rule-based text parser fallback engine guaranteeing zero downtime.
