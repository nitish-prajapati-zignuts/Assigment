# AI-Powered Meeting Notes - Frontend

This is the Next.js frontend client for the **AI-Powered Meeting Notes & Action Item Summarizer** application.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 16 (App Router) & React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4, Modern UI/UX layout with glassmorphic cards and ambient light effects
- **Forms & Validation**: React Hook Form with Zod validation (`@hookform/resolvers/zod`)
- **HTTP Client**: Axios configured with `withCredentials: true`
- **Icons & Theme**: Lucide React icons, `next-themes` (Dark/Light mode support)

---

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the `Frontend/` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔐 Key Features & Workflows

1. **Root Path (`/`)**: Automatically redirects to `/login`.
2. **Login Page (`/login`)**:
   - On page load, executes an asynchronous authentication check calling `GET /auth/me` on the backend.
   - Automatically redirects authenticated users to `/dashboard`.
   - Clears stale token state if authentication check fails.
   - Enforces React Rules of Hooks with top-level hook declarations.
3. **Register Page (`/register`)**:
   - Redirects to `/dashboard` if an active session token is present.
4. **Protected Dashboard (`/dashboard/*`)**:
   - Protected layout validating session state. Unauthenticated requests are redirected to `/login`.
   - Employs browser `popstate` history lock (`window.history.pushState`) to prevent logged-in users from navigating back to login/public pages.
5. **Slack-Style `@` Mention Tagging**:
   - Typing `@` in the Participants input field triggers a real-time autocomplete popover menu of registered application users.
   - Supports keyboard navigation (↑↓ and Enter/Tab to select).
   - Automatically excludes users already added to avoid duplicate selections.
   - Formats participants with comma separation without trailing commas.
6. **Multi-Language AI Summary Output**:
   - Allows users to select from 10 supported output languages (English, Spanish, French, German, Hindi, Japanese, Chinese, Portuguese, Italian, Dutch).
