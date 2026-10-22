import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_LOGIN, createSession, github } from "@/lib/session";

// GitHub redirects here with ?code&state. We swap the code for the user's login
// and only let the site owner in.
export async function GET(request: NextRequest) {
  const jar = await cookies();
  const saved = jar.get("oauth_state")?.value;
  jar.delete({ name: "oauth_state", path: "/api/auth" });

  const { state, next } = saved ? (JSON.parse(saved) as { state: string; next: string }) : {};
  const code = request.nextUrl.searchParams.get("code");
  if (!state || !code || request.nextUrl.searchParams.get("state") !== state) {
    return deny(request, "state");
  }

  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: github.clientId,
      client_secret: github.clientSecret,
      code,
      redirect_uri: new URL("/api/auth/callback", request.url).toString(),
    }),
  });
  const { access_token } = (await tokenRes.json()) as { access_token?: string };
  if (!access_token) return deny(request, "token");

  const userRes = await fetch("https://api.github.com/user", {
    headers: { Authorization: `Bearer ${access_token}`, Accept: "application/vnd.github+json" },
  });
  const user = (await userRes.json()) as { login?: string };
  if (user.login?.toLowerCase() !== ADMIN_LOGIN) return deny(request, "forbidden");

  await createSession(user.login);
  return NextResponse.redirect(new URL(next ?? "/ru/admin", request.url));
}

function deny(request: NextRequest, reason: string) {
  return NextResponse.redirect(new URL(`/ru/admin/denied?reason=${reason}`, request.url));
}
