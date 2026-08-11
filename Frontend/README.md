# AI-Powered Meeting Notes - Frontend

This is the Next.js frontend client for the **AI-Powered Meeting Notes & Action Item Summarizer** application.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 16 (App Router) & React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4, Modern OKLCH color theme, responsive mobile-first UI layout
- **Visual Data Charts**: `recharts` for dynamic data visualizations (Area, Bar, Donut, and Horizontal charts)
- **Forms & Validation**: React Hook Form with Zod validation (`@hookform/resolvers/zod`)
- **HTTP Client**: Axios configured with `withCredentials: true`
- **Icons & Theme**: Lucide React icons, Radix UI primitives (`@radix-ui/react-tabs`), `next-themes` (Dark/Light mode support)

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

1. **Tabbed Dashboard Interface (`Overview` vs `Analytics`)**:
   - Uses Radix Tabs to separate core KPI metrics & recent meetings from visual analytics charts into dedicated views.
2. **Interactive Visual Analytics Charts (`AnalyticsCharts.tsx`)**:
   - **Meeting Velocity & Transcripts**: Dual Area Chart tracking meeting volume and transcript frequency over time.
   - **Task Status Distribution**: Donut chart visualizing task status completion ratios.
   - **Task Priority Breakdown**: Bar chart showing tasks grouped by urgency (`Urgent`, `High`, `Medium`, `Low`).
   - **Key Decisions Breakdown**: Horizontal bar chart mapping decision categories (`Technology/Platform`, `Timeline Agreed`, `Scope Change`, etc.).
3. **Collapsible Mobile Drawer Sidebar**:
   - Slide-over drawer menu on mobile viewports (`< lg`) with top header bar & backdrop overlay.
   - Remains persistent and open on desktop screens (`≥ lg`).
4. **Responsive Card Views for Tables**:
   - Converts wide tabular data on Meetings and Action Tracker pages into mobile-friendly stacked cards.
5. **Smart Truncated Pagination (`1 ... N`)**:
   - Compact pagination bar (`1 ... [prev] [current] [next] ... [totalPages]`) prevents page button overflow on touch devices.
6. **Real-time Async Job Processing & Summarizing Loader**:
   - Shows an active `Summarizing...` badge while background AI tasks run.
   - Displays in-modal loading states and automatically syncs completed summaries into the open view modal.
7. **Slack-Style `@` Mention Autocomplete**:
   - Typing `@` in participant input field opens a search menu of registered users with keyboard navigation (`ArrowUp`/`ArrowDown`/`Enter`).
8. **Harmonious Custom OKLCH Theme**:
   - Curated indigo/violet accent theme tokens integrated seamlessly across Light & Dark modes.

