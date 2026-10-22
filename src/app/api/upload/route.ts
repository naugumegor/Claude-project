import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { getAdmin, getUser } from "@/lib/session";
import { DOCUMENT_KINDS } from "@/lib/documents";
import { USER_DOC_MAX_BYTES } from "@/lib/user-docs-shared";

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
