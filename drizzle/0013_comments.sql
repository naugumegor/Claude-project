DO $$ BEGIN
	CREATE TYPE "public"."discussion_target" AS ENUM('material', 'doc', 'news', 'comment');
EXCEPTION WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
	CREATE TYPE "public"."comment_status" AS ENUM('published', 'pending', 'hidden', 'deleted');
EXCEPTION WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "comment_banned" boolean DEFAULT false NOT NULL;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"target_type" "discussion_target" NOT NULL,
	"target_id" integer NOT NULL,
	"user_id" integer NOT NULL REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action,
	"parent_id" integer REFERENCES "public"."comments"("id") ON DELETE cascade ON UPDATE no action,
	"body" text NOT NULL,
	"status" "comment_status" DEFAULT 'published' NOT NULL,
	"reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"edited_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "reactions" (
	"user_id" integer NOT NULL REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action,
	"target_type" "discussion_target" NOT NULL,
	"target_id" integer NOT NULL,
	"kind" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "reactions_user_id_target_type_target_id_kind_pk" PRIMARY KEY("user_id","target_type","target_id","kind")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "comment_reports" (
	"comment_id" integer NOT NULL REFERENCES "public"."comments"("id") ON DELETE cascade ON UPDATE no action,
	"user_id" integer NOT NULL REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "comment_reports_comment_id_user_id_pk" PRIMARY KEY("comment_id","user_id")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "comments_target_idx" ON "comments" USING btree ("target_type","target_id","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "comments_user_idx" ON "comments" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "comments_status_idx" ON "comments" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "reactions_target_idx" ON "reactions" USING btree ("target_type","target_id");
