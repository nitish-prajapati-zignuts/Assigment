import { pgTable, text, timestamp, varchar, jsonb } from "drizzle-orm/pg-core";

export type SummaryLength = "Short" | "Medium" | "Long";

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

export interface MeetingSummary {
  purpose: string;
  discussionPoints: string[];
  majorOutcomes: string[];
  importantConcerns: string[];
  nextSteps: string[];
  keyDecisions?: KeyDecision[];
  actionItems?: ActionItem[];
}

export const users = pgTable("users", {
  id: varchar("id", { length: 255 }).primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const meetings = pgTable("meetings", {
  id: varchar("id", { length: 255 }).primaryKey(),
  title: text("title").notNull(),
  date: text("date").notNull(),
  type: text("type").notNull(),
  participants: jsonb("participants").$type<string[]>().notNull(),
  transcript: text("transcript").default(""),
  summary: jsonb("summary").$type<MeetingSummary>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const actionItems = pgTable("action_items", {
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
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UserRecord = typeof users.$inferSelect;
export type NewUserRecord = typeof users.$inferInsert;

export type MeetingRecord = typeof meetings.$inferSelect;
export type NewMeetingRecord = typeof meetings.$inferInsert;

export type ActionItemRecord = typeof actionItems.$inferSelect;
export type NewActionItemRecord = typeof actionItems.$inferInsert;
