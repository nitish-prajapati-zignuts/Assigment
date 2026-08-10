# AI-Powered Meeting Notes - Backend API

This is the Express & TypeScript backend API for the **AI-Powered Meeting Notes & Action Item Summarizer** application.

---

## 🛠️ Technology Stack

- **Runtime**: Node.js & Express
- **Language**: TypeScript
- **Database & ORM**: PostgreSQL (Neon Serverless) managed with Drizzle ORM & Drizzle Kit
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

## ⚙️ AI Summarization Architecture & Features

1. **Multi-Tier AI Fallback Pipeline**:
   - **Primary Model**: Google Gemini (`gemini-1.5-flash`)
   - **Fallback Model**: OpenAI (`gpt-4o-mini`) if Gemini throws an error or lacks API keys
   - **Structured Text Heuristics Engine**: Last resort parser if all AI models fail
2. **Multi-Language Output Engine**:
   - Accepts `language` parameter in request body (`createMeeting`, `updateMeeting`, `summarizeMeeting`).
   - Dynamically injects language rules into LLM system prompt to generate structured output fields in the requested language.
3. **Action Item Relational Sync**:
   - Automatically syncs extracted action items into PostgreSQL `action_items` table and matches participant emails/names to registered user IDs.
