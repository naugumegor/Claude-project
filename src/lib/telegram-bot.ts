import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { telegramChats } from "@/db/schema";
import { searchMaterials } from "@/db/search";
import { getMaterials } from "@/lib/materials";
import type { Locale } from "@/lib/i18n";
import { siteUrl } from "@/lib/site";
import { documentKind } from "@/lib/documents";
import { downloadFile, escapeHtml, isOwnerLinkToken, tg } from "@/lib/telegram";
import { texts } from "@/lib/telegram-texts";
import { chatLocale, send, sendCard } from "@/lib/telegram-notify";
import { latestDrafts, saveDraft, type InboxFile, type InboxImage } from "@/lib/telegram-inbox";

// Handles one webhook update from Telegram: commands, the owner's notes, and button presses.

type User = { id: number; first_name?: string; username?: string; language_code?: string };
type PhotoSize = { file_id: string; width: number; height: number; file_size?: number };
type Message = {
  chat: { id: number; type: string };
  from?: User;
  text?: string;
  caption?: string;
  photo?: PhotoSize[];
  document?: { file_id: string; file_name?: string; mime_type?: string; file_size?: number };
};
type Update = {
  message?: Message;
  callback_query?: { id: string; from: User; data?: string; message?: { chat: { id: number } } };
};

const MAX_FILE = 20 * 1024 * 1024;

export async function handleUpdate(update: Update) {
  if (update.callback_query) return onButton(update.callback_query);
  const msg = update.message;
  // Private chats only: in a group anyone could post notes or flip settings for everybody.
  if (!msg || msg.chat.type !== "private") return;

  const chat = await ensureChat(String(msg.chat.id), msg.from);
  const locale = chatLocale(chat);
  const t = texts[locale];
  const text = msg.text ?? "";
  const [, command, arg = ""] = /^\/(\w+)(?:@\w+)?\s*([\s\S]*)$/.exec(text) ?? [];

  switch (command?.toLowerCase()) {
    case "start": {
      const payload = arg.trim();
      if (payload.startsWith("o")) {
        if (!isOwnerLinkToken(payload)) return send(chat.chatId, t.linkExpired);
        // One owner at a time: linking a new chat unlinks the old one.
        await db.update(telegramChats).set({ isOwner: false }).where(eq(telegramChats.isOwner, true));
        await db.update(telegramChats).set({ isOwner: true }).where(eq(telegramChats.chatId, chat.chatId));
        return send(chat.chatId, t.ownerWelcome);
      }
      return send(chat.chatId, t.welcome);
    }
    case "help":
      return send(chat.chatId, chat.isOwner ? `${t.welcome}\n\n${t.ownerWelcome}` : t.welcome);
    case "new":
      return sendLatest(chat.chatId, locale);
    case "find":
      return sendSearch(chat.chatId, locale, arg.trim());
    case "card":
      return sendCard(chat.chatId, locale);
    case "notify":
      await setChat(chat.chatId, { notify: !chat.notify });
      return send(chat.chatId, chat.notify ? t.notifyOff : t.notifyOn);
    case "remind":
      await setChat(chat.chatId, { remind: !chat.remind });
      return send(chat.chatId, chat.remind ? t.remindOff : t.remindOn);
    case "lang": {
      const next: Locale = locale === "ru" ? "en" : "ru";
      await setChat(chat.chatId, { locale: next });
      return send(chat.chatId, texts[next].lang);
    }
    case "stop":
      await db.delete(telegramChats).where(eq(telegramChats.chatId, chat.chatId));
      return send(chat.chatId, t.stopped);
    case "drafts":
      if (chat.isOwner) return sendDrafts(chat.chatId, locale);
      return send(chat.chatId, t.unknown);
  }

  if (!chat.isOwner || command) return send(chat.chatId, t.unknown);
  return inbox(chat.chatId, locale, msg);
}

async function onButton(q: NonNullable<Update["callback_query"]>) {
  await tg("answerCallbackQuery", { callback_query_id: q.id });
  if (!q.message) return;
  const chat = await ensureChat(String(q.message.chat.id), q.from);
  const locale = chatLocale(chat);
  if (q.data === "card") return sendCard(chat.chatId, locale);
  if (q.data === "remind:off" && chat.remind) {
    await setChat(chat.chatId, { remind: false });
    return send(chat.chatId, texts[locale].remindOff);
  }
}

/** The chat's row, created on first contact with the language Telegram reports for the user. */
async function ensureChat(chatId: string, from?: User) {
  const locale = /^(ru|uk|be|kk)/.test(from?.language_code ?? "") ? "ru" : "en";
  await db
    .insert(telegramChats)
    .values({ chatId, locale, name: (from?.username ?? from?.first_name ?? "").slice(0, 100) })
    .onConflictDoNothing();
  const [chat] = await db.select().from(telegramChats).where(eq(telegramChats.chatId, chatId));
  return chat;
}

function setChat(chatId: string, values: Partial<typeof telegramChats.$inferInsert>) {
  return db.update(telegramChats).set(values).where(eq(telegramChats.chatId, chatId));
}

const link = (locale: Locale, slug: string, title: string) =>
  `• <a href="${siteUrl}/${locale}/materials/${slug}">${escapeHtml(title)}</a>`;

async function sendLatest(chatId: string, locale: Locale) {
  const list = (await getMaterials(locale)).slice(0, 7);
  if (list.length === 0) return send(chatId, texts[locale].nothing);
  const lines = list.map((m) => `${link(locale, m.slug, m.title)} <i>· ${escapeHtml(m.subjectName)}</i>`);
  return send(chatId, [texts[locale].latest, ...lines].join("\n"), { link_preview_options: { is_disabled: true } });
}

async function sendSearch(chatId: string, locale: Locale, query: string) {
  if (!query) return send(chatId, texts[locale].findUsage);
  const [hits, list] = await Promise.all([searchMaterials(query.slice(0, 200), 6), getMaterials(locale)]);
  const bySlug = new Map(list.map((m) => [m.slug, m]));
  const lines = hits.flatMap((h) => {
    const m = bySlug.get(h.slug);
    return m ? [link(locale, m.slug, m.title)] : [];
  });
  if (lines.length === 0) return send(chatId, texts[locale].notFound);
  return send(chatId, lines.join("\n"), { link_preview_options: { is_disabled: true } });
}

async function sendDrafts(chatId: string, locale: Locale) {
  const drafts = await latestDrafts();
  if (drafts.length === 0) return send(chatId, texts[locale].nothing);
  const lines = drafts.map((d) => `• <a href="${editorUrl(locale, d.id)}">${escapeHtml(d.title)}</a>`);
  return send(chatId, [texts[locale].drafts, ...lines].join("\n"), { link_preview_options: { is_disabled: true } });
}

const editorUrl = (locale: Locale, id: number) => `${siteUrl}/${locale}/admin/editor?id=${id}`;

/** The owner's message → a draft, with its photo or PDF/HTML file if there is one. */
async function inbox(chatId: string, locale: Locale, msg: Message) {
  const t = texts[locale];
  const text = msg.text ?? msg.caption ?? "";
  let image: InboxImage | undefined;
  let file: InboxFile | undefined;

  try {
    if (msg.photo?.length) {
      // Telegram sends several sizes; the last one is the largest.
      const best = msg.photo[msg.photo.length - 1];
      const got = await downloadFile(best.file_id);
      if (!got) return send(chatId, t.badFile);
      image = { bytes: got.bytes, ext: "jpg", contentType: "image/jpeg", width: best.width, height: best.height };
    } else if (msg.document) {
      const doc = msg.document;
      const name = doc.file_name ?? "file";
      const type = doc.mime_type ?? "";
      const imageExt = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif" }[type];
      const kind = documentKind({ type, name });
      if ((doc.file_size ?? 0) > MAX_FILE || (!imageExt && kind !== "pdf" && kind !== "html")) {
        return send(chatId, t.badFile);
      }
      const got = await downloadFile(doc.file_id);
      if (!got) return send(chatId, t.badFile);
      if (imageExt) image = { bytes: got.bytes, ext: imageExt, contentType: type, width: null, height: null };
      else file = { bytes: got.bytes, name, kind: kind as "pdf" | "html", contentType: kind === "pdf" ? "application/pdf" : "text/html" };
    }
    if (!text.trim() && !image && !file) return send(chatId, t.draftEmpty);

    const draft = await saveDraft({ text, image, file });
    return send(chatId, `${t.draftSaved}\n<b>${escapeHtml(draft.title)}</b>\n\n<a href="${editorUrl(locale, draft.id)}">${t.edit}</a>`, {
      link_preview_options: { is_disabled: true },
    });
  } catch (err) {
    console.error("Telegram draft failed", err);
    return send(chatId, t.draftFailed);
  }
}
