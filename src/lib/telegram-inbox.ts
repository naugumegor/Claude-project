import "server-only";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { put } from "@vercel/blob";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { materialFiles, materialMedia, materialTags, materialTexts, materials, media, subjects, tags } from "@/db/schema";
import type { DocumentKind } from "@/lib/documents";
import { slugify } from "@/lib/slug";
import { clip } from "@/lib/telegram";

// The owner's chat with the bot works as an inbox: every message becomes a draft material
// under the "Входящие / Inbox" topic, to be finished and published from the admin later.

export type InboxImage = { bytes: Buffer; ext: string; contentType: string; width: number | null; height: number | null };
export type InboxFile = { bytes: Buffer; name: string; kind: DocumentKind; contentType: string };

const URL_RE = /https?:\/\/[^\s<>"]+/i;
const TAG_RE = /(^|\s)#([\p{L}\p{N}_]{2,40})/gu;

/** Turns one Telegram message into a draft. Returns the new material's id and title. */
export async function saveDraft(input: { text: string; image?: InboxImage; file?: InboxFile }) {
  const raw = input.text.trim();
  const tagNames = [...new Set([...raw.matchAll(TAG_RE)].map((m) => m[2].toLowerCase()))];
  const text = raw.replace(TAG_RE, "$1").replace(/[ \t]+\n/g, "\n").trim();
  const url = text.match(URL_RE)?.[0] ?? null;
  const withoutUrl = url ? text.replace(url, "").trim() : text;

  // A file makes a document, a picture with a caption a photo, a link with a few words a link;
  // anything longer is a note.
  const type = input.file ? "doc" : input.image ? "photo" : url && withoutUrl.length < 300 ? "link" : "note";

  const [firstLine = "", ...rest] = (type === "link" ? withoutUrl : text).split("\n");
  const stamp = new Date().toLocaleDateString("ru-RU");
  const title = clip(firstLine.trim(), 120) ||
    (input.file?.name ?? (url ? new URL(url).hostname : `${type === "photo" ? "Фото" : "Заметка"} ${stamp}`));
  const body = rest.join("\n").trim();
  const lang = /[а-яё]/i.test(text || title) ? "ru" : "en";

  const imageUrl = input.image &&
    (await store(`materials/${crypto.randomUUID()}.${input.image.ext}`, input.image.bytes, input.image.contentType));
  const fileUrl = input.file &&
    (await store(`documents/${crypto.randomUUID()}.${input.file.kind === "html" ? "html" : "pdf"}`, input.file.bytes, input.file.contentType));

  return db.transaction(async (tx) => {
    const [inbox] = await tx
      .insert(subjects)
      .values({ slug: "inbox", nameRu: "Входящие", nameEn: "Inbox" })
      .onConflictDoUpdate({ target: subjects.slug, set: { slug: "inbox" } })
      .returning();

    const base = slugify(title) || "draft";
    let slug = base;
    for (let i = 2; ; i++) {
      const [clash] = await tx.select({ id: materials.id }).from(materials).where(eq(materials.slug, slug)).limit(1);
      if (!clash) break;
      slug = `${base}-${i}`;
    }

    const [m] = await tx
      .insert(materials)
      .values({ slug, type, lang, subjectId: inbox.id, url: type === "link" ? url : null, status: "draft" })
      .returning();

    await tx.insert(materialTexts).values({
      materialId: m.id,
      locale: lang,
      title,
      excerpt: clip(body.replace(/\s+/g, " "), 200),
      // A note keeps its link in the text; a link material has it in its own field.
      body: type === "link" ? body : [body, type !== "note" && url ? url : ""].filter(Boolean).join("\n\n"),
    });

    for (const name of tagNames) {
      const [tag] = await tx
        .insert(tags)
        .values({ name })
        .onConflictDoUpdate({ target: tags.name, set: { name } })
        .returning();
      await tx.insert(materialTags).values({ materialId: m.id, tagId: tag.id });
    }

    if (input.image && imageUrl) {
      const [row] = await tx
        .insert(media)
        .values({ url: imageUrl, alt: title, width: input.image.width, height: input.image.height })
        .returning();
      await tx.insert(materialMedia).values({ materialId: m.id, mediaId: row.id, position: 0 });
    }
    if (input.file && fileUrl) {
      await tx.insert(materialFiles).values({
        materialId: m.id,
        url: fileUrl,
        name: input.file.name.slice(0, 200),
        kind: input.file.kind,
        size: input.file.bytes.length,
      });
    }
    return { id: m.id, title };
  });
}

/** The latest drafts, for /drafts. */
export async function latestDrafts(limit = 8) {
  return db
    .select({ id: materials.id, title: materialTexts.title })
    .from(materials)
    .innerJoin(materialTexts, and(eq(materialTexts.materialId, materials.id), eq(materialTexts.locale, materials.lang)))
    .where(eq(materials.status, "draft"))
    .orderBy(desc(materials.createdAt))
    .limit(limit);
}

/** Same storage as admin uploads: Vercel Blob in production, public/uploads locally. */
async function store(name: string, bytes: Buffer, contentType: string) {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    return (await put(name, bytes, { access: "public", contentType })).url;
  }
  if (process.env.VERCEL) throw new Error("BLOB_READ_WRITE_TOKEN is not set");
  const target = path.join(process.cwd(), "public", "uploads", name);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, bytes);
  return `/uploads/${name}`;
}
