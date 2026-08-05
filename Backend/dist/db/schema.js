"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.actionItems = exports.meetings = exports.users = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.users = (0, pg_core_1.pgTable)("users", {
    id: (0, pg_core_1.varchar)("id", { length: 255 }).primaryKey(),
    name: (0, pg_core_1.text)("name").notNull(),
    email: (0, pg_core_1.text)("email").notNull().unique(),
    password: (0, pg_core_1.text)("password").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
exports.meetings = (0, pg_core_1.pgTable)("meetings", {
    id: (0, pg_core_1.varchar)("id", { length: 255 }).primaryKey(),
    title: (0, pg_core_1.text)("title").notNull(),
    date: (0, pg_core_1.text)("date").notNull(),
    type: (0, pg_core_1.text)("type").notNull(),
    participants: (0, pg_core_1.jsonb)("participants").$type().notNull(),
    transcript: (0, pg_core_1.text)("transcript").default(""),
    summary: (0, pg_core_1.jsonb)("summary").$type(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
exports.actionItems = (0, pg_core_1.pgTable)("action_items", {
    id: (0, pg_core_1.varchar)("id", { length: 255 }).primaryKey(),
    meetingId: (0, pg_core_1.varchar)("meeting_id", { length: 255 })
        .notNull()
        .references(() => exports.meetings.id, { onDelete: "cascade" }),
    userId: (0, pg_core_1.varchar)("user_id", { length: 255 }).references(() => exports.users.id, {
        onDelete: "set null",
    }),
    task: (0, pg_core_1.text)("task").notNull(),
    owner: (0, pg_core_1.text)("owner").default("Unassigned"),
    dueDate: (0, pg_core_1.text)("due_date").default("Not specified"),
    priority: (0, pg_core_1.text)("priority").default("Medium"),
    status: (0, pg_core_1.text)("status").default("Pending"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
