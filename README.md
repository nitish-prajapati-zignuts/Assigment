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
- **Styling**: Tailwind CSS v4, Modern UI/UX layout with glassmorphic cards and ambient lighting effects
- **Typography**: Plus Jakarta Sans (`next/font/google`)
- **HTTP Client**: Axios (configured with `withCredentials: true` for HTTP-only cookie authentication)
- **Icons & Components**: Lucide React, Radix UI primitives, Base UI, TinyMCE Editor

### **Backend**
- **Runtime**: Node.js & Express
- **Language**: TypeScript
- **Database & ORM**: PostgreSQL (Neon Serverless) managed with Drizzle ORM & Drizzle Kit
- **AI Integration**: Vercel AI SDK (`ai`, `@ai-sdk/google`, `@ai-sdk/openai`) powered by a multi-tiered pipeline:
  1. **Primary Model**: Google Gemini (`gemini-3.5-flash`)
  2. **Fallback Model**: OpenAI (`gpt-4o-mini`)
  3. **Last Resort**: Structured Heuristic Text Parser
- **Authentication**: JWT (JSON Web Tokens) stored securely in HTTP-only cookies (`auth_token`) and `bcryptjs` password hashing

---

## ⚙️ Setup Instructions

### **Prerequisites**
- Node.js (v18 or higher)
- npm or yarn package manager
- PostgreSQL Database URL (Neon DB instance recommended)
- Google Gemini API Key and OpenAI API Key

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
GOOGLE_GENERATIVE_AI_API_KEY=your_google_gemini_api_key
OPENAI_API_KEY=your_openai_api_key_optional
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
| `GOOGLE_GENERATIVE_AI_API_KEY` | Primary API Key for Google Gemini model | Backend `.env` |
| `OPENAI_API_KEY` | Fallback API Key for OpenAI model | Backend `.env` |
| `NODE_ENV` | Development or Production environment state | Backend `.env` |
| `NEXT_PUBLIC_API_URL` | Base URL of the Express backend API | Frontend `.env.local` |

---

## 🏗️ Architecture Overview

The system follows a modern decoupled client-server architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Frontend (3000)                  │
│  - User Auth (Login/Register)                               │
│  - Responsive Dashboard & Analytics                         │
│  - Meeting Management & File Transcript Upload               │
│  - Action Item Tracker & Priority Filter                    │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP Requests (with HTTP-only Cookies)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    Express Backend (4000)                   │
│  - Controllers & Routes (Auth, Meetings, Action Items, AI)  │
│  - JWT Verification Middleware                              │
│  - Multi-tier Vercel AI SDK Integration                     │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
               ▼                              ▼
┌──────────────────────────────┐┌─────────────────────────────┐
│    PostgreSQL (Neon DB)      ││     Multi-Tier AI Pipeline  │
│  - Drizzle ORM Schema        ││  - Primary: Google Gemini   │
│                              ││  - Fallback: OpenAI GPT     │
│                              ││  - Resilient Text Heuristics│
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
| `summary` | JSONB | Structured JSON (Purposes, Outcomes, Next Steps, Key Decisions) |
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
- `GET /api/dashboard/stats` — Retrieve aggregated dashboard metrics & recent meetings
- `GET /api/jobs/:id` — Query background job queue execution status (`pending`, `processing`, `completed`, `failed`)

### **Authentication**
- `POST /api/auth/register` — Register a new user account & set HTTP-only cookie
- `POST /api/auth/login` — Authenticate user & receive HTTP-only cookie
- `POST /api/auth/logout` — Clear auth cookie
- `GET /api/auth/me` — Retrieve current authenticated user session
- `GET /api/auth/users` — Fetch registered user list for participant assignment

### **Meetings & Summaries**
- `GET /api/meetings` — Retrieve paginated meetings
- `POST /api/meetings` — Create new meeting & trigger async background job summarization
- `GET /api/meetings/:id` — Get meeting details, transcript, and full summary breakdown
- `PUT /api/meetings/:id` — Update existing meeting record
- `DELETE /api/meetings/:id` — Delete meeting record

### **Action Items**
- `GET /api/action-items` — Retrieve action items (supports filtering by `status`, `priority`, `owner`, `meetingId`)
- `POST /api/action-items` — Create manual action item
- `PUT /api/action-items/:id` — Update status, assignee, priority, or due date
- `DELETE /api/action-items/:id` — Delete action item

---

## Assumptions Made

1. Users upload or paste meeting transcripts (TXT, DOCX, PDF, or raw text) for AI summarization.
2. AI summarization uses a resilient 3-tier strategy (Primary Gemini LLM $\rightarrow$ Secondary OpenAI LLM $\rightarrow$ Text Heuristic fallback) returning clean, structured JSON format matching the meeting summary interface.
3. Registered user emails serve as primary identifier references when assigning action item owners across the platform.

---

## Features Completed

- [x] **Dedicated Dashboard API Endpoint**: Backend `/api/dashboard/stats` calculates metrics (Total Meetings, Action Items, Open, Completed, Overdue, Blocked, Transcripts) directly in database layer.
- [x] **Async Background Job Queue System**: In-memory `JobQueue` handles non-blocking AI summarization tasks with polling support (`GET /api/jobs/:id`).
- [x] **Responsive Mobile Drawer & Mobile Card Views**: Collapsible mobile sidebar drawer and mobile card layouts for Meetings and Action Tracker tables.
- [x] **Smart Truncated Pagination (`1 ... N`)**: Touch-friendly pagination controls preventing button overflow on mobile screens.
- [x] **Harmonious Custom OKLCH Theme**: Indigo/violet theme tokens for subtle highlights working seamlessly in Light & Dark modes.
- [x] **Slack-Style @-Mention Participant Tagging**: Real-time Slack-style `@` mention popover menu with keyboard navigation (↑↓ Enter), duplicate user filtering, and clean comma formatting.
- [x] **Secure Authentication**: Complete signup and login flow with encrypted passwords and HTTP-only cookie session storage.
- [x] **Live Database Integration**: Fully decoupled mock data; all views query PostgreSQL via Drizzle ORM.
- [x] **Multi-Tier AI Meeting Summarization**: Automated key point, outcome, decision, and action item extraction using Google Gemini primary model, OpenAI fallback model, and heuristic fallback parsing.
- [x] **Participant Assignment**: Dynamic dropdown fetching registered application users for seamless task ownership.
- [x] **Action Item Management**: Dedicated dashboard view with status toggle, priority filtering, and meeting contextual links.

---

##  Features Not Completed

- [ ] **Duplicate Task Handling / Deduplication**: Detecting and preventing duplicate action item assignments for a user across multiple meetings or transcript summaries.
- [ ] **Instant Summary Preview on File/Text Upload**: Displaying an immediate AI summary preview directly upon uploading a transcript file or pasting text prior to final database submission.


##  Known Limitations

- **File Parsing Limits**: Document upload transcript extraction supports standard TXT, DOCX, and PDF text formats; scanned image PDFs requiring OCR are not supported.
- **LLM Quota Limits**: High volume concurrent meeting summarizations depend on provider API quota limits, gracefully backed up by the text heuristic summarizer if quotas are exceeded.

---

## 🤖 AI Usage, Engineering Audit & Technical Decisions

### 1. AI Tools Used
- **Vercel AI SDK (`ai`, `@ai-sdk/google`, `@ai-sdk/openai`)**: Core library for structured LLM response generation and JSON schema enforcement.
- **Google Gemini (`gemini-3.5-flash`)**: Primary LLM model for high-speed, cost-effective meeting transcript summarization.
- **OpenAI (`gpt-4o-mini`)**: Secondary fallback LLM model for zero-downtime reliability.

---

### 2. How Each Tool Was Used
- **Vercel AI SDK**: Configured structured output schemas via Zod (`meetingSummarySchema`, `keyDecisionSchema`, `actionItemSchema`) to parse raw LLM output directly into TypeScript objects.
- **Google Gemini 3.5 Flash**: Processes transcript inputs in `generateMeetingSummary()` to extract executive summaries, outcomes, key decisions, and action items.
- **OpenAI GPT-4o-mini**: Serves as a secondary fallback model invoked automatically if the primary Gemini model fails or lacks API credentials.

---

### 3. Important Prompts
Below is the system prompt enforced during meeting transcript processing:

```text
You are an expert AI executive assistant. Analyze the following meeting transcript and generate a structured summary.

Meeting Title: {title}
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
2. **Zod Optional Field Mismatch with OpenAI Structured Outputs**:
   - *Issue*: OpenAI's strict JSON schema mode rejected schemas with optional fields (`context?: string`) lacking explicit required declarations.
   - *Resolution*: Adjusted schema definitions and fallback default logic in `cleanSummary()`.

---

### 5. What Was Changed Manually
- **Multi-Tier Fallback Pipeline**: Built explicit fallback routing (Gemini LLM $\rightarrow$ OpenAI LLM $\rightarrow$ Heuristic Text Engine) in `aiService.ts`.
- **Sanitization Layer**: Authored `stripHtml()` regex sanitizer and `cleanSummary()` normalizer to enforce HTML-free output.
- **Frontend Refinement**: Designed glassmorphic cards, ambient lighting background gradients, and input field states for Next.js Login and Register pages.
- **Environment & Routing Alignment**: Aligned port definitions (`PORT=4000`) and CORS credentials headers across client and server.

---

### 6. How Generated Output Was Validated
- **Static Type Safety**: Executed `npx tsc --noEmit` across Backend and Frontend workspaces to ensure zero compilation or type errors.
- **Runtime Error Logs**: Monitored `nodemon` backend console output during live API payload execution.
- **Schema Validation**: Ensured LLM responses adhere strictly to Zod schemas matching Neon PostgreSQL Drizzle ORM column specifications.

---

### 7. Engineering Decisions Made Independently
- **3-Tier Resilient AI Architecture**: Implemented automatic fallback to secondary LLM and text heuristics so meeting creation never crashes if AI quotas are exceeded or network connectivity drops.
- **HTTP-Only Cookie Authentication**: Chose secure `auth_token` HTTP-only cookies over `localStorage` to defend against XSS attacks.
- **Decoupled Service Layer**: Isolated AI processing into `aiService.ts` to keep Express controllers clean and testable.

---

### 8. Security, Quality & Architecture Concerns Identified
- **XSS / HTML Injection Vulnerability**: Raw meeting transcripts may contain malicious HTML script tags; neutralized via regex stripping (`stripHtml`).
- **Quota & Cost Management**: Unrestricted public access to AI endpoints could cause quota exhaustion; mitigated by API key checks and heuristic fallback.
- **Type Safety & Maintainability**: Eliminated implicit `any` types and forced explicit return type annotations across all services.

