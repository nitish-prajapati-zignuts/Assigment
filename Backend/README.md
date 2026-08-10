# AI-Powered Meeting Notes - Backend API

This is the Express & TypeScript backend API for the **AI-Powered Meeting Notes & Action Item Summarizer** application.

---

## 🛠️ Technology Stack

- **Runtime**: Node.js & Express
- **Language**: TypeScript
- **Database & ORM**: PostgreSQL (Neon Serverless) managed with Drizzle ORM & Drizzle Kit
- **Async Job Queue**: Built-in in-memory asynchronous queue (`JobQueue` singleton) for non-blocking AI task processing
- **AI Integration**: Vercel AI SDK (`ai`, `@ai-sdk/google`, `@ai-sdk/openai`)
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
GOOGLE_GENERATIVE_AI_API_KEY=your_google_gemini_api_key
OPENAI_API_KEY=your_openai_api_key_optional
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

2. **Dedicated Dashboard Stats Endpoint (`GET /api/dashboard/stats`)**:
   - Computes aggregated user statistics directly in the database layer (Total Meetings, Action Items, Open, Completed, Overdue, Blocked, Saved Transcripts).
   - Returns top 4 recent meetings sorted chronologically.

3. **Multi-Tier AI Fallback Pipeline**:
   - **Primary Model**: Google Gemini (`gemini-1.5-flash`)
   - **Fallback Model**: OpenAI (`gpt-4o-mini`) if Gemini fails or lacks API keys
   - **Structured Text Heuristic Engine**: Fallback parser if LLMs fail

4. **Action Item Relational Sync**:
   - Automatically syncs extracted action items into PostgreSQL `action_items` table and matches participant emails/names to registered user IDs.

