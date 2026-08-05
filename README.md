# AI-Powered Meeting Notes & Action Item Summarizer

A full-stack, enterprise-grade web application designed to capture, structure, summarize, and extract actionable insight from meeting transcripts using AI.

---

## 📌 Project Overview

The **AI Meeting Notes Summarizer** streamlines post-meeting workflows by transforming unstructured meeting transcripts or audio/text summaries into structured intelligence. It automatically generates key discussion points, key decisions, major outcomes, concerns, next steps, and granular action items assigned to users with priority and due dates.

---

## 🛠️ Technology Stack

### **Frontend**
- **Framework**: Next.js 16 (App Router) & React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4, Modern UI/UX layout
- **Typography**: Plus Jakarta Sans (`next/font/google`)
- **HTTP Client**: Axios (configured with `withCredentials: true` for HTTP-only cookie authentication)
- **Icons & Components**: Lucide React, Radix UI primitives, Base UI, TinyMCE Editor

### **Backend**
- **Runtime**: Node.js & Express
- **Language**: TypeScript
- **Database & ORM**: PostgreSQL (Neon Serverless) managed with Drizzle ORM & Drizzle Kit
- **AI Integration**: Vercel AI SDK (`@ai-sdk/google`) powered by Google Gemini Models (`gemini-1.5-flash`)
- **Authentication**: JWT (JSON Web Tokens) stored securely in HTTP-only HTTP cookies (`auth_token`) and `bcryptjs` password hashing

---

## ⚙️ Setup Instructions

### **Prerequisites**
- Node.js (v18 or higher)
- npm or yarn package manager
- PostgreSQL Database URL (Neon DB instance recommended)
- Google Gemini API Key

---

### **1. Clone & Set Up Backend**

```bash
cd Backend
npm install
```

Create a `.env` file inside the `Backend/` directory:

```env
PORT=5000
DATABASE_URL=postgresql://<user>:<password>@<host>/<dbname>?sslmode=require
JWT_SECRET=your_jwt_secret_key_here
GOOGLE_GENERATIVE_AI_API_KEY=your_google_gemini_api_key
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
The server will start at `http://localhost:5000`.

---

### **2. Set Up Frontend**

```bash
cd Frontend
npm install
```

Create a `.env.local` file inside the `Frontend/` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
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
| `PORT` | Backend server port (Default: `5000`) | Backend `.env` |
| `DATABASE_URL` | PostgreSQL connection string | Backend `.env` |
| `JWT_SECRET` | Secret key used for signing authentication JWT tokens | Backend `.env` |
| `GOOGLE_GENERATIVE_AI_API_KEY` | API Key for Vercel AI SDK / Google Gemini model | Backend `.env` |
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
│                    Express Backend (5000)                   │
│  - Controllers & Routes (Auth, Meetings, Action Items, AI)  │
│  - JWT Verification Middleware                              │
│  - Vercel AI SDK Integration (Gemini 1.5)                   │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
               ▼                              ▼
┌──────────────────────────────┐┌─────────────────────────────┐
│    PostgreSQL (Neon DB)      ││     Google Gemini AI        │
│  - Drizzle ORM Schema        ││  - Structured Output Parsing│
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

##  API Overview

### **Authentication**
- `POST /api/auth/register` — Register a new user account & set HTTP-only cookie
- `POST /api/auth/login` — Authenticate user & receive HTTP-only cookie
- `POST /api/auth/logout` — Clear auth cookie
- `GET /api/auth/me` — Retrieve current authenticated user session
- `GET /api/auth/users` — Fetch registered user list for participant assignment

### **Meetings & Summaries**
- `GET /api/meetings` — Retrieve all meetings
- `POST /api/meetings` — Create new meeting & trigger automated Gemini AI summarization
- `GET /api/meetings/:id` — Get meeting details, transcript, and full summary breakdown
- `DELETE /api/meetings/:id` — Delete meeting record

### **Action Items**
- `GET /api/action-items` — Retrieve action items (supports filtering by `meetingId` or `status`)
- `POST /api/action-items` — Create manual action item
- `PATCH /api/action-items/:id` — Update status, assignee, priority, or due date

---

##  Assumptions Made

1. Users upload or paste meeting transcripts (TXT, DOCX, PDF, or raw text) for AI summarization.
2. AI summarization relies on Google Gemini (`gemini-1.5-flash`) via the Vercel AI SDK returning structured JSON format matching the meeting summary interface.
3. Registered user emails serve as primary identifier references when assigning action item owners across the platform.

---

##  Features Completed

- [x] **Secure Authentication**: Complete signup and login flow with encrypted passwords and HTTP-only cookie session storage.
- [x] **Live Database Integration**: Fully decoupled mock data; all views query PostgreSQL via Drizzle ORM.
- [x] **AI-Powered Meeting Processing**: Automated key point, outcome, decision, and action item generation using Google Gemini.
- [x] **Participant Assignment**: Dynamic dropdown fetching registered application users for seamless task ownership.
- [x] **Action Item Management**: Dedicated dashboard view with status toggle, priority filtering, and meeting contextual links.
- [x] **Modern UI/UX Refinement**: High-contrast, clean typography powered by Plus Jakarta Sans font and customized Tailwind components.

---

##  Features Not Completed

- [ ] **Real-time Audio/Video Transcription**: Live speech-to-text recording directly in the browser during an ongoing meeting.
- [ ] **Third-party Calendar Integration**: Syncing meetings directly with Google Calendar or Microsoft Outlook.
- [ ] **Email Notifications**: Automated notification emails sent to assignees when an action item is created or updated.

---

##  Known Limitations

- **File Parsing Limits**: Document upload transcript extraction supports standard TXT, DOCX, and PDF text formats; scanned image PDFs requiring OCR are not supported.
- **LLM Rate Limits**: High volume concurrent meeting summarizations depend on Google Gemini API quota limits.

---

##  Future Improvements

- **WebSockets / Real-time Collaboration**: Enable live concurrent updates for action items when multiple team members view the dashboard.
- **Advanced Analytics**: Interactive charts showing action item completion rates per team member and meeting frequency trends.
- **Export Capabilities**: Export structured meeting notes and action items to Markdown, PDF, Slack, or Jira.
