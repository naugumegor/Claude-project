import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

// Thin client for the Telegram Bot API plus the secrets the bot relies on. Everything here is
// derived from TELEGRAM_BOT_TOKEN, so the token is the only variable that has to be set.

/**
 * The token itself ("123456789:AAH…"), even when the variable was pasted with extra text around
 * it: quotes, a "bot" prefix or BotFather's whole "Use this token…" line.
 */
export const botToken = () => process.env.TELEGRAM_BOT_TOKEN?.match(/\d{5,}:[\w-]{30,}/)?.[0] ?? null;

type ApiResult<T> = { ok: true; result: T } | { ok: false; error_code: number; description: string };

/** Calls a Bot API method. Returns null (and logs) when the bot is not configured or Telegram refuses. */
export async function tg<T = unknown>(method: string, params: Record<string, unknown> = {}): Promise<T | null> {
  const res = await tgRaw<T>(method, params);
  return res?.ok ? res.result : null;
}

/** Like `tg`, but hands back Telegram's error too (e.g. 403 when the user blocked the bot). */
export async function tgRaw<T = unknown>(method: string, params: Record<string, unknown> = {}) {
  const token = botToken();
  if (!token) return null;
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
      signal: AbortSignal.timeout(10_000),
    });
    const data = (await res.json()) as ApiResult<T>;
    if (!data.ok) console.warn(`Telegram ${method}: ${data.error_code} ${data.description}`);
    return data;
  } catch (err) {
    console.warn(`Telegram ${method} failed`, err);
    return null;
  }
}

/** Downloads a file the user sent (the Bot API serves up to 20 MB). */
export async function downloadFile(fileId: string) {
  const token = botToken();
  const file = await tg<{ file_path?: string; file_size?: number }>("getFile", { file_id: fileId });
  if (!token || !file?.file_path) return null;
  const res = await fetch(`https://api.telegram.org/file/bot${token}/${file.file_path}`, {
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) return null;
  return { bytes: Buffer.from(await res.arrayBuffer()), path: file.file_path };
}

let username: string | null = null;

/** The bot's @username, for t.me links. */
export async function botUsername() {
  username ??= (await tg<{ username: string }>("getMe"))?.username ?? null;
  return username;
}

function hmac(purpose: string, data = "") {
  return createHmac("sha256", botToken() ?? "").update(`${purpose}:${data}`).digest("base64url");
}

function same(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

/**
 * Telegram puts this into the X-Telegram-Bot-Api-Secret-Token header of every webhook call,
 * which is how the webhook knows the update really comes from Telegram.
 */
export const webhookSecret = () => process.env.TELEGRAM_WEBHOOK_SECRET?.trim() || hmac("webhook");

export function isWebhookCall(header: string | null) {
  return Boolean(botToken() && header && same(header, webhookSecret()));
}

// Linking the owner's chat: the admin opens /api/telegram/setup, which sends them to
// t.me/<bot>?start=<token>. The token is "o<expiry>_<signature>" (Telegram allows 64 characters
// of [A-Za-z0-9_-]), valid for 15 minutes and useless to anyone who can't sign it.

const LINK_TTL = 15 * 60;

export function ownerLinkToken() {
  const exp = (Math.floor(Date.now() / 1000) + LINK_TTL).toString(36);
  return `o${exp}_${hmac("owner", exp).slice(0, 32)}`;
}

export function isOwnerLinkToken(value: string) {
  const m = /^o([0-9a-z]+)_([\w-]{32})$/.exec(value);
  if (!m || !botToken()) return false;
  if (parseInt(m[1], 36) < Date.now() / 1000) return false;
  return same(m[2], hmac("owner", m[1]).slice(0, 32));
}

export function escapeHtml(text: string) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Cuts text to `max` characters on a word boundary. */
export function clip(text: string, max: number) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  return `${cut.slice(0, cut.lastIndexOf(" ") > max * 0.6 ? cut.lastIndexOf(" ") : max).trimEnd()}…`;
}
