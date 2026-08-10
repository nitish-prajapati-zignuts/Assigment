# AI-Powered Meeting Notes - Frontend

This is the Next.js frontend client for the **AI-Powered Meeting Notes & Action Item Summarizer** application.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 16 (App Router) & React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4, Modern OKLCH color theme, responsive mobile-first UI layout
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

## 🔐 Key Features & UI Enhancements

1. **Collapsible Mobile Drawer Sidebar**:
   - Slide-over drawer menu on mobile viewports (`< lg`) with top header bar & backdrop overlay.
   - Remains persistent and open on desktop screens (`≥ lg`).
2. **Responsive Card Views for Tables**:
   - Converts wide tabular data on Meetings and Action Tracker pages into mobile-friendly stacked cards.
3. **Smart Truncated Pagination (`1 ... N`)**:
   - Compact pagination bar (`1 ... [prev] [current] [next] ... [totalPages]`) prevents page button overflow on touch devices.
4. **Real-time Async Job Processing & Summarizing Loader**:
   - Shows an active `Summarizing...` badge while background AI tasks run.
   - Displays in-modal loading states and automatically syncs completed summaries into the open view modal.
5. **Slack-Style `@` Mention Autocomplete**:
   - Typing `@` in participant input field opens a search menu of registered users with keyboard navigation (`ArrowUp`/`ArrowDown`/`Enter`).
6. **Harmonious Custom OKLCH Theme**:
   - Curated indigo/violet accent theme tokens integrated seamlessly across Light & Dark modes.

