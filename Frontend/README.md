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

1. **TanStack Query v5 Integration (`@tanstack/react-query`)**:
   - Centralized `QueryProvider` handling client-side state caching, garbage collection, and query key management (`["meetings"]`, `["actionItems"]`, `["dashboardStats"]`).
   - Cross-query cache invalidation automatically purges stale records whenever meetings or action items are created, edited, deleted, or auto-summarized.
2. **Zero-Stale Real-Time Fresh Data Fetching**:
   - `staleTime: 0` and `refetchOnMount: "always"` on action items & metrics queries guarantee every navigation and table action fetches live API database records.
3. **Comprehensive Action Item Loaders & Live Sync Badges**:
   - Visual `Loader2` feedback across all table rows, mobile cards, status dropdowns, metric cards, and a top header `"Syncing live API..."` badge during background refetches.
4. **Sentiment & Speaker Analytics Widget**:
   - Visual progress bars displaying emotional tone breakdown (*Positive*, *Neutral*, *Concerned*, *Heated*) and speaker participation percentages.
5. **RAG Knowledge Assistant Chat widget**:
   - Interactive modal tab showing message flow with styled bot suggestions, gradient border details, and a collapsible source attribution accordion view to inspect matched transcript contexts.
6. **Custom AI Summary Template Selector**:
   - Integrated template selector dropdown (*Standard Briefing*, *Executive Summary*, *Developer Tasks*, *Technical Decisions*, *Sales Qualification*) in meeting creation modal and detail modal.
   - Renders custom themed detail cards for role-tailored AI output objects.
6. **Password Protected & Expiring Public Share Links (`/share/[token]`)**:
   - Encrypted Base64URL AES-256-GCM token resolution without requiring login.
   - **Password Access Modal**: Interactive password prompt view when accessing protected share links (`POST /api/meetings/public/share/:token/verify`).
   - **Expiration Notifications**: Automatic link expiration detection and expiry badge indicators (*1 Hour*, *1 Day*, *7 Days*, *30 Days*, *Never*).
7. **Full Mobile Modal Responsiveness**:
7. **Disabled Re-generation on Published Meetings**:
   - Disables the "Re-generate AI Notes" button in `MeetingDetailModal` when published with a helpful tooltip to protect public notes.
8. **Modern Delete Confirmation Modals**:
   - Replaced browser `confirm()` with custom Shadcn/Radix alert dialog modals featuring item titles, warning indicators, and inline deletion spinners.
9. **Dynamic Action Tracker Metrics & Loading States**:
   - Automatically recalculates and re-fetches total, in-progress, blocked, and overdue metrics during task CRUD operations with dedicated inline card loading spinners (`Loader2`).

10. **Tabbed Dashboard Interface (`Overview` vs `Analytics`)**:
    - Uses Radix Tabs to separate core KPI metrics & recent meetings from visual analytics charts into dedicated views.
11. **Interactive Visual Analytics Charts (`AnalyticsCharts.tsx`)**:
    - **Meeting Velocity & Transcripts**: Dual Area Chart tracking meeting volume and transcript frequency over time.
    - **Task Status Distribution**: Donut chart visualizing task status completion ratios.
    - **Task Priority Breakdown**: Bar chart showing tasks grouped by urgency (`Urgent`, `High`, `Medium`, `Low`).
    - **Key Decisions Breakdown**: Horizontal bar chart mapping decision categories (`Technology/Platform`, `Timeline Agreed`, `Scope Change`, etc.).
12. **Collapsible Mobile Drawer Sidebar**:
    - Slide-over drawer menu on mobile viewports (`< lg`) with top header bar & backdrop overlay.
13. **Responsive Card Views for Tables**:
    - Converts wide tabular data on Meetings and Action Tracker pages into mobile-friendly stacked cards.
14. **Smart Truncated Pagination (`1 ... N`)**:
    - Compact pagination bar preventing button overflow on touch devices.
15. **Slack-Style `@` Mention Autocomplete**:
    - Typing `@` in participant input field opens a search menu of registered users with keyboard navigation (`ArrowUp`/`ArrowDown`/`Enter`).
16. **Harmonious Custom OKLCH Theme**:
    - Curated indigo/violet accent theme tokens integrated seamlessly across Light & Dark modes.

