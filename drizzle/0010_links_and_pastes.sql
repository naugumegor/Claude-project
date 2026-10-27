CREATE TABLE IF NOT EXISTS "pastes" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action,
	"title" text DEFAULT '' NOT NULL,
	"language" text DEFAULT 'auto' NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "short_links" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"url" text NOT NULL,
	"user_id" integer NOT NULL REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action,
	"clicks" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "short_links_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pastes_user_idx" ON "pastes" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "short_links_user_idx" ON "short_links" USING btree ("user_id","created_at");
