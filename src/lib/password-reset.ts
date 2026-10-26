import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { and, eq, gt, lt } from "drizzle-orm";
import { db } from "@/db";
import { passwordResets } from "@/db/schema";
import type { Locale } from "@/lib/i18n";
import { siteUrl } from "@/lib/site";

const TTL_MS = 60 * 60 * 1000; // 1 hour

const digest = (token: string) => createHash("sha256").update(token).digest("hex");

/** Issues a fresh one-time link for the user; any older link stops working. */
export async function createResetLink(userId: number, locale: Locale) {
  const token = randomBytes(32).toString("base64url");
  await db.delete(passwordResets).where(eq(passwordResets.userId, userId));
  // Housekeeping: drop everybody's expired links.
  await db.delete(passwordResets).where(lt(passwordResets.expiresAt, new Date()));
  await db.insert(passwordResets).values({
    userId,
    tokenHash: digest(token),
    expiresAt: new Date(Date.now() + TTL_MS),
  });
  return `${siteUrl}/${locale}/reset?token=${token}`;
}

/** The user id behind a live token, or null. Does not use the token up. */
export async function peekResetToken(token: string) {
  if (!token) return null;
  const [row] = await db
    .select({ userId: passwordResets.userId })
    .from(passwordResets)
    .where(and(eq(passwordResets.tokenHash, digest(token)), gt(passwordResets.expiresAt, new Date())))
    .limit(1);
  return row?.userId ?? null;
}

/** Uses the token up and returns its user id, or null when it is unknown, used or expired. */
export async function consumeResetToken(token: string) {
  if (!token) return null;
  const [row] = await db
    .delete(passwordResets)
    .where(and(eq(passwordResets.tokenHash, digest(token)), gt(passwordResets.expiresAt, new Date())))
    .returning();
  if (!row) return null;
  await db.delete(passwordResets).where(eq(passwordResets.userId, row.userId));
  return row.userId;
}
