"use server";

import { headers } from "next/headers";
import { and, count, eq, gt, isNotNull, lt } from "drizzle-orm";
import { db } from "@/db";
import { pastes, shortLinks } from "@/db/schema";
import { getAdmin, requireUser } from "@/lib/session";
import {
  LINK_LIMITS,
  PASTE_EXPIRY,
  PASTE_LIMITS,
  PASTE_MAX_BYTES,
  PASTE_MAX_TITLE,
  checkCustomCode,
  checkLinkUrl,
  isPasteLanguage,
} from "@/lib/share";

// Short links and pastes. Any signed-in reader can make them, within hourly and total limits;
// only the owner (or the admin) can delete one.

type Result<T = null> = { ok: true; data: T } | { ok: false; error: string };

const HOUR = 60 * 60 * 1000;
const ALPHABET = "abcdefghijkmnpqrstuvwxyz23456789"; // no 0/o, 1/l: easy to read aloud

function randomCode(length: number) {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
}

/** Hourly and total counts for one reader in one table. */
async function overLimit(
  table: typeof shortLinks | typeof pastes,
  userId: number,
  limits: { perHour: number; total: number },
) {
  const [[hour], [all]] = await Promise.all([
    db
      .select({ n: count() })
      .from(table)
      .where(and(eq(table.userId, userId), gt(table.createdAt, new Date(Date.now() - HOUR)))),
    db.select({ n: count() }).from(table).where(eq(table.userId, userId)),
  ]);
  return hour.n >= limits.perHour || all.n >= limits.total;
}

export async function createShortLink(input: { url: string; code?: string }): Promise<Result<{ code: string }>> {
  const user = await requireUser();
  const admin = await getAdmin();
  const host = (await headers()).get("host")?.split(":")[0];
  const checked = checkLinkUrl(String(input.url ?? ""), host);
  if ("error" in checked) return { ok: false, error: checked.error };

  const custom = String(input.code ?? "").trim().toLowerCase();
  if (custom && checkCustomCode(custom) !== "ok") return { ok: false, error: "badCode" };
  if (!admin && (await overLimit(shortLinks, user.id, LINK_LIMITS))) return { ok: false, error: "tooMany" };

  // A random 6-letter code from 32 letters: ~10^9 codes, so a clash is rare; retry if it happens.
  for (let attempt = 0; attempt < (custom ? 1 : 5); attempt++) {
    const code = custom || randomCode(6);
    const [row] = await db
      .insert(shortLinks)
      .values({ code, url: checked.url, userId: user.id })
      .onConflictDoNothing({ target: shortLinks.code })
      .returning();
    if (row) return { ok: true, data: { code: row.code } };
  }
  return { ok: false, error: custom ? "codeTaken" : "failed" };
}

export async function deleteShortLink(id: number): Promise<Result> {
  const user = await requireUser();
  const admin = await getAdmin();
  const [row] = await db
    .delete(shortLinks)
    .where(admin ? eq(shortLinks.id, id) : and(eq(shortLinks.id, id), eq(shortLinks.userId, user.id)))
    .returning();
  return row ? { ok: true, data: null } : { ok: false, error: "failed" };
}

export async function createPaste(input: {
  title: string;
  language: string;
  body: string;
  expiresHours: number;
}): Promise<Result<{ id: string }>> {
  const user = await requireUser();
  const admin = await getAdmin();
  const body = String(input.body ?? "").replace(/\r\n/g, "\n");
  if (!body.trim()) return { ok: false, error: "empty" };
  if (new TextEncoder().encode(body).length > PASTE_MAX_BYTES) return { ok: false, error: "tooBig" };
  const language = isPasteLanguage(input.language) ? input.language : "auto";
  const hours = (PASTE_EXPIRY as readonly number[]).includes(input.expiresHours) ? input.expiresHours : 0;
  if (!admin && (await overLimit(pastes, user.id, PASTE_LIMITS))) return { ok: false, error: "tooMany" };

  // Housekeeping: expired pastes are never shown again, so drop them.
  await db.delete(pastes).where(and(isNotNull(pastes.expiresAt), lt(pastes.expiresAt, new Date())));

  for (let attempt = 0; attempt < 5; attempt++) {
    // 10 letters from 32: 2^50 ids, so a link can't be guessed or enumerated.
    const id = randomCode(10);
    const [row] = await db
      .insert(pastes)
      .values({
        id,
        userId: user.id,
        title: String(input.title ?? "").trim().slice(0, PASTE_MAX_TITLE),
        language,
        body,
        expiresAt: hours ? new Date(Date.now() + hours * HOUR) : null,
      })
      .onConflictDoNothing({ target: pastes.id })
      .returning();
    if (row) return { ok: true, data: { id: row.id } };
  }
  return { ok: false, error: "failed" };
}

export async function deletePaste(id: string): Promise<Result> {
  const user = await requireUser();
  const admin = await getAdmin();
  const [row] = await db
    .delete(pastes)
    .where(admin ? eq(pastes.id, id) : and(eq(pastes.id, id), eq(pastes.userId, user.id)))
    .returning();
  return row ? { ok: true, data: null } : { ok: false, error: "failed" };
}
