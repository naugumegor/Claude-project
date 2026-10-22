import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_LOGIN, createSession, devBypass, github } from "@/lib/session";

// Starts the GitHub OAuth flow. `?next=` is where to return afterwards.
export async function GET(request: NextRequest) {
  const next = safeNext(request.nextUrl.searchParams.get("next"));

  if (devBypass) {
    await createSession(ADMIN_LOGIN);
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
  authorize.searchParams.set("allow_signup", "false");
  return NextResponse.redirect(authorize);
}

/** Only allow same-site relative paths, so the login can't be used as an open redirect. */
function safeNext(value: string | null) {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/ru/admin";
}
