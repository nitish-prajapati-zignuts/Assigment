import { pgTable, text, timestamp, varchar, jsonb, index, uniqueIndex, boolean } from "drizzle-orm/pg-core";

export type SummaryLength = "Short" | "Medium" | "Long";
export type SummaryTemplate = "Standard" | "Executive" | "Developer" | "Technical" | "Sales";

export interface KeyDecision {
  category: string;
  decision: string;
  context?: string;
}

export interface ActionItem {
  task: string;
  owner: string;
  dueDate: string;
  priority: "Low" | "Medium" | "High" | "Urgent";
  status: "Open" | "In Progress" | "Blocked" | "Completed" | "Pending";
}

export interface SpeakerAnalytics {
  name: string;
  talkTimePercentage: number;
  wordCount: number;
}

export interface SentimentAnalysis {
  overallTone: "Positive" | "Neutral" | "Concerned" | "Heated";
  score: number;
  breakdown: {
    positive: number;
    neutral: number;
    concerned: number;
    heated: number;
  };
}

export interface ExecutiveSummaryDetails {
  strategicImpact: string;
  financialOrTimelineRisks: string[];
  executiveRecommendations: string[];
}

export interface DeveloperTaskDetails {
  codeDeliverables: string[];
  architecturalChanges: string[];
  apiContractsAndDependencies: string[];
  technicalBlockers: string[];
}

export interface TechnicalDecisionDetails {
  systemArchitectureChoices: string[];
  techStackTradeoffs: string[];
  engineeringConstraints: string[];
}

export interface SalesQualificationDetails {
  clientPainPoints: string[];
  budgetAndAuthority: string;
  timelineExpectations: string;
  nextSalesSteps: string[];
}

export interface MeetingSummary {
  purpose: string;
  discussionPoints: string[];
  majorOutcomes: string[];
  importantConcerns: string[];
  unansweredQuestions?: string[];
  nextSteps: string[];
  keyDecisions?: KeyDecision[];
  actionItems?: ActionItem[];
  speakerAnalytics?: SpeakerAnalytics[];
  sentimentAnalysis?: SentimentAnalysis;
  templateStyle?: SummaryTemplate;
  executiveDetails?: ExecutiveSummaryDetails;
  developerDetails?: DeveloperTaskDetails;
  technicalDetails?: TechnicalDecisionDetails;
  salesDetails?: SalesQualificationDetails;
}

/**
 * Users Table
 * Stores user account information with authentication details
 */
export const users = pgTable(
  "users",
  {
    id: varchar("id", { length: 255 }).primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    password: text("password").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    uniqueIndex("users_email_idx").on(table.email),
    index("users_created_at_idx").on(table.createdAt),
  ]
);

/**
 * Meetings Table
 * Stores meeting records with transcripts, participants, and AI-generated summaries
 */
export const meetings = pgTable(
  "meetings",
  {
    id: varchar("id", { length: 255 }).primaryKey(),
    title: text("title").notNull(),
    date: text("date").notNull(),
    type: text("type").notNull().default("meeting"),
    participants: jsonb("participants").$type<string[]>().notNull(),
    transcript: text("transcript").default(""),
    summary: jsonb("summary").$type<MeetingSummary>(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
    isMeetingPublished: boolean("is_meeting_published").notNull().default(false),

  },
  (table) => [
    index("meetings_date_idx").on(table.date),
    index("meetings_type_idx").on(table.type),
    index("meetings_created_at_idx").on(table.createdAt),
    // For searching by participant email (used with CONTAINS operator)
    index("meetings_participants_idx").on(table.participants),
  ]
);

/**
 * Action Items Table
 * Stores tasks extracted from meetings with ownership, priority, and status tracking
 */
export const actionItems = pgTable(
  "action_items",
  {
    id: varchar("id", { length: 255 }).primaryKey(),
    meetingId: varchar("meeting_id", { length: 255 })
      .notNull()
      .references(() => meetings.id, { onDelete: "cascade" }),
    userId: varchar("user_id", { length: 255 }).references(() => users.id, {
      onDelete: "set null",
    }),
    task: text("task").notNull(),
    owner: text("owner").default("Unassigned"),
    dueDate: text("due_date").default("Not specified"),
    priority: text("priority").default("Medium"),
    status: text("status").default("Pending"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("action_items_meeting_id_idx").on(table.meetingId),
    index("action_items_user_id_idx").on(table.userId),
    index("action_items_owner_idx").on(table.owner),
    index("action_items_status_idx").on(table.status),
    index("action_items_priority_idx").on(table.priority),
    index("action_items_due_date_idx").on(table.dueDate),
    index("action_items_created_at_idx").on(table.createdAt),
    // Composite index for common queries (meeting + status)
    index("action_items_meeting_status_idx").on(table.meetingId, table.status),
    // Composite index for common queries (owner + status)
    index("action_items_owner_status_idx").on(table.owner, table.status),
  ]
);

// Type exports for TypeScript inference
export type UserRecord = typeof users.$inferSelect;
export type NewUserRecord = typeof users.$inferInsert;

export type MeetingRecord = typeof meetings.$inferSelect;
export type NewMeetingRecord = typeof meetings.$inferInsert;

export type ActionItemRecord = typeof actionItems.$inferSelect;
export type NewActionItemRecord = typeof actionItems.$inferInsert;
