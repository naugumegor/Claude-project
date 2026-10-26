"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { and, count, eq, gt, lt } from "drizzle-orm";
import { db } from "@/db";
import { authFailures, favorites, materials, users } from "@/db/schema";
import { hashPassword, verifyPassword } from "@/lib/password";
import {
  createSession,
  destroySession,
  getUser,
  requireUser,
  safeNext,
} from "@/lib/session";

/** Error codes match keys of dict.auth.errors; "ok" marks a successful profile update. */
export type FormState = { error?: string; ok?: string } | undefined;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 5;
const MAX_SIGNUPS = 3;

function field(form: FormData, name: string) {
  return String(form.get(name) ?? "").trim();
}

async function clientIp() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

/** Too many failed attempts for this email, or 4x as many from this IP, in the last 15 minutes. */
async function throttled(email: string, ip: string) {
  const since = new Date(Date.now() - WINDOW_MS);
  const [byEmail] = await db
    .select({ n: count() })
    .from(authFailures)
    .where(and(eq(authFailures.key, `email:${email}`), gt(authFailures.createdAt, since)));
  const [byIp] = await db
    .select({ n: count() })
    .from(authFailures)
    .where(and(eq(authFailures.key, `ip:${ip}`), gt(authFailures.createdAt, since)));
  return byEmail.n >= MAX_FAILURES || byIp.n >= MAX_FAILURES * 4;
}

/** Accounts created from this IP in the last 15 minutes. */
async function signUpsFrom(ip: string) {
  const since = new Date(Date.now() - WINDOW_MS);
  const [row] = await db
    .select({ n: count() })
    .from(authFailures)
    .where(and(eq(authFailures.key, `signup:${ip}`), gt(authFailures.createdAt, since)));
  return row.n;
}

async function recordFailure(email: string, ip: string) {
  await db.insert(authFailures).values([{ key: `email:${email}` }, { key: `ip:${ip}` }]);
  // Housekeeping: old rows are useless.
  await db.delete(authFailures).where(lt(authFailures.createdAt, new Date(Date.now() - WINDOW_MS)));
}

export async function signUp(_prev: FormState, form: FormData): Promise<FormState> {
  const name = field(form, "name").slice(0, 80);
  const email = field(form, "email").toLowerCase();
  const password = String(form.get("password") ?? "");
  if (!name) return { error: "needName" };
  if (!EMAIL.test(email) || email.length > 200) return { error: "badEmail" };
  if (password.length < 8 || password.length > 200) return { error: "shortPassword" };

  const ip = await clientIp();
  if ((await throttled(email, ip)) || (await signUpsFrom(ip)) >= MAX_SIGNUPS) return { error: "tooMany" };

  const [user] = await db
    .insert(users)
    .values({ name, email, passwordHash: await hashPassword(password) })
    .onConflictDoNothing({ target: users.email })
    .returning();
  if (!user) {
    await recordFailure(email, ip);
    return { error: "emailTaken" };
  }

  // Counted like a failure, so one address can't script hundreds of accounts.
  await db.insert(authFailures).values({ key: `signup:${ip}` });
  await createSession({ id: user.id, name: user.name });
  redirect(safeNext(field(form, "next"), "/ru/account"));
}

export async function signIn(_prev: FormState, form: FormData): Promise<FormState> {
  const email = field(form, "email").toLowerCase();
  const password = String(form.get("password") ?? "");
  const ip = await clientIp();
  if (await throttled(email, ip)) return { error: "tooMany" };

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  const ok = await verifyPassword(password, user?.passwordHash ?? null);
  if (!user || !ok) {
    await recordFailure(email, ip);
    return { error: "badCredentials" };
  }

  // No GitHub login in this session on purpose: admin rights always need GitHub itself.
  await createSession({ id: user.id, name: user.name });
  redirect(safeNext(field(form, "next"), "/ru/account"));
}

export async function signOut(form: FormData) {
  await destroySession();
  redirect(safeNext(field(form, "next"), "/"));
}

export async function updateProfile(_prev: FormState, form: FormData): Promise<FormState> {
  const session = await requireUser();
  const name = field(form, "name").slice(0, 80);
  if (!name) return { error: "needName" };
  await db.update(users).set({ name }).where(eq(users.id, session.id));
  await createSession({ ...session, name });
  return { ok: "saved" };
}

/** Changes the password, or sets a first one (plus an email) for GitHub-only accounts. */
export async function changePassword(_prev: FormState, form: FormData): Promise<FormState> {
  const session = await requireUser();
  const [user] = await db.select().from(users).where(eq(users.id, session.id)).limit(1);
  if (!user) return { error: "badCredentials" };

  const next = String(form.get("newPassword") ?? "");
  if (next.length < 8 || next.length > 200) return { error: "shortPassword" };

  const patch: Partial<typeof users.$inferInsert> = { passwordHash: await hashPassword(next) };
  if (user.passwordHash) {
    const ip = await clientIp();
    const key = user.email ?? `uid:${user.id}`;
    if (await throttled(key, ip)) return { error: "tooMany" };
    if (!(await verifyPassword(String(form.get("current") ?? ""), user.passwordHash))) {
      await recordFailure(key, ip);
      return { error: "wrongPassword" };
    }
  } else {
    const email = field(form, "email").toLowerCase();
    if (!EMAIL.test(email)) return { error: "badEmail" };
    const [taken] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    if (taken && taken.id !== user.id) return { error: "emailTaken" };
    patch.email = email;
  }

  await db.update(users).set(patch).where(eq(users.id, user.id));
  return { ok: "changed" };
}

/** Adds or removes a published material from the user's favorites. Returns the new state. */
export async function toggleFavorite(materialId: number): Promise<boolean | null> {
  const user = await getUser();
  if (!user) return null;

  const removed = await db
    .delete(favorites)
    .where(and(eq(favorites.userId, user.id), eq(favorites.materialId, materialId)))
    .returning();
  if (removed.length > 0) return false;

  const [material] = await db
    .select({ id: materials.id })
    .from(materials)
    .where(and(eq(materials.id, materialId), eq(materials.status, "published")))
    .limit(1);
  if (!material) return null;
  try {
    await db.insert(favorites).values({ userId: user.id, materialId }).onConflictDoNothing();
  } catch {
    return null; // The account no longer exists.
  }
  return true;
}
