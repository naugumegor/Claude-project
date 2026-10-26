DO $$ BEGIN CREATE TYPE "public"."class_kind" AS ENUM('lecture', 'practice', 'lab', 'other'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;--> statement-breakpoint
DO $$ BEGIN CREATE TYPE "public"."week_parity" AS ENUM('every', 'odd', 'even'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "deadlines" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"note" text DEFAULT '' NOT NULL,
	"due_at" timestamp with time zone NOT NULL,
	"done_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "owner_settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "timetable" (
	"id" serial PRIMARY KEY NOT NULL,
	"weekday" integer NOT NULL,
	"starts" text NOT NULL,
	"ends" text NOT NULL,
	"title" text NOT NULL,
	"room" text DEFAULT '' NOT NULL,
	"teacher" text DEFAULT '' NOT NULL,
	"kind" "class_kind" DEFAULT 'lecture' NOT NULL,
	"parity" "week_parity" DEFAULT 'every' NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "deadlines_due_idx" ON "deadlines" USING btree ("due_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "timetable_day_idx" ON "timetable" USING btree ("weekday","starts");