import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

// The admin is a single GitHub account. Its login is kept in a signed cookie.

export const ADMIN_LOGIN = (process.env.ADMIN_GITHUB_LOGIN ?? "naugumegor").toLowerCase();
const COOKIE = "ingenium_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value && process.env.VERCEL) throw new Error("AUTH_SECRET is not set.");
  return new TextEncoder().encode(value ?? "local-dev-secret-not-for-production");
}

export async function createSession(login: string) {
  const token = await new SignJWT({ login })
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

/** Returns the admin's login, or null when nobody (or somebody else) is signed in. */
export async function getAdmin(): Promise<string | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    const login = String(payload.login ?? "").toLowerCase();
    return login === ADMIN_LOGIN ? login : null;
  } catch {
    return null;
  }
}

/** Use at the top of every Server Action that changes data. */
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

/** Local development without a GitHub OAuth app: sign in directly. Never on Vercel. */
export const devBypass = !process.env.VERCEL && !github.clientId;
