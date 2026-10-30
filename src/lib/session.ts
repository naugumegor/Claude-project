import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";

// Everyone who signs in (customers and the site owner) gets the same signed cookie.
// The owner is recognised by their numeric GitHub account id, which only GitHub can vouch for
// and which, unlike the login, never changes or passes to somebody else.
// Each cookie also carries the account's session version: bumping it (password change, reset,
// "sign out everywhere", a deleted account) makes every older cookie worthless at once.

export const ADMIN_LOGIN = (process.env.ADMIN_GITHUB_LOGIN ?? "naugumegor").toLowerCase();
export const ADMIN_GITHUB_ID = process.env.ADMIN_GITHUB_ID ?? "326945319";
const ADMIN_GITHUB_IDS = new Set([
  ADMIN_GITHUB_ID,
  ...(process.env.ADMIN_GITHUB_IDS ?? "").split(",").map((id) => id.trim()).filter((id) => /^\d+$/.test(id)),
]);

/** Whether this GitHub account id belongs to an admin (the owner or anyone in ADMIN_GITHUB_IDS). */
export function isAdminGithubId(gid: string | null | undefined) {
  return !!gid && (ADMIN_GITHUB_IDS.has(gid) || (devBypass && gid === "dev"));
}
const COOKIE = "ingenium_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export type SessionUser = {
  id: number;
  name: string;
  /** GitHub login, when the user signed in with GitHub. */
  login?: string;
  /** Numeric GitHub account id, when the user signed in with GitHub. */
  githubId?: string;
};

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value && process.env.VERCEL) throw new Error("AUTH_SECRET is not set.");
  return new TextEncoder().encode(value ?? "local-dev-secret-not-for-production");
}

export async function createSession(user: SessionUser) {
  const sv = (await sessionVersion(user.id)) ?? 0;
  const token = await new SignJWT({ uid: user.id, name: user.name, login: user.login, gid: user.githubId, sv })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}

/** The account's current session version, or null when the account no longer exists. */
async function sessionVersion(userId: number) {
  const [row] = await db
    .select({ v: users.sessionVersion })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return row ? row.v : null;
}

/** Signs the account out on every device; the caller may then issue a fresh cookie. */
export async function revokeSessions(userId: number) {
  await db
    .update(users)
    .set({ sessionVersion: sql`${users.sessionVersion} + 1` })
    .where(eq(users.id, userId));
}

// Once per request, however many components ask who is signed in.
const readSession = cache(async () => {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  let payload;
  try {
    payload = (await jwtVerify(token, secret())).payload;
  } catch {
    return null;
  }
  if (typeof payload.uid !== "number") return null;
  // Cookies issued before session versions existed carry none and count as version 0.
  const sv = typeof payload.sv === "number" ? payload.sv : 0;
  return sv === (await sessionVersion(payload.uid)) ? payload : null;
});

/** The signed-in user, or null. */
export async function getUser(): Promise<SessionUser | null> {
  const payload = await readSession();
  if (!payload) return null;
  return {
    id: payload.uid as number,
    name: String(payload.name ?? ""),
    login: typeof payload.login === "string" ? payload.login : undefined,
    githubId: typeof payload.gid === "string" ? payload.gid : undefined,
  };
}

/** Use at the top of every Server Action that needs an account. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getUser();
  if (!user) throw new Error("Not signed in");
  return user;
}

/** Returns the admin's login, or null when nobody (or somebody else) is signed in. */
export async function getAdmin(): Promise<string | null> {
  const payload = await readSession();
  const login = String(payload?.login ?? "").toLowerCase();
  const gid = String(payload?.gid ?? "");
  return isAdminGithubId(gid) ? login || ADMIN_LOGIN : null;
}

/** Use at the top of every Server Action that changes materials. */
export async function requireAdmin(): Promise<string> {
  const admin = await getAdmin();
  if (!admin) throw new Error("Not authorized");
  return admin;
}

/** GitHub OAuth app keys. Accepts both GITHUB_CLIENT_ID and Github_Client_ID spellings. */
export const github = {
  clientId: process.env.GITHUB_CLIENT_ID ?? process.env.Github_Client_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET ?? process.env.Github_Client_Secret,
};

/** Local development without a GitHub OAuth app: the GitHub button signs in as the owner. Never on Vercel. */
export const devBypass = !process.env.VERCEL && !github.clientId;

/**
 * Only same-site relative paths, so `?next=` can't be used as an open redirect. The value is
 * parsed the way the browser will parse it: URL parsing drops tabs and newlines, so a string
 * check alone lets "/\t/evil.com" through as "//evil.com".
 */
export function safeNext(value: string | null | undefined, fallback: string) {
  if (!value?.startsWith("/")) return fallback;
  const base = "https://same-origin.invalid";
  try {
    const url = new URL(value, base);
    return url.origin === base ? url.pathname + url.search + url.hash : fallback;
  } catch {
    return fallback;
  }
}
