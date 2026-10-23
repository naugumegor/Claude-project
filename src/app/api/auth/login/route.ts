import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_LOGIN, createSession, devBypass, github, safeNext } from "@/lib/session";
import { upsertGithubUser } from "@/db/users";

// Starts the GitHub OAuth flow. `?next=` is where to return afterwards.
export async function GET(request: NextRequest) {
  const next = safeNext(request.nextUrl.searchParams.get("next"), "/ru/account");

  if (devBypass) {
    const user = await upsertGithubUser({ id: "dev", login: ADMIN_LOGIN, name: ADMIN_LOGIN });
    await createSession({ id: user.id, name: user.name, login: ADMIN_LOGIN, githubId: "dev" });
    return NextResponse.redirect(new URL(next, request.url));
  }

  const clientId = github.clientId;
  if (!clientId) return new NextResponse("GITHUB_CLIENT_ID is not set", { status: 500 });

  const state = crypto.randomUUID();
  (await cookies()).set("oauth_state", JSON.stringify({ state, next }), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/api/auth",
    maxAge: 600,
  });

  const authorize = new URL("https://github.com/login/oauth/authorize");
  authorize.searchParams.set("client_id", clientId);
  authorize.searchParams.set("redirect_uri", new URL("/api/auth/callback", request.url).toString());
  authorize.searchParams.set("state", state);
  return NextResponse.redirect(authorize);
}
