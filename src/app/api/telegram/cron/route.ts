import { NextResponse, type NextRequest } from "next/server";
import { sendReminders } from "@/lib/telegram-notify";

// Vercel Cron (vercel.json) calls this once a day for the daily flashcard. With CRON_SECRET set,
// Vercel sends it as a Bearer token and nobody else gets in; without it, the once-a-day mark on
// every chat still keeps a stranger from sending anything twice.
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new NextResponse("Forbidden", { status: 403 });
  }
  return NextResponse.json(await sendReminders());
}
