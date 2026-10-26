CREATE TABLE IF NOT EXISTS "telegram_chats" (
	"chat_id" text PRIMARY KEY NOT NULL,
	"name" text DEFAULT '' NOT NULL,
	"locale" text DEFAULT 'ru' NOT NULL,
	"is_owner" boolean DEFAULT false NOT NULL,
	"notify" boolean DEFAULT true NOT NULL,
	"remind" boolean DEFAULT true NOT NULL,
	"reminded_on" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "materials" ADD COLUMN IF NOT EXISTS "announced_at" timestamp with time zone;--> statement-breakpoint
-- Everything already on the site counts as announced: the bot only tells about what comes next.
UPDATE "materials" SET "announced_at" = now() WHERE "status" = 'published' AND "announced_at" IS NULL;
