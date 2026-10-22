import { readFile } from "node:fs/promises";
import path from "node:path";
import type { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { materialFiles, materials } from "@/db/schema";
import { getAdmin } from "@/lib/session";
import { DOCUMENT_KINDS } from "@/lib/documents";

// Serves an attached PDF, HTML document or 3D model from our own domain with headers we control:
// PDFs open inline, and HTML runs in a CSP sandbox (an opaque origin), so a document's
// scripts can't touch the site, its cookies or its API.
export async function GET(request: NextRequest, ctx: RouteContext<"/api/files/[id]">) {
  const id = Number((await ctx.params).id);
  if (!Number.isInteger(id)) return new Response("Not found", { status: 404 });

  const [row] = await db
    .select({ file: materialFiles, status: materials.status })
    .from(materialFiles)
    .innerJoin(materials, eq(materialFiles.materialId, materials.id))
    .where(eq(materialFiles.id, id))
    .limit(1);
  if (!row || (row.status !== "published" && !(await getAdmin()))) {
    return new Response("Not found", { status: 404 });
  }
  const { file } = row;

  let body: BodyInit;
  if (file.url.startsWith("/uploads/")) {
    // Local development: the file lives in public/uploads.
    body = new Uint8Array(await readFile(path.join(process.cwd(), "public", file.url)));
  } else {
    const upstream = await fetch(file.url);
    if (!upstream.ok || !upstream.body) return new Response("Not found", { status: 404 });
    body = upstream.body;
  }

  const download = request.nextUrl.searchParams.has("download");
  const headers = new Headers({
    "Content-Type": file.kind === "html" ? "text/html; charset=utf-8" : DOCUMENT_KINDS[file.kind].type,
    "Content-Disposition": `${download ? "attachment" : "inline"}; filename*=UTF-8''${encodeURIComponent(
      `${file.name}.${DOCUMENT_KINDS[file.kind].ext}`,
    )}`,
    "X-Content-Type-Options": "nosniff",
    "Cache-Control": row.status === "published" ? "public, max-age=300, s-maxage=3600" : "private, no-store",
  });
  if (file.kind === "html") {
    headers.set(
      "Content-Security-Policy",
      "sandbox allow-scripts allow-popups allow-popups-to-escape-sandbox allow-forms allow-modals allow-downloads",
    );
  }
  return new Response(body, { headers });
}
