import { NextResponse, type NextRequest } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { shortLinks, users } from "@/db/schema";
import { isAdminGithubId } from "@/lib/session";
import { matchLocale } from "@/lib/i18n";
import { checkLinkUrl } from "@/lib/share";

// /s/<code>: the admin's links redirect straight away; a reader's link first shows a
// "you're leaving Ingenium for <host>" page, so the site's name can't front a phishing page.
export async function GET(request: NextRequest, ctx: RouteContext<"/s/[code]">) {
  const code = (await ctx.params).code.toLowerCase();
  const locale = matchLocale(request.headers.get("accept-language"));
  const leave = NextResponse.redirect(new URL(`/${locale}/go/${encodeURIComponent(code)}`, request.url), 302);

  const [row] = await db
    .update(shortLinks)
    .set({ clicks: sql`${shortLinks.clicks} + 1` })
    .where(eq(shortLinks.code, code))
    .returning();
  if (!row) return leave; // the page there says the link doesn't exist

  const [owner] = await db.select({ githubId: users.githubId }).from(users).where(eq(users.id, row.userId)).limit(1);
  const trusted = isAdminGithubId(owner?.githubId);
  // Checked again on the way out, whatever ended up in the database.
  const checked = checkLinkUrl(row.url);
  if (!trusted || "error" in checked) return leave;

  const res = NextResponse.redirect(checked.url, 302);
  res.headers.set("Cache-Control", "private, no-store");
  res.headers.set("X-Robots-Tag", "noindex");
  return res;
}
