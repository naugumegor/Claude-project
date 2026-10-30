"use server";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { updateTag } from "next/cache";
import { del } from "@vercel/blob";
import { and, count, eq } from "drizzle-orm";
import { db } from "@/db";
import { userDocuments } from "@/db/schema";
import { requireAdmin, requireUser } from "@/lib/session";
import { documentKind, fileFormat, isDocumentKind, typeFitsKind } from "@/lib/documents";
import { USER_DOC_MAX_BYTES, USER_DOC_MAX_COUNT } from "@/lib/user-docs-shared";
import { blobInfo, isOwnBlob } from "@/lib/blob";
import { deleteDiscussion } from "@/lib/discussion";

// "Мои документы": a reader's own files. Everything is checked against the signed-in user,
// so nobody can touch another reader's documents by sending a different id.

type Result<T = null> = { ok: true; data: T } | { ok: false; error: string };

/** Only files stored in this user's own folder: our Blob store, or public/uploads locally. */
function isOwnFile(url: string, userId: number) {
  return (
    isOwnBlob(url, `user-docs/${userId}/`) ||
    (!process.env.VERCEL && url.startsWith(`/uploads/user-docs/${userId}/`) && !url.includes(".."))
  );
}

/** Local development only; on Vercel the browser uploads straight to Blob via /api/upload. */
export async function uploadUserDocLocal(form: FormData): Promise<Result<{ url: string }>> {
  const user = await requireUser();
  if (process.env.VERCEL) return { ok: false, error: "failed" };
  const file = form.get("file");
  const kind = file instanceof File ? documentKind(file) : null;
  if (!(file instanceof File) || !kind) return { ok: false, error: "badType" };
  if (file.size > USER_DOC_MAX_BYTES) return { ok: false, error: "tooBig" };
  const name = `user-docs/${user.id}/${crypto.randomUUID()}.${fileFormat(kind, file).ext}`;
  const target = path.join(process.cwd(), "public", "uploads", name);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, Buffer.from(await file.arrayBuffer()));
  return { ok: true, data: { url: `/uploads/${name}` } };
}

export async function addUserDocument(input: {
  name: string;
  description: string;
  url: string;
  kind: string;
  size: number;
}): Promise<Result<{ id: number }>> {
  const user = await requireUser();
  const name = input.name.trim().slice(0, 120);
  if (!name) return { ok: false, error: "failed" };
  if (!isDocumentKind(input.kind) || !isOwnFile(input.url, user.id)) return { ok: false, error: "badType" };
  let size = Math.max(0, Math.round(input.size) || 0);
  if (isOwnBlob(input.url, "user-docs/")) {
    // Size and type as stored, not as the browser reports them.
    const info = await blobInfo(input.url);
    if (!info || !typeFitsKind(input.kind, info.contentType)) return { ok: false, error: "badType" };
    if (info.size > USER_DOC_MAX_BYTES) return { ok: false, error: "tooBig" };
    size = info.size;
  }
  const [{ n }] = await db.select({ n: count() }).from(userDocuments).where(eq(userDocuments.userId, user.id));
  if (n >= USER_DOC_MAX_COUNT) return { ok: false, error: "failed" };
  const [row] = await db
    .insert(userDocuments)
    .values({
      userId: user.id,
      name,
      description: input.description.trim().slice(0, 400),
      url: input.url,
      kind: input.kind,
      size,
    })
    .returning();
  return { ok: true, data: { id: row.id } };
}

/** Suggest a document for the home page (it goes to review) or take it back down. */
export async function setUserDocPublic(id: number, wanted: boolean): Promise<Result> {
  const user = await requireUser();
  const [doc] = await db
    .select({ status: userDocuments.status })
    .from(userDocuments)
    .where(and(eq(userDocuments.id, id), eq(userDocuments.userId, user.id)))
    .limit(1);
  if (!doc) return { ok: false, error: "failed" };
  await db
    .update(userDocuments)
    .set(wanted ? { status: "pending" } : { status: "private", publishedAt: null })
    .where(eq(userDocuments.id, id));
  if (doc.status === "published") updateTag("user-docs");
  return { ok: true, data: null };
}

export async function deleteUserDocument(id: number): Promise<Result> {
  const user = await requireUser();
  const [doc] = await db
    .delete(userDocuments)
    .where(and(eq(userDocuments.id, id), eq(userDocuments.userId, user.id)))
    .returning();
  if (!doc) return { ok: false, error: "failed" };
  if (doc.url.includes(".blob.vercel-storage.com/") && process.env.BLOB_READ_WRITE_TOKEN) {
    await del(doc.url).catch(() => {});
  }
  await deleteDiscussion({ type: "doc", id });
  if (doc.status === "published") updateTag("user-docs");
  return { ok: true, data: null };
}

/** Admin: approve a suggested document for the home page, decline it, or take it down. */
export async function reviewUserDocument(id: number, decision: "approve" | "reject"): Promise<Result> {
  await requireAdmin();
  await db
    .update(userDocuments)
    .set(decision === "approve" ? { status: "published", publishedAt: new Date() } : { status: "rejected", publishedAt: null })
    .where(eq(userDocuments.id, id));
  updateTag("user-docs");
  return { ok: true, data: null };
}
