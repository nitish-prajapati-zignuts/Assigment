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
4. **Full Mobile Modal Responsiveness**:
   - Optimized `MeetingDetailModal`, `MeetingModal`, and `CreateActionItemModal` for small smartphone screens (`w-[95vw] sm:max-w-[750px]`, full-width stacked buttons, fluid responsive grid form fields).
5. **Context-Aware Dashboard Share Link Concealment**:
   - Conceals the public share link section when opening detail modals from the main overview dashboard while preserving full share functionality in the All Meetings view.
6. **Public Encrypted Shareable Meeting Page (`/share/[token]`)**:
   - Secure encrypted token resolution using AES-256-GCM without requiring login.
   - Smooth left-to-right message slide animations and animated gradient progress bar during loading state.
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

