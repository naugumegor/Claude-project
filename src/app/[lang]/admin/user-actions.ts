"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { hasLocale } from "@/lib/i18n";
import { createResetLink } from "@/lib/password-reset";
import { requireAdmin } from "@/lib/session";

/** A one-time reset link the admin hands to a reader by hand (works without any mail service). */
export async function issueResetLink(userId: number, lang: string): Promise<string | null> {
  await requireAdmin();
  const [user] = await db.select({ id: users.id }).from(users).where(eq(users.id, userId)).limit(1);
  if (!user) return null;
  return createResetLink(user.id, hasLocale(lang) ? lang : "ru");
}
