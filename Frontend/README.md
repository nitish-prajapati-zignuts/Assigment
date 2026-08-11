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

1. **Public Encrypted Shareable Meeting Page (`/share/[token]`)**:
   - Secure encrypted token resolution using AES-256-GCM without requiring login.
   - Smooth left-to-right message slide animations and animated gradient progress bar during loading state.
2. **Disabled Re-generation on Published Meetings**:
   - Disables the "Re-generate AI Notes" button in `MeetingDetailModal` when published with a helpful tooltip to protect public notes.
3. **Modern Delete Confirmation Modals**:
   - Replaced browser `confirm()` with custom Shadcn/Radix alert dialog modals featuring item titles, warning indicators, and inline deletion spinners.
4. **Dynamic Action Tracker Metrics & Loading States**:
   - Automatically recalculates and re-fetches total, in-progress, blocked, and overdue metrics during task CRUD operations with dedicated inline card loading spinners (`Loader2`).
5. **125% Scaled Icon Design Hierarchy**:
   - Scaled Lucide React icons by 125% across dashboard cards, header actions, data tables, detail modals, and share views for optimal readability.
6. **Tabbed Dashboard Interface (`Overview` vs `Analytics`)**:
   - Uses Radix Tabs to separate core KPI metrics & recent meetings from visual analytics charts into dedicated views.
7. **Interactive Visual Analytics Charts (`AnalyticsCharts.tsx`)**:
   - **Meeting Velocity & Transcripts**: Dual Area Chart tracking meeting volume and transcript frequency over time.
   - **Task Status Distribution**: Donut chart visualizing task status completion ratios.
   - **Task Priority Breakdown**: Bar chart showing tasks grouped by urgency (`Urgent`, `High`, `Medium`, `Low`).
   - **Key Decisions Breakdown**: Horizontal bar chart mapping decision categories (`Technology/Platform`, `Timeline Agreed`, `Scope Change`, etc.).
8. **Collapsible Mobile Drawer Sidebar**:
   - Slide-over drawer menu on mobile viewports (`< lg`) with top header bar & backdrop overlay.
9. **Responsive Card Views for Tables**:
   - Converts wide tabular data on Meetings and Action Tracker pages into mobile-friendly stacked cards.
10. **Smart Truncated Pagination (`1 ... N`)**:
    - Compact pagination bar preventing button overflow on touch devices.
11. **Real-time Async Job Processing & Summarizing Loader**:
    - Shows an active `Summarizing...` badge while background AI tasks run.
12. **Slack-Style `@` Mention Autocomplete**:
    - Typing `@` in participant input field opens a search menu of registered users with keyboard navigation (`ArrowUp`/`ArrowDown`/`Enter`).
13. **Harmonious Custom OKLCH Theme**:
    - Curated indigo/violet accent theme tokens integrated seamlessly across Light & Dark modes.

