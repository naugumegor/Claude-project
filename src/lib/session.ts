import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

// Everyone who signs in (customers and the site owner) gets the same signed cookie.
// The owner is recognised by their GitHub login, which only GitHub can vouch for.

export const ADMIN_LOGIN = (process.env.ADMIN_GITHUB_LOGIN ?? "naugumegor").toLowerCase();
const COOKIE = "ingenium_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export type SessionUser = {
  id: number;
  name: string;
  /** GitHub login, when the user signed in with GitHub. */
  login?: string;
};

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value && process.env.VERCEL) throw new Error("AUTH_SECRET is not set.");
  return new TextEncoder().encode(value ?? "local-dev-secret-not-for-production");
}

export async function createSession(user: SessionUser) {
  const token = await new SignJWT({ uid: user.id, name: user.name, login: user.login })
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

async function readSession() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    return (await jwtVerify(token, secret())).payload;
  } catch {
    return null;
  }
}

/** The signed-in user, or null. */
export async function getUser(): Promise<SessionUser | null> {
  const payload = await readSession();
  if (typeof payload?.uid !== "number") return null;
  return {
    id: payload.uid,
    name: String(payload.name ?? ""),
    login: typeof payload.login === "string" ? payload.login : undefined,
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
  return login === ADMIN_LOGIN ? login : null;
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

/** Only same-site relative paths, so `?next=` can't be used as an open redirect. */
export function safeNext(value: string | null | undefined, fallback: string) {
  return value && value.startsWith("/") && !value.startsWith("//") && !value.startsWith("/\\")
    ? value
    : fallback;
}
