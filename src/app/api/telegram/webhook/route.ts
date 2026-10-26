import { NextResponse, type NextRequest } from "next/server";
import { isWebhookCall } from "@/lib/telegram";
import { handleUpdate } from "@/lib/telegram-bot";

// Telegram calls this for every message and button press sent to the bot. Only requests that
// carry our secret header are real; anything else is somebody pretending to be Telegram.
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  if (!isWebhookCall(request.headers.get("x-telegram-bot-api-secret-token"))) {
    return new NextResponse("Forbidden", { status: 403 });
  }
  try {
    await handleUpdate(await request.json());
  } catch (err) {
    // Still answer 200: otherwise Telegram keeps re-sending the same broken update.
    console.error("Telegram update failed", err);
  }
  return NextResponse.json({ ok: true });
}
