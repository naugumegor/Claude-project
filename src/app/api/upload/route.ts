import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { getAdmin } from "@/lib/session";

// Hands the admin's browser a short-lived token to upload a document straight to
// Vercel Blob, so big PDFs never pass through a function (which caps bodies at ~4.5 MB).
export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody;
  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        if (!(await getAdmin())) throw new Error("Not authorized");
        if (!pathname.startsWith("documents/")) throw new Error("Bad path");
        return {
          allowedContentTypes: ["application/pdf", "text/html"],
          maximumSizeInBytes: 100 * 1024 * 1024,
          addRandomSuffix: true,
        };
      },
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
