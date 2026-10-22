import { NextResponse, type NextRequest } from "next/server";
import { destroySession, safeNext } from "@/lib/session";

export async function POST(request: NextRequest) {
  await destroySession();
  const form = await request.formData().catch(() => null);
  const next = safeNext(form?.get("next")?.toString(), "/");
  return NextResponse.redirect(new URL(next, request.url), 303);
}
