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

1. **Async Job Queue (`JobQueue`)**:
   - Non-blocking background worker processes AI meeting summarization (`summarize_meeting`).
   - Resilient retry strategy with exponential backoff on failure.
   - Polling endpoint `GET /api/jobs/:id` allows clients to track job status (`pending`, `processing`, `completed`, `failed`).

2. **Dedicated Dashboard Stats & Analytics Endpoint (`GET /api/dashboard/stats`)**:
   - Computes aggregated user statistics directly in the database layer (Total Meetings, Action Items, Open, Completed, Overdue, Blocked, Saved Transcripts).
   - Computes time-series chart analytics (Meetings timeline, Action item status distribution, Task priority distribution, and Key Decisions categories).
   - Returns top 4 recent meetings sorted chronologically.

3. **Resilient Key Rotation & Multi-Tier AI Retry Loop**:
   - **Key Rotator**: Automatically aggregates custom user keys, comma-separated environment keys (`GEMINI_API_KEYS`), primary keys (`GOOGLE_GENERATIVE_AI_API_KEY`), and fallback keys (`GEMINI_FALL_BACK_KEY`).
   - **Sequential Retry Loop**: Iterates through available API keys on failure or quota limits before gracefully dropping to the heuristic summary parser.
   - **Structured Text Heuristic Engine**: Resilient fallback parser & unanswered question detector if LLMs fail.

4. **Action Item Relational Sync**:
   - Automatically syncs extracted action items into PostgreSQL `action_items` table and matches participant emails/names to registered user IDs.

5. **Configurable Rate Limiters**:
   - Dynamic threshold limits via `.env` (`AUTH_RATE_LIMITER`, `AI_RATE_LIMITER`, `API_RATE_LIMITER`).

