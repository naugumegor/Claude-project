CREATE TYPE "public"."file_kind" AS ENUM('pdf', 'html');--> statement-breakpoint
ALTER TYPE "public"."material_type" ADD VALUE 'doc';--> statement-breakpoint
CREATE TABLE "auth_failures" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "favorites" (
	"user_id" integer NOT NULL,
	"material_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "favorites_user_id_material_id_pk" PRIMARY KEY("user_id","material_id")
);
--> statement-breakpoint
CREATE TABLE "material_files" (
	"id" serial PRIMARY KEY NOT NULL,
	"material_id" integer NOT NULL,
	"url" text NOT NULL,
	"name" text NOT NULL,
	"kind" "file_kind" NOT NULL,
	"size" integer DEFAULT 0 NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text,
	"name" text DEFAULT '' NOT NULL,
	"password_hash" text,
	"github_id" text,
	"github_login" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_github_id_unique" UNIQUE("github_id")
);
--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_material_id_materials_id_fk" FOREIGN KEY ("material_id") REFERENCES "public"."materials"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "material_files" ADD CONSTRAINT "material_files_material_id_materials_id_fk" FOREIGN KEY ("material_id") REFERENCES "public"."materials"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "auth_failures_key_idx" ON "auth_failures" USING btree ("key","created_at");