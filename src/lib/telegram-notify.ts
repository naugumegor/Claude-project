import "server-only";
import { and, eq, isNull, ne, or } from "drizzle-orm";
import { db } from "@/db";
import { comments, materials, news, telegramChats, users } from "@/db/schema";
import { loadMaterials } from "@/db/queries";
import { getMaterials } from "@/lib/materials";
import { hasLocale, type Locale } from "@/lib/i18n";
import { localize } from "@/lib/content";
import { siteUrl } from "@/lib/site";
import { targetPath } from "@/lib/discussion";
import type { TargetType } from "@/lib/discussion-shared";
import { parseCards } from "@/lib/study";
import { botToken, clip, escapeHtml, tgRaw } from "@/lib/telegram";
import { texts } from "@/lib/telegram-texts";

// What the bot sends on its own: new materials and news, and the daily flashcard.

type Chat = typeof telegramChats.$inferSelect;

export const chatLocale = (chat: Pick<Chat, "locale">): Locale => (hasLocale(chat.locale) ? chat.locale : "ru");

/** Sends a message; forgets the chat when the user has blocked the bot or deleted the chat. */
export async function send(chatId: string, text: string, extra: Record<string, unknown> = {}) {
  const res = await tgRaw("sendMessage", { chat_id: chatId, text, parse_mode: "HTML", ...extra });
  if (res && !res.ok && (res.error_code === 403 || /chat not found/i.test(res.description))) {
    await db.delete(telegramChats).where(eq(telegramChats.chatId, chatId));
  }
  return Boolean(res?.ok);
}

/** One message per chat, spaced out to stay under Telegram's ~30 messages a second. */
async function broadcast(chats: Chat[], message: (locale: Locale) => string) {
  for (const chat of chats) {
    await send(chat.chatId, message(chatLocale(chat)));
    await new Promise((r) => setTimeout(r, 50));
  }
}

/**
 * Tells subscribers about a material the first time it is published. The UPDATE claims the
 * announcement, so saving the same material twice, or two saves at once, never send it twice.
 */
export async function announceMaterial(id: number) {
  if (!botToken()) return;
  const claimed = await db
    .update(materials)
    .set({ announcedAt: new Date() })
    .where(and(eq(materials.id, id), eq(materials.status, "published"), isNull(materials.announcedAt)))
    .returning();
  if (claimed.length === 0) return;

  const [material] = await loadMaterials({ id });
  if (!material) return;
  const chats = await db.select().from(telegramChats).where(eq(telegramChats.notify, true));
  await broadcast(chats, (locale) => {
    const m = localize(material, locale);
    const lines = [texts[locale].newMaterial, `<b>${escapeHtml(m.title)}</b>`];
    if (m.excerpt) lines.push(escapeHtml(clip(m.excerpt, 300)));
    if (m.tags.length) lines.push(m.tags.map((t) => `#${t.replace(/[^\p{L}\p{N}_]/gu, "_")}`).join(" "));
    lines.push(`\n<a href="${siteUrl}/${locale}/materials/${m.slug}">${texts[locale].open}</a>`);
    return lines.join("\n");
  });
}

/** Same for a news post; saveNews calls it only on the post's first publication. */
export async function announceNews(id: number) {
  if (!botToken()) return;
  const [post] = await db.select().from(news).where(and(eq(news.id, id), eq(news.status, "published")));
  if (!post) return;
  const chats = await db.select().from(telegramChats).where(eq(telegramChats.notify, true));
  await broadcast(chats, (locale) => {
    const title = (locale === "en" && post.titleEn) || post.titleRu;
    const body = (locale === "en" && post.bodyEn) || post.bodyRu;
    const plain = body.replace(/[#*_`>[\]()!]/g, "").replace(/\s+/g, " ").trim();
    return [
      texts[locale].newNews,
      `<b>${escapeHtml(title)}</b>`,
      escapeHtml(clip(plain, 300)),
      `\n<a href="${siteUrl}/${locale}/news/${post.slug}">${texts[locale].open}</a>`,
    ].join("\n");
  });
}

type Card = { front: string; back: string; title: string; slug: string };

/** Every ```cards line from the published notes, in the chat's language where translated. */
async function allCards(locale: Locale): Promise<Card[]> {
  const list = await getMaterials(locale);
  return list.flatMap((m) =>
    [...(m.body ?? "").matchAll(/```cards[^\n]*\n([\s\S]*?)```/g)].flatMap((block) =>
      parseCards(block[1]).map((c) => ({ front: c.front, back: c.back, title: m.title, slug: m.slug })),
    ),
  );
}

function pick<T>(items: T[], n: number) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}

function formatCard(card: Card, locale: Locale) {
  return (
    `❓ <b>${escapeHtml(card.front)}</b>\n<tg-spoiler>${escapeHtml(card.back)}</tg-spoiler>\n` +
    `<a href="${siteUrl}/${locale}/materials/${card.slug}">${escapeHtml(card.title)}</a>`
  );
}

const cardButtons = (locale: Locale) => ({
  reply_markup: {
    inline_keyboard: [
      [
        { text: texts[locale].more, callback_data: "card" },
        { text: texts[locale].remindStop, callback_data: "remind:off" },
      ],
    ],
  },
  link_preview_options: { is_disabled: true },
});

/** A single random card, for /card and the "Another card" button. */
export async function sendCard(chatId: string, locale: Locale) {
  const [card] = pick(await allCards(locale), 1);
  if (!card) return send(chatId, texts[locale].noCards);
  return send(chatId, formatCard(card, locale), cardButtons(locale));
}

/**
 * The daily review: three random cards to every chat that wants them. Each chat is claimed for
 * today before sending, so a cron run that fires twice (or a stranger hitting the URL) sends nothing new.
 */
export async function sendReminders() {
  const today = new Date().toISOString().slice(0, 10);
  const chats = await db
    .update(telegramChats)
    .set({ remindedOn: today })
    .where(
      and(
        eq(telegramChats.remind, true),
        or(isNull(telegramChats.remindedOn), ne(telegramChats.remindedOn, today)),
      ),
    )
    .returning();

  const cards: Partial<Record<Locale, Card[]>> = {};
  let sent = 0;
  for (const chat of chats) {
    const locale = chatLocale(chat);
    cards[locale] ??= await allCards(locale);
    const today3 = pick(cards[locale], 3);
    if (today3.length === 0) continue;
    const text = [texts[locale].reminder, ...today3.map((c) => formatCard(c, locale))].join("\n\n");
    if (await send(chat.chatId, text, cardButtons(locale))) sent++;
    await new Promise((r) => setTimeout(r, 50));
  }
  return { chats: chats.length, sent };
}

/**
 * Tells the owner's chat about a reader's comment. One that waits for review comes with
 * Approve / Hide buttons; a published one only with Hide, in case it slipped through.
 */
export async function notifyOwnerComment(id: number) {
  if (!botToken()) return;
  const [owner] = await db.select().from(telegramChats).where(eq(telegramChats.isOwner, true)).limit(1);
  if (!owner) return;
  const [row] = await db
    .select({ c: comments, author: users.name })
    .from(comments)
    .innerJoin(users, eq(comments.userId, users.id))
    .where(eq(comments.id, id))
    .limit(1);
  if (!row || (row.c.status !== "pending" && row.c.status !== "published")) return;
  const locale = chatLocale(owner);
  const t = texts[locale];
  const path = await targetPath({ type: row.c.targetType as TargetType, id: row.c.targetId }, locale);
  const pending = row.c.status === "pending";
  const reason = row.c.reason ? t[`reason_${row.c.reason}` as keyof typeof t] : null;
  const lines = [
    pending ? t.commentPending : t.commentNew,
    `<b>${escapeHtml(row.author || "—")}</b>${reason ? ` <i>· ${escapeHtml(reason)}</i>` : ""}`,
    escapeHtml(clip(row.c.body, 600)),
  ];
  if (path) lines.push(`\n<a href="${siteUrl}${path}#comment-${id}">${t.open}</a>`);
  const buttons = pending
    ? [{ text: t.approve, callback_data: `cm:approve:${id}` }, { text: t.hide, callback_data: `cm:hide:${id}` }]
    : [{ text: t.hide, callback_data: `cm:hide:${id}` }];
  await send(owner.chatId, lines.join("\n"), {
    link_preview_options: { is_disabled: true },
    reply_markup: { inline_keyboard: [buttons] },
  });
}
