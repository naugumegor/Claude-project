-- The dashboard (deadlines, timetable, settings) belonged to "the admin" as a whole, so every admin
-- saw the owner's schedule. Now each row belongs to one account; the existing rows go to the owner.
ALTER TABLE "deadlines" ADD COLUMN IF NOT EXISTS "user_id" integer REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "timetable" ADD COLUMN IF NOT EXISTS "user_id" integer REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "deadlines_user_idx" ON "deadlines" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "timetable_user_idx" ON "timetable" USING btree ("user_id");--> statement-breakpoint
UPDATE "deadlines" SET "user_id" = (SELECT "id" FROM "users" WHERE "github_id" = '326945319') WHERE "user_id" IS NULL;--> statement-breakpoint
UPDATE "timetable" SET "user_id" = (SELECT "id" FROM "users" WHERE "github_id" = '326945319') WHERE "user_id" IS NULL;--> statement-breakpoint
UPDATE "owner_settings" SET "key" = 'dashboard:' || (SELECT "id" FROM "users" WHERE "github_id" = '326945319')
  WHERE "key" = 'dashboard'
    AND EXISTS (SELECT 1 FROM "users" WHERE "github_id" = '326945319')
    AND NOT EXISTS (SELECT 1 FROM "owner_settings" o, "users" u WHERE u."github_id" = '326945319' AND o."key" = 'dashboard:' || u."id");
