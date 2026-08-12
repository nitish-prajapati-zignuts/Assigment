CREATE TABLE "action_items" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"meeting_id" varchar(255) NOT NULL,
	"user_id" varchar(255),
	"task" text NOT NULL,
	"owner" text DEFAULT 'Unassigned',
	"due_date" text DEFAULT 'Not specified',
	"priority" text DEFAULT 'Medium',
	"status" text DEFAULT 'Pending',
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "meetings" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"date" text NOT NULL,
	"type" text DEFAULT 'meeting' NOT NULL,
	"participants" jsonb NOT NULL,
	"transcript" text DEFAULT '',
	"summary" jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"is_meeting_published" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "action_items" ADD CONSTRAINT "action_items_meeting_id_meetings_id_fk" FOREIGN KEY ("meeting_id") REFERENCES "public"."meetings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "action_items" ADD CONSTRAINT "action_items_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "action_items_meeting_id_idx" ON "action_items" USING btree ("meeting_id");--> statement-breakpoint
CREATE INDEX "action_items_user_id_idx" ON "action_items" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "action_items_owner_idx" ON "action_items" USING btree ("owner");--> statement-breakpoint
CREATE INDEX "action_items_status_idx" ON "action_items" USING btree ("status");--> statement-breakpoint
CREATE INDEX "action_items_priority_idx" ON "action_items" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "action_items_due_date_idx" ON "action_items" USING btree ("due_date");--> statement-breakpoint
CREATE INDEX "action_items_created_at_idx" ON "action_items" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "action_items_meeting_status_idx" ON "action_items" USING btree ("meeting_id","status");--> statement-breakpoint
CREATE INDEX "action_items_owner_status_idx" ON "action_items" USING btree ("owner","status");--> statement-breakpoint
CREATE INDEX "meetings_date_idx" ON "meetings" USING btree ("date");--> statement-breakpoint
CREATE INDEX "meetings_type_idx" ON "meetings" USING btree ("type");--> statement-breakpoint
CREATE INDEX "meetings_created_at_idx" ON "meetings" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "meetings_participants_idx" ON "meetings" USING btree ("participants");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");