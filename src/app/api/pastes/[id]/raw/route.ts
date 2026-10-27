import type { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { pastes } from "@/db/schema";

// A paste as plain text, for curl/wget and "save as". Sandboxed and never sniffed as HTML.
export async function GET(request: NextRequest, ctx: RouteContext<"/api/pastes/[id]/raw">) {
  const id = (await ctx.params).id.toLowerCase();
  const [paste] = await db.select().from(pastes).where(eq(pastes.id, id)).limit(1);
  if (!paste || (paste.expiresAt && paste.expiresAt < new Date())) return new Response("Not found", { status: 404 });

  const name = `${paste.title.replace(/[^\p{L}\p{N} _.-]/gu, "").trim() || paste.id}.txt`;
  return new Response(paste.body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `${request.nextUrl.searchParams.has("download") ? "attachment" : "inline"}; filename*=UTF-8''${encodeURIComponent(name)}`,
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "sandbox",
      "X-Robots-Tag": "noindex",
      "Cache-Control": "private, no-store",
    },
  });
}
