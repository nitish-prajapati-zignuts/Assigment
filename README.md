# AI-Powered Meeting Notes & Action Item Summarizer

A full-stack, enterprise-grade web application designed to capture, structure, summarize, and extract actionable insight from meeting transcripts using AI.

---

##  Project Overview

The **AI Meeting Notes Summarizer** streamlines post-meeting workflows by transforming unstructured meeting transcripts or text summaries into structured intelligence. It automatically generates key discussion points, key decisions, major outcomes, concerns, next steps, and granular action items assigned to users with priority and due dates.

---

## 🛠️ Technology Stack

### **Frontend**
- **Framework**: Next.js 16 (App Router) & React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4, Modern OKLCH color theme layout with glassmorphic cards and ambient lighting effects
- **Visual Data Charts**: `recharts` for rich time-series, speaker analytics, and decision distribution charts
- **Typography**: Plus Jakarta Sans (`next/font/google`)
- **HTTP Client**: Axios (configured with `withCredentials: true` for HTTP-only cookie authentication)
- **Icons & Components**: Lucide React, Radix UI primitives (`@radix-ui/react-tabs`), Base UI, TinyMCE Editor

### **Backend**
- **Runtime**: Node.js & Express
- **Language**: TypeScript
- **Database & ORM**: PostgreSQL (Neon Serverless) managed with Drizzle ORM & Drizzle Kit
- **AI Integration**: Vercel AI SDK (`ai`, `@ai-sdk/google`) powered by an automated multi-key rotation and fallback policy:
  1. **User Custom Key**: Key optionally passed in request headers (`x-gemini-api-key`)
  2. **Multi-Key Rotation Array**: De-duplicated comma-separated keys from `GEMINI_API_KEYS` (Round-Robin execution)
  3. **Primary Model Key**: Google Gemini (`GOOGLE_GENERATIVE_AI_API_KEY` or `GEMINI_API_KEY`)
  4. **Fallback Model Key**: Secondary Gemini Key (`GEMINI_FALL_BACK_KEY`)
  5. **Text Heuristic Fallback**: Resilient rule-based text parser and unanswered question extractor (zero-downtime guaranteed)
- **AI Summary Templates / Prompt Styles**: Selectable AI output summary styles (*Standard Briefing*, *Executive Summary*, *Developer Tasks*, *Technical Decisions*, *Sales Qualification*) generating role-tailored structured objects.
- **Sentiment & Speaker Participation Analytics**: Mandatory LLM/heuristic tone detection (*Positive*, *Neutral*, *Concerned*, *Heated*) and speaker talk-time distribution.
- **Enhanced Public Share Links**: AES-256-GCM encrypted public share URLs (`/share/[token]`) with optional **Bcrypt Password Access Locks** and **Link Expiration Windows** (*1 Hour*, *1 Day*, *7 Days*, *30 Days*, *Never*).
- **Rate Limiting**: Configurable middleware for Auth (`AUTH_RATE_LIMITER`), AI endpoints (`AI_RATE_LIMITER`), and API routes (`API_RATE_LIMITER`)
- **Authentication**: JWT (JSON Web Tokens) stored securely in HTTP-only cookies (`auth_token`) and `bcryptjs` password hashing

---

## ⚙️ Setup Instructions

### **Prerequisites**
- Node.js (v18 or higher)
- npm or yarn package manager
- PostgreSQL Database URL (Neon DB instance recommended)
- Google Gemini API Key (`GOOGLE_GENERATIVE_AI_API_KEY` or `GEMINI_API_KEY`) and optional Fallback Keys (`GEMINI_API_KEYS`, `GEMINI_FALL_BACK_KEY`)

---

### **1. Clone & Set Up Backend**

```bash
cd Backend
npm install
```

Create a `.env` file inside the `Backend/` directory:

```env
PORT=4000
DATABASE_URL=postgresql://<user>:<password>@<host>/<dbname>?sslmode=require
JWT_SECRET=your_jwt_secret_key_here
GEMINI_API_KEYS=key1,key2,key3
GOOGLE_GENERATIVE_AI_API_KEY=your_google_gemini_api_key
GEMINI_FALL_BACK_KEY=your_backup_gemini_api_key_optional
ENABLE_RATE_LIMITER=true
AUTH_RATE_LIMITER=100
AI_RATE_LIMITER=100
API_RATE_LIMITER=1000
NODE_ENV=development
```

Run database migrations:

```bash
npm run db:push
```

Start the backend development server:

```bash
npm run dev
```
The server will start at `http://localhost:4000`.

---

### **2. Set Up Frontend**

```bash
cd Frontend
npm install
```

Create a `.env.local` file inside the `Frontend/` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

Start the frontend development server:

```bash
npm run dev
```
The client application will run at `http://localhost:3000`.

---

## 🔐 Environment Variables

| Variable | Description | Location |
|---|---|---|
| `PORT` | Backend server port (Default: `4000`) | Backend `.env` |
| `DATABASE_URL` | PostgreSQL connection string | Backend `.env` |
| `JWT_SECRET` | Secret key used for signing authentication JWT tokens | Backend `.env` |
| `GEMINI_API_KEYS` | Optional comma-separated list of Gemini API keys for rotation | Backend `.env` |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Primary API Key for Google Gemini model | Backend `.env` |
| `GEMINI_FALL_BACK_KEY` | Fallback API Key for backup Google Gemini quota/account | Backend `.env` |
| `ENABLE_RATE_LIMITER` | Toggle rate limiting middleware (`true`/`false`) | Backend `.env` |
| `AUTH_RATE_LIMITER` | Max auth endpoint attempts allowed in 15 mins (Default: `100`) | Backend `.env` |
| `AI_RATE_LIMITER` | Max AI endpoint requests allowed per hour (Default: `100`) | Backend `.env` |
| `API_RATE_LIMITER` | Max standard API calls allowed per 5 mins (Default: `1000`) | Backend `.env` |
| `NODE_ENV` | Development or Production environment state | Backend `.env` |
| `NEXT_PUBLIC_API_URL` | Base URL of the Express backend API | Frontend `.env.local` |

---

## 🏗️ Architecture Overview

The system follows a modern decoupled client-server architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Frontend (3000)                  │
│  - User Auth (Login/Register)                               │
│  - Tabbed Dashboard (Overview & Visual Analytics)           │
│  - Interactive Recharts Visual Analytics (Area, Donut, Bar)  │
│  - Meeting Management & File Transcript Upload               │
│  - Action Item Tracker & Priority Filter                    │
│  - Unanswered Questions Empty State UI Display              │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP Requests (with HTTP-only Cookies)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    Express Backend (4000)                   │
│  - Controllers & Routes (Auth, Meetings, Action Items, AI)  │
│  - JWT Verification & Dynamic Rate Limiting Middleware      │
│  - Modular AI Prompt Engine (buildMeetingSummaryPrompt)     │
│  - Key Rotator & Retry Loop Pipeline                        │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
               ▼                              ▼
┌──────────────────────────────┐┌─────────────────────────────┐
│    PostgreSQL (Neon DB)      ││    API Key Rotator Pipeline │
│  - Drizzle ORM Schema        ││  - Multi-Key Array Rotation │
│                              ││  - Primary/Fallback Keys    │
│                              ││  - Text & Question Parser   │
└──────────────────────────────┘└─────────────────────────────┘
```

---

##  Database Design

The PostgreSQL database uses three core relational tables defined via **Drizzle ORM**:

### `users`
| Column | Type | Attributes |
|---|---|---|
| `id` | VARCHAR(255) | PRIMARY KEY |
| `name` | TEXT | NOT NULL |
| `email` | TEXT | UNIQUE, NOT NULL |
| `password` | TEXT | NOT NULL |
| `created_at` | TIMESTAMP | DEFAULT NOW() |

### `meetings`
| Column | Type | Attributes |
|---|---|---|
| `id` | VARCHAR(255) | PRIMARY KEY |
| `title` | TEXT | NOT NULL |
| `date` | TEXT | NOT NULL |
| `type` | TEXT | NOT NULL |
| `participants` | JSONB | Array of participant strings |
| `transcript` | TEXT | Full transcript text |
| `summary` | JSONB | Structured JSON (Purposes, Outcomes, Concerns, Unanswered Questions, Next Steps, Key Decisions) |
| `is_meeting_published` | BOOLEAN | DEFAULT FALSE (Public share access toggle) |
| `created_at` | TIMESTAMP | DEFAULT NOW() |

### `action_items`
| Column | Type | Attributes |
|---|---|---|
| `id` | VARCHAR(255) | PRIMARY KEY |
| `meeting_id` | VARCHAR(255) | FOREIGN KEY (references `meetings.id` ON DELETE CASCADE) |
| `user_id` | VARCHAR(255) | FOREIGN KEY (references `users.id` ON DELETE SET NULL) |
| `task` | TEXT | NOT NULL |
| `owner` | TEXT | Assigned user email or string |
| `due_date` | TEXT | Target completion date |
| `priority` | TEXT | `Low`, `Medium`, `High`, `Urgent` |
| `status` | TEXT | `Pending`, `In Progress`, `Completed`, `Blocked` |

---

### **Dashboard & Jobs**
- `GET /api/dashboard/stats` — Retrieve aggregated dashboard metrics, timeline charts, status distributions, decision categories & recent meetings
- `GET /api/jobs/:id` — Query background job queue execution status (`pending`, `processing`, `completed`, `failed`)

### **Authentication**
- `POST /api/auth/register` — Register a new user account & set HTTP-only cookie
- `POST /api/auth/login` — Authenticate user & receive HTTP-only cookie
- `POST /api/auth/logout` — Clear auth cookie
- `GET /api/auth/me` — Retrieve current authenticated user session
- `GET /api/auth/users` — Fetch registered user list for participant assignment

### **Meetings & Summaries**
- `GET /api/meetings` — Retrieve paginated meetings ordered by `created_at` descending (newest first)
- `POST /api/meetings` — Create new meeting & trigger async background job summarization
- `GET /api/meetings/:id` — Get meeting details, transcript, and full summary breakdown
- `PUT /api/meetings/:id` — Update existing meeting record
- `DELETE /api/meetings/:id` — Delete meeting record
- `PATCH /api/meetings/:id/publish` — Toggle public shareable access state & return encrypted token
- `GET /api/meetings/public/share/:token` — Unprotected public endpoint to view shared meeting notes via AES-256-GCM token

### **Action Items**
- `GET /api/action-items` — Retrieve action items (supports filtering by `status`, `priority`, `owner`, `meetingId`)
- `POST /api/action-items` — Create manual action item
- `PUT /api/action-items/:id` — Update status, assignee, priority, or due date
- `DELETE /api/action-items/:id` — Delete action item

---

## Assumptions Made

1. Users upload or paste meeting transcripts (TXT, DOCX, PDF, or raw text) for AI summarization.
2. AI summarization uses a resilient key rotation pipeline (Custom Key $\rightarrow$ Multi-Key Array $\rightarrow$ Primary Gemini LLM $\rightarrow$ Backup Gemini LLM $\rightarrow$ Text Heuristic fallback with Unanswered Questions extraction).
3. Registered user emails serve as primary identifier references when assigning action item owners across the platform.

---

## Features Completed

- [x] **TanStack Query Client Caching & Cross-Query Invalidation**: Integrated `@tanstack/react-query` v5 with custom `QueryProvider` (stale-time control, auto garbage collection, and automatic cross-query cache invalidations across meetings, action items, and dashboard stats).
- [x] **Zero-Stale Real-Time Fresh API Fetching**: Set `staleTime: 0` and `refetchOnMount: "always"` on action items & metrics queries to ensure every navigation and component mount fetches fresh live database records.
- [x] **Comprehensive Action Item Loaders & Visual Sync Badges**: Visual `Loader2` feedback across all action tracker interactions (table rows, mobile cards, status dropdowns, metric cards, and a header `"Syncing live API..."` badge during refetches).
- [x] **Full Mobile Modal Responsiveness**: Optimized `MeetingDetailModal`, `MeetingModal`, and `CreateActionItemModal` for small smartphone screens (`w-[95vw] sm:max-w-[750px]`, full-width stacked buttons, fluid responsive grid form fields).
- [x] **Context-Aware Dashboard Shareable Link Concealment**: Conceals the public share link box when opening detail modals from the main overview dashboard while preserving full share functionality in the All Meetings view.
- [x] **Public Encrypted Shareable Meeting Links**: Toggle public access for any meeting with AES-256-GCM token encryption (`GET /api/meetings/public/share/:token`) and public view page (`/share/[token]`) featuring slide-in loading animations and copy-to-clipboard functionality.
- [x] **Disabled Re-generation on Published Meetings**: Automatically disables the "Re-generate AI Notes" button when a meeting link is published to prevent accidental overwrite of shared notes.
- [x] **Modern UI Confirmation Delete Modals**: Custom dark/light mode alert dialog modals for deleting meetings & action items with title context, warning icons, and inline loading indicators.
- [x] **Dynamic Real-Time Action Tracker Metrics**: Re-fetches total, in-progress, blocked, and overdue metrics dynamically upon CRUD operations (status update, edit, creation, deletion) with dedicated inline card loading spinners (`Loader2`).
- [x] **Chronological Newest-First Ordering**: Meetings database queries and API results are strictly ordered by `createdAt` descending (newest created meeting appears first).
- [x] **125% Scaled Lucide Icon Standard**: Enhanced visual hierarchy across all dashboard cards, headers, tables, detail modals, and public share views with 125% larger, legible Lucide React icons.
- [x] **Interactive Recharts Visual Analytics**: Integrated 4 dynamic chart components (Area Chart for meeting velocity, Donut Chart for status, Bar Chart for priorities, Horizontal Bar Chart for decision categories).
- [x] **Tabbed Dashboard Navigation**: Radix Tabs interface separating high-level KPI overview & table from visual analytics charts.
- [x] **API Key Rotation & Retry Policy**: Built-in support for multiple API keys (`GEMINI_API_KEYS`) with automated retry loops across candidate keys.
- [x] **Dedicated Dashboard API Endpoint**: Backend `/api/dashboard/stats` calculates metrics (Total Meetings, Action Items, Open, Completed, Overdue, Blocked, Transcripts) & chart aggregation directly in database layer.
- [x] **Async Background Job Queue System**: In-memory `JobQueue` handles non-blocking AI summarization tasks with polling support (`GET /api/jobs/:id`).
- [x] **Unanswered Questions Handling**: Extracted and sanitized in AI summaries with fallback heuristic detection (`?`, `tbd`, `unresolved`, `open question`) and empty state icon UI in modal.
- [x] **Modular Prompt Architecture**: Isolated prompt construction into `src/utils/aiPrompts.ts` for clean reuse and maintainability.
- [x] **Configurable Rate Limiting**: Dynamic environment-driven rate limiters (`AUTH_RATE_LIMITER`, `AI_RATE_LIMITER`, `API_RATE_LIMITER`).
- [x] **Responsive Mobile Drawer & Mobile Card Views**: Collapsible mobile sidebar drawer and mobile card layouts for Meetings and Action Tracker tables.
- [x] **Smart Truncated Pagination (`1 ... N`)**: Touch-friendly pagination controls preventing button overflow on mobile screens.
- [x] **Harmonious Custom OKLCH Theme**: Indigo/violet theme tokens for subtle highlights working seamlessly in Light & Dark modes.
- [x] **Slack-Style @-Mention Participant Tagging**: Real-time Slack-style `@` mention popover menu with keyboard navigation (↑↓ Enter), duplicate user filtering, and clean comma formatting.
- [x] **Secure Authentication**: Complete signup and login flow with encrypted passwords and HTTP-only cookie session storage.
- [x] **Live Database Integration**: Fully decoupled mock data; all views query PostgreSQL via Drizzle ORM.
- [x] **Multi-Tier AI Meeting Summarization**: Automated key point, outcome, decision, unanswered question, and action item extraction using key rotation pipeline and heuristic fallback parsing.
- [x] **Participant Assignment**: Dynamic dropdown fetching registered application users for seamless task ownership.
- [x] **Action Item Management**: Dedicated dashboard view with status toggle, priority filtering, and meeting contextual links.

---

##  Features Not Completed

- [ ] **Duplicate Task Handling / Deduplication**: Detecting and preventing duplicate action item assignments for a user across multiple meetings or transcript summaries.
- [ ] **Instant Summary Preview on File/Text Upload**: Displaying an immediate AI summary preview directly upon uploading a transcript file or pasting text prior to final database submission.


##  Known Limitations

- **File Parsing Limits**: Document upload transcript extraction supports standard TXT, DOCX, and PDF text formats; scanned image PDFs requiring OCR are not supported.
- **LLM Quota Limits**: High volume concurrent meeting summarizations depend on provider API quota limits, gracefully backed up by secondary API key and text heuristic summarizer if quotas are exceeded.

---

## 🤖 AI Usage, Engineering Audit & Technical Decisions

### 1. AI Tools Used
- **Vercel AI SDK (`ai`, `@ai-sdk/google`)**: Core library for structured LLM response generation and JSON schema enforcement.
- **Google Gemini (`gemini-3.5-flash-lite`)**: Primary and secondary fallback LLM model for high-speed, cost-effective meeting transcript summarization.

---

### 2. How Each Tool Was Used
- **Vercel AI SDK**: Configured structured output schemas via Zod (`meetingSummarySchema`, `keyDecisionSchema`, `actionItemSchema`) to parse raw LLM output directly into TypeScript objects.
- **Google Gemini 3.5 Flash Lite**: Processes transcript inputs in `generateMeetingSummary()` to extract executive summaries, outcomes, unanswered questions, key decisions, and action items.
- **Modular Prompt Builder (`buildMeetingSummaryPrompt`)**: Formats language, summary length, and structured output guidelines in `src/utils/aiPrompts.ts`.

---

### 3. Important Prompts
Below is the system prompt enforced during meeting transcript processing:

```text
You are an expert AI executive assistant. Analyze the following meeting transcript and generate a structured summary.

Meeting Title: {title}
{languageInstruction}
{lengthInstruction}
Transcript:
"""
{plainTranscript}
"""

Ensure the summary strictly covers:
1. Purpose of the meeting
2. Important discussion points
3. Major outcomes
4. Important concerns
5. Next steps
6. Key Decisions Made (Categorize into e.g., Technology/Platform, Feature Approval/Rejection, Timeline Agreed, Scope Change, Budget/Staffing, Responsibility Assigned, General Decision). 
7. Action Items Extracted:
   - task: Clear action task description in simple plain text.
   - owner: Assignee name or 'Unassigned' if missing.
   - dueDate: Due date (YYYY-MM-DD or relative like 'Next Friday') or 'Not specified' if missing.
   - priority: Priority level ('Low', 'Medium', 'High', 'Urgent').
   - status: Current status ('Pending', 'In Progress', 'Completed').

CRITICAL RULES:
- The input transcript may contain raw text. All outputs MUST BE in plain text ONLY. DO NOT include any HTML elements (like <div>, <p>, <strong>, <span>) or markdown containers.
- If NO clear decision was made, return an empty array [] for keyDecisions. DO NOT invent decisions.
- Handle missing action item details sensibly (Owner='Unassigned', DueDate='Not specified'). DO NOT invent ungrounded details.
```

---

### 4. Where AI-Generated Code or Advice Was Incorrect
1. **Implicit `any` Recursive Initializer Error (TS7022)**:
   - *Issue*: AI-generated arrow function variables (`export const generateFallbackSummary = (...) => ...`) caused TypeScript circular type inference errors when referenced recursively or within sibling functions.
   - *Resolution*: Converted arrow functions into standard hoisted `function` declarations with explicit return types (`export function generateFallbackSummary(...): MeetingSummary`).
2. **Vercel AI SDK Gateway Extra Argument Mismatch**:
   - *Issue*: Passing a secondary options object to `gateway()` caused TypeScript parameter count overload errors.
   - *Resolution*: Corrected `gateway` signature call to pass only the single model string parameter and migrated fallback to `@ai-sdk/google` instance fallback key (`GEMINI_FALL_BACK_KEY`).

---

### 5. What Was Changed Manually
- **Multi-Tier Fallback Pipeline**: Built explicit fallback routing (Primary Gemini $\rightarrow$ Fallback Gemini Key $\rightarrow$ Heuristic Text Engine) in `aiService.ts`.
- **Modular Prompt Extraction**: Refactored prompt logic out of service files into `src/utils/aiPrompts.ts`.
- **Configurable Rate Limiting**: Added `AUTH_RATE_LIMITER`, `AI_RATE_LIMITER`, and `API_RATE_LIMITER` numeric environment variables in `config.ts` and `rateLimiter.ts`.
- **Unanswered Questions UI**: Added `unansweredQuestions` parsing, sanitization, heuristic extraction, and empty state rendering in `MeetingDetailModal.tsx`.

---

### 6. How Generated Output Was Validated
- **Static Type Safety**: Executed `npx tsc --noEmit` across Backend and Frontend workspaces to ensure zero compilation or type errors.
- **Runtime Error Logs**: Monitored backend console output during live API payload execution.
- **Schema Validation**: Ensured LLM responses adhere strictly to Zod schemas matching Neon PostgreSQL Drizzle ORM column specifications.

---

### 7. Engineering Decisions Made Independently
- **3-Tier Resilient AI Architecture**: Implemented automatic fallback to secondary LLM key and text heuristics so meeting creation never crashes if AI quotas are exceeded or network connectivity drops.
- **HTTP-Only Cookie Authentication**: Chose secure `auth_token` HTTP-only cookies over `localStorage` to defend against XSS attacks.
- **Decoupled Utility Layer**: Isolated AI prompts into `aiPrompts.ts` and rate limiters into `rateLimiter.ts` to keep services clean and maintainable.

