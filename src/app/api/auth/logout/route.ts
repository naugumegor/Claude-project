import { NextResponse, type NextRequest } from "next/server";
import { destroySession, safeNext } from "@/lib/session";

export async function POST(request: NextRequest) {
  // Only our own pages may sign a visitor out.
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) return new NextResponse("Forbidden", { status: 403 });
  await destroySession();
  const form = await request.formData().catch(() => null);
  const next = safeNext(form?.get("next")?.toString(), "/");
  return NextResponse.redirect(new URL(next, request.url), 303);
}
