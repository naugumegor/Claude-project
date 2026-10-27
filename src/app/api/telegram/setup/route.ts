import { NextResponse, type NextRequest } from "next/server";
import { getAdmin } from "@/lib/session";
import { siteUrl } from "@/lib/site";
import { botToken, botUsername, ownerLinkToken, tg, tgRaw, webhookSecret } from "@/lib/telegram";
import { commands } from "@/lib/telegram-texts";

// GET /api/telegram/setup — the admin opens this once after setting TELEGRAM_BOT_TOKEN.
// It points the bot's webhook at this site, registers the command menu, and then sends the
// admin to Telegram with a one-time link that makes their chat the owner's inbox.
export async function GET(request: NextRequest) {
  if (!(await getAdmin())) {
    return NextResponse.redirect(new URL(`/api/auth/login?next=/api/telegram/setup`, request.url));
  }
  if (!process.env.TELEGRAM_BOT_TOKEN) return text("TELEGRAM_BOT_TOKEN is not set in Vercel.", 500);
  if (!botToken()) {
    return text("TELEGRAM_BOT_TOKEN doesn't look like a bot token. It should be like 123456789:AAH… (digits, colon, ~35 characters).", 500);
  }

  const res = await tgRaw("setWebhook", {
    url: `${siteUrl}/api/telegram/webhook`,
    secret_token: webhookSecret(),
    allowed_updates: ["message", "callback_query"],
    drop_pending_updates: true,
  });
  if (!res?.ok) {
    // 404 / 401 from Telegram mean it doesn't know this token at all.
    const unknown = res && (res.error_code === 404 || res.error_code === 401);
    return text(
      unknown
        ? "Telegram doesn't know this token. In @BotFather: /mybots → your bot → API Token, copy it again into TELEGRAM_BOT_TOKEN and redeploy."
        : `Telegram refused setWebhook: ${res ? `${res.error_code} ${res.description}` : "no answer"}`,
      502,
    );
  }

  await tg("setMyCommands", { commands: commands.ru, language_code: "ru" });
  await tg("setMyCommands", { commands: commands.en });

  const username = await botUsername();
  return NextResponse.redirect(`https://t.me/${username}?start=${ownerLinkToken()}`);
}

const text = (body: string, status: number) =>
  new NextResponse(body, { status, headers: { "Content-Type": "text/plain; charset=utf-8" } });
