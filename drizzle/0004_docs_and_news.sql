CREATE TYPE "public"."user_doc_status" AS ENUM('private', 'pending', 'published', 'rejected');--> statement-breakpoint
CREATE TABLE "news" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title_ru" text NOT NULL,
	"title_en" text DEFAULT '' NOT NULL,
	"body_ru" text DEFAULT '' NOT NULL,
	"body_en" text DEFAULT '' NOT NULL,
	"cover" text,
	"pinned" integer DEFAULT 0 NOT NULL,
	"status" "material_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"published_at" timestamp with time zone,
	CONSTRAINT "news_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "user_documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"name" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"url" text NOT NULL,
	"kind" "file_kind" NOT NULL,
	"size" integer DEFAULT 0 NOT NULL,
	"status" "user_doc_status" DEFAULT 'private' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"published_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "user_documents" ADD CONSTRAINT "user_documents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "user_documents_user_idx" ON "user_documents" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_documents_status_idx" ON "user_documents" USING btree ("status");