import { pgTable, text, timestamp, varchar, jsonb, index, uniqueIndex, boolean, integer } from "drizzle-orm/pg-core";
import { customType } from "drizzle-orm/pg-core";

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
    isDeleted: boolean().default(false)
  },
  (table) => [uniqueIndex("users_email_idx").on(table.email), index("users_created_at_idx").on(table.createdAt)]
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
    sharePassword: text("share_password"),
    shareExpiresAt: timestamp("share_expires_at", { withTimezone: true }),
    isDeleted: boolean("is_deleted").notNull().default(false),
    isDeletedAt: timestamp("is_deleted_at", { withTimezone: true }),
    isArchived: boolean("is_archived").notNull().default(false),
    isArchivedAt: timestamp("is_archived_at", { withTimezone: true }),
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
    isArchived: boolean("is_archived").notNull().default(false),
    isArchivedAt: timestamp("is_archived_at", { withTimezone: true }),
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

/**
 * User Settings Table
 * Stores user AI summarization rules, custom prompts, and notification preferences
 */
export const userSettings = pgTable("user_settings", {
  userId: varchar("user_id", { length: 255 })
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  summaryLength: text("summary_length").notNull().default("Medium"),
  template: text("template").notNull().default("Standard"),
  customPrompt: text("custom_prompt")
    .notNull()
    .default("Focus heavily on technical decisions, code deliverables, and explicit action item due dates."),
  autoExtractActionItems: boolean("auto_extract_action_items").notNull().default(true),
  emailNotifications: boolean("email_notifications").notNull().default(true),
  weeklyDigest: boolean("weekly_digest").notNull().default(false),
  slackWebhookUrl: text("slack_webhook_url").default(""),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export type UserSettingsRecord = typeof userSettings.$inferSelect;
export type NewUserSettingsRecord = typeof userSettings.$inferInsert;

/**
 * User Sessions Table
 * Tracks active user login sessions with IP address, device specs, browser user-agent, and timestamps
 */
export const userSessions = pgTable("user_sessions", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  ipAddress: text("ip_address").notNull().default("127.0.0.1"),
  device: text("device").notNull().default("Desktop"),
  browser: text("browser").notNull().default("Chrome"),
  os: text("os").notNull().default("Mac OS X"),
  location: text("location").default("Local Session"),
  isCurrent: boolean("is_current").notNull().default(true),
  lastActive: timestamp("last_active", { withTimezone: true }).defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export type UserSessionRecord = typeof userSessions.$inferSelect;
export type NewUserSessionRecord = typeof userSessions.$inferInsert;

/**
 * Notifications Table
 * Stores user notifications
 */
export const notifications = pgTable(
  "notifications",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    message: text("message").notNull(),
    type: text("type").notNull().default("general"),
    isRead: boolean("is_read").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("notifications_user_id_idx").on(table.userId),
    index("notifications_created_at_idx").on(table.createdAt),
  ]
);

export type NotificationRecord = typeof notifications.$inferSelect;
export type NewNotificationRecord = typeof notifications.$inferInsert;


const vector = customType<{ data: number[] }>({
  dataType() {
    return "vector(1536)";
  },
  toDriver(value: number[]): string {
    return JSON.stringify(value);
  },
  fromDriver(value: unknown): number[] {
    if (typeof value === "string") {
      return value
        .replace(/[\[\]]/g, "")
        .split(",")
        .map(Number);
    }
    return value as number[];
  },
});

/**
 * Meeting Chunks Table for pgvector RAG system
 */
export const meetingChunks = pgTable(
  "meeting_chunks",
  {
    id: varchar("id", { length: 255 }).primaryKey(),
    meetingId: varchar("meeting_id", { length: 255 })
      .notNull()
      .references(() => meetings.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    embedding: vector("embedding").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [index("meeting_chunks_meeting_id_idx").on(table.meetingId)]
);

export type MeetingChunkRecord = typeof meetingChunks.$inferSelect;
export type NewMeetingChunkRecord = typeof meetingChunks.$inferInsert;
