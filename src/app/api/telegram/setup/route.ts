import { NextResponse, type NextRequest } from "next/server";
import { getAdmin } from "@/lib/session";
import { siteUrl } from "@/lib/site";
import { botToken, botUsername, ownerLinkToken, tg, webhookSecret } from "@/lib/telegram";
import { commands } from "@/lib/telegram-texts";

// GET /api/telegram/setup — the admin opens this once after setting TELEGRAM_BOT_TOKEN.
// It points the bot's webhook at this site, registers the command menu, and then sends the
// admin to Telegram with a one-time link that makes their chat the owner's inbox.
export async function GET(request: NextRequest) {
  if (!(await getAdmin())) {
    return NextResponse.redirect(new URL(`/api/auth/login?next=/api/telegram/setup`, request.url));
  }
  if (!botToken()) return new NextResponse("TELEGRAM_BOT_TOKEN is not set in Vercel.", { status: 500 });

  const ok = await tg("setWebhook", {
    url: `${siteUrl}/api/telegram/webhook`,
    secret_token: webhookSecret(),
    allowed_updates: ["message", "callback_query"],
    drop_pending_updates: true,
  });
  if (!ok) return new NextResponse("Telegram refused setWebhook: check the token.", { status: 502 });

  await tg("setMyCommands", { commands: commands.ru, language_code: "ru" });
  await tg("setMyCommands", { commands: commands.en });

  const username = await botUsername();
  return NextResponse.redirect(`https://t.me/${username}?start=${ownerLinkToken()}`);
}
