import type { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { userDocuments } from "@/db/schema";
import { getAdmin, getUser } from "@/lib/session";
import { fileResponse } from "@/lib/serve-file";

// A reader's own document: public once it is on the home page, otherwise only for its owner
// and the admin (who reviews it).
export async function GET(request: NextRequest, ctx: RouteContext<"/api/user-files/[id]">) {
  const id = Number((await ctx.params).id);
  if (!Number.isInteger(id)) return new Response("Not found", { status: 404 });

  const [doc] = await db.select().from(userDocuments).where(eq(userDocuments.id, id)).limit(1);
  if (!doc) return new Response("Not found", { status: 404 });
  const published = doc.status === "published";
  if (!published && (await getUser())?.id !== doc.userId && !(await getAdmin())) {
    return new Response("Not found", { status: 404 });
  }
  return fileResponse(doc, { download: request.nextUrl.searchParams.has("download"), cache: published });
}
