import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createSession, github, safeNext } from "@/lib/session";
import { upsertGithubUser } from "@/db/users";

// GitHub redirects here with ?code&state. We swap the code for the user's profile
// and sign them in. Whether they may edit materials is decided by getAdmin().
export async function GET(request: NextRequest) {
  const jar = await cookies();
  const saved = jar.get("oauth_state")?.value;
  jar.delete({ name: "oauth_state", path: "/api/auth" });

  const { state, next } = saved ? (JSON.parse(saved) as { state: string; next: string }) : {};
  const code = request.nextUrl.searchParams.get("code");
  if (!state || !code || request.nextUrl.searchParams.get("state") !== state) {
    return fail(request, next);
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
  if (!access_token) return fail(request, next);

  const userRes = await fetch("https://api.github.com/user", {
    headers: { Authorization: `Bearer ${access_token}`, Accept: "application/vnd.github+json" },
  });
  const gh = (await userRes.json()) as { id?: number; login?: string; name?: string | null };
  if (!gh.id || !gh.login) return fail(request, next);

  const user = await upsertGithubUser({ id: String(gh.id), login: gh.login, name: gh.name });
  await createSession({ id: user.id, name: user.name, login: gh.login });
  return NextResponse.redirect(new URL(safeNext(next, "/ru/account"), request.url));
}

function fail(request: NextRequest, next?: string) {
  const locale = next?.startsWith("/en") ? "en" : "ru";
  return NextResponse.redirect(new URL(`/${locale}/login?error=github`, request.url));
}
