import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { DOCUMENT_KINDS, type DocumentKind } from "@/lib/documents";
import { isOwnBlob } from "@/lib/blob";

/**
 * Streams a stored PDF, HTML document or 3D model from our own domain with headers we control:
 * PDFs open inline, and HTML runs in a CSP sandbox (an opaque origin), so a document's
 * scripts can't touch the site, its cookies or its API.
 */
export async function fileResponse(
  file: { url: string; name: string; kind: DocumentKind },
  { download, cache }: { download: boolean; cache: boolean },
) {
  let body: BodyInit;
  if (file.url.startsWith("/uploads/") && !process.env.VERCEL && !file.url.includes("..")) {
    // Local development: the file lives in public/uploads.
    body = new Uint8Array(await readFile(path.join(process.cwd(), "public", file.url)));
  } else {
    // Only ever stream from our own store, whatever ended up in the database.
    if (!isOwnBlob(file.url, "")) return new Response("Not found", { status: 404 });
    const upstream = await fetch(file.url);
    if (!upstream.ok || !upstream.body) return new Response("Not found", { status: 404 });
    body = upstream.body;
  }

  const headers = new Headers({
    "Content-Type": file.kind === "html" ? "text/html; charset=utf-8" : DOCUMENT_KINDS[file.kind].type,
    "Content-Disposition": `${download ? "attachment" : "inline"}; filename*=UTF-8''${encodeURIComponent(
      `${file.name}.${DOCUMENT_KINDS[file.kind].ext}`,
    )}`,
    "X-Content-Type-Options": "nosniff",
    "Cache-Control": cache ? "public, max-age=300, s-maxage=3600" : "private, no-store",
  });
  if (file.kind === "html") {
    headers.set(
      "Content-Security-Policy",
      "sandbox allow-scripts allow-popups allow-popups-to-escape-sandbox allow-forms allow-modals allow-downloads",
    );
  }
  return new Response(body, { headers });
}
