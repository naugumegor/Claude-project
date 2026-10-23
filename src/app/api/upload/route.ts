import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { del, list } from "@vercel/blob";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { userDocuments } from "@/db/schema";
import { getAdmin, getUser } from "@/lib/session";
import { DOCUMENT_KINDS } from "@/lib/documents";
import { USER_DOC_MAX_BYTES, USER_DOC_MAX_COUNT, USER_DOC_MAX_TOTAL_BYTES } from "@/lib/user-docs-shared";

// Hands the browser a short-lived token to upload a document straight to Vercel Blob, so big
// PDFs and 3D models never pass through a function (which caps bodies at ~4.5 MB).
// The admin uploads to documents/; any signed-in reader uploads to user-docs/<their id>/.
export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody;
  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        const types = Object.values(DOCUMENT_KINDS).map((k) => k.type);
        if (pathname.startsWith("documents/")) {
          if (!(await getAdmin())) throw new Error("Not authorized");
          return { allowedContentTypes: types, maximumSizeInBytes: 100 * 1024 * 1024, addRandomSuffix: true };
        }
        const user = await getUser();
        if (user && pathname.startsWith(`user-docs/${user.id}/`)) {
          if (!(await hasRoom(user.id))) throw new Error("Storage limit reached");
          return { allowedContentTypes: types, maximumSizeInBytes: USER_DOC_MAX_BYTES, addRandomSuffix: true };
        }
        throw new Error("Not authorized");
      },
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}

/**
 * The reader's quota, counted from what is really in the store (not from the documents list),
 * so uploads that were never added as documents count too. Those leftovers are cleared after
 * an hour, which keeps a failed upload from eating the quota for good.
 */
async function hasRoom(userId: number) {
  const prefix = `user-docs/${userId}/`;
  const { blobs } = await list({ prefix, limit: 1000 });
  const kept = new Set(
    (await db.select({ url: userDocuments.url }).from(userDocuments).where(eq(userDocuments.userId, userId))).map(
      (d) => d.url,
    ),
  );
  const hourAgo = Date.now() - 60 * 60 * 1000;
  const stale = blobs.filter((b) => !kept.has(b.url) && b.uploadedAt.getTime() < hourAgo);
  if (stale.length > 0) await del(stale.map((b) => b.url)).catch(() => {});

  const live = blobs.filter((b) => !stale.includes(b));
  const total = live.reduce((sum, b) => sum + b.size, 0);
  return live.length < USER_DOC_MAX_COUNT && total < USER_DOC_MAX_TOTAL_BYTES;
}
