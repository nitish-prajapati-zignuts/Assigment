CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE "meeting_chunks" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"meeting_id" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"embedding" vector(1536) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "notifications_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" varchar(255) NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"type" text DEFAULT 'general' NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_sessions" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"ip_address" text DEFAULT '127.0.0.1' NOT NULL,
	"device" text DEFAULT 'Desktop' NOT NULL,
	"browser" text DEFAULT 'Chrome' NOT NULL,
	"os" text DEFAULT 'Mac OS X' NOT NULL,
	"location" text DEFAULT 'Local Session',
	"is_current" boolean DEFAULT true NOT NULL,
	"last_active" timestamp with time zone DEFAULT now(),
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_settings" (
	"user_id" varchar(255) PRIMARY KEY NOT NULL,
	"summary_length" text DEFAULT 'Medium' NOT NULL,
	"template" text DEFAULT 'Standard' NOT NULL,
	"custom_prompt" text DEFAULT 'Focus heavily on technical decisions, code deliverables, and explicit action item due dates.' NOT NULL,
	"auto_extract_action_items" boolean DEFAULT true NOT NULL,
	"email_notifications" boolean DEFAULT true NOT NULL,
	"weekly_digest" boolean DEFAULT false NOT NULL,
	"slack_webhook_url" text DEFAULT '',
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "meetings" ADD COLUMN "share_password" text;--> statement-breakpoint
ALTER TABLE "meetings" ADD COLUMN "share_expires_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "meeting_chunks" ADD CONSTRAINT "meeting_chunks_meeting_id_meetings_id_fk" FOREIGN KEY ("meeting_id") REFERENCES "public"."meetings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "meeting_chunks_meeting_id_idx" ON "meeting_chunks" USING btree ("meeting_id");--> statement-breakpoint
CREATE INDEX "notifications_user_id_idx" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notifications_created_at_idx" ON "notifications" USING btree ("created_at");