"use server";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { updateTag } from "next/cache";
import { del, put } from "@vercel/blob";
import { and, eq, inArray, ne, notInArray } from "drizzle-orm";
import { db } from "@/db";
import {
  materialFiles,
  materialMedia,
  materialTags,
  materialTexts,
  materials,
  media,
  subjects,
  tags,
} from "@/db/schema";
import { hasLocale, locales } from "@/lib/i18n";
import { slugify } from "@/lib/slug";
import { requireAdmin } from "@/lib/session";
import type { MaterialInput } from "./types";
import { isSection } from "@/lib/taxonomy";
import { DOCUMENT_KINDS, documentKind, isDocumentKind } from "@/lib/documents";

type Result<T> = { ok: true; data: T } | { ok: false; error: string };

const TYPES = ["note", "doc", "link", "photo"] as const;

export async function saveMaterial(input: MaterialInput): Promise<Result<{ id: number; slug: string }>> {
  await requireAdmin();

  // Validate everything that came from the browser.
  if (!TYPES.includes(input.type)) return { ok: false, error: "Bad type" };
  if (!hasLocale(input.lang)) return { ok: false, error: "Bad language" };
  const original = input.texts[input.lang];
  if (!original?.title.trim()) return { ok: false, error: "needTitle" };
  if (!input.subjectId && !(input.newSubject?.nameRu.trim() && input.newSubject.nameEn.trim())) {
    return { ok: false, error: "needSubject" };
  }
  const url = input.url?.trim() || null;
  if (url && !/^https?:\/\//i.test(url)) return { ok: false, error: "Link must start with http(s)://" };

  const texts = locales
    .map((locale) => ({ locale, ...input.texts[locale] }))
    .filter((t): t is typeof t & { title: string } => Boolean(t.title?.trim()))
    .map((t) => ({
      locale: t.locale,
      title: t.title.trim(),
      excerpt: (t.excerpt ?? "").trim(),
      body: (t.body ?? "").trim(),
    }));
  const tagNames = [...new Set(input.tags.map((t) => t.trim().toLowerCase()).filter(Boolean))];
  const files = input.files.filter(
    (f) => isDocumentKind(f.kind) && isStoredFile(f.url) && f.name.trim(),
  );

  const saved = await db.transaction(async (tx) => {
    let subjectId = input.subjectId;
    if (!subjectId && input.newSubject) {
      const nameEn = input.newSubject.nameEn.trim();
      const [row] = await tx
        .insert(subjects)
        .values({
          slug: slugify(nameEn) || slugify(input.newSubject.nameRu),
          nameRu: input.newSubject.nameRu.trim(),
          nameEn,
          section: isSection(input.newSubject.section) ? input.newSubject.section : null,
        })
        .onConflictDoUpdate({ target: subjects.slug, set: { nameEn } })
        .returning();
      subjectId = row.id;
    }

    const slug = await uniqueSlug(tx, input.slug || original.title, input.id);
    const values = {
      slug,
      type: input.type,
      lang: input.lang,
      subjectId: subjectId!,
      url,
      status: input.status === "published" ? ("published" as const) : ("draft" as const),
      updatedAt: new Date(),
    };
    const [m] = input.id
      ? await tx.update(materials).set(values).where(eq(materials.id, input.id)).returning()
      : await tx.insert(materials).values(values).returning();
    if (!m) throw new Error("Material not found");

    await tx.delete(materialTexts).where(eq(materialTexts.materialId, m.id));
    await tx.insert(materialTexts).values(texts.map((t) => ({ ...t, materialId: m.id })));

    await tx.delete(materialTags).where(eq(materialTags.materialId, m.id));
    for (const name of tagNames) {
      const [tag] = await tx
        .insert(tags)
        .values({ name })
        .onConflictDoUpdate({ target: tags.name, set: { name } })
        .returning();
      await tx.insert(materialTags).values({ materialId: m.id, tagId: tag.id });
    }

    // Images: keep existing rows (update captions), insert new ones, drop removed ones.
    const previous = await tx
      .select({ id: materialMedia.mediaId, url: media.url })
      .from(materialMedia)
      .innerJoin(media, eq(materialMedia.mediaId, media.id))
      .where(eq(materialMedia.materialId, m.id));
    await tx.delete(materialMedia).where(eq(materialMedia.materialId, m.id));

    const keptIds: number[] = [];
    for (const [position, img] of input.images.entries()) {
      let mediaId = img.id && previous.some((p) => p.id === img.id) ? img.id : undefined;
      if (mediaId) {
        await tx.update(media).set({ alt: img.alt.trim() }).where(eq(media.id, mediaId));
      } else {
        const [row] = await tx
          .insert(media)
          .values({ url: img.src, alt: img.alt.trim(), width: img.width, height: img.height })
          .returning();
        mediaId = row.id;
      }
      keptIds.push(mediaId);
      await tx.insert(materialMedia).values({ materialId: m.id, mediaId, position });
    }

    const removed = previous.filter((p) => !keptIds.includes(p.id));
    if (removed.length > 0) {
      await tx.delete(media).where(inArray(media.id, removed.map((r) => r.id)));
    }

    // Documents: replaced as a list; files that dropped out are deleted from storage.
    const previousFiles = await tx
      .select({ url: materialFiles.url })
      .from(materialFiles)
      .where(eq(materialFiles.materialId, m.id));
    await tx.delete(materialFiles).where(eq(materialFiles.materialId, m.id));
    if (files.length > 0) {
      await tx.insert(materialFiles).values(
        files.map((f, position) => ({
          materialId: m.id,
          url: f.url,
          name: f.name.trim().slice(0, 200),
          kind: f.kind,
          size: Math.max(0, Math.round(f.size) || 0),
          position,
        })),
      );
    }
    const removedFiles = previousFiles.filter((p) => !files.some((f) => f.url === p.url));

    return {
      id: m.id,
      slug: m.slug,
      removedUrls: [...removed.map((r) => r.url), ...removedFiles.map((r) => r.url)],
    };
  });

  await deleteBlobs(saved.removedUrls);
  updateTag("materials");
  return { ok: true, data: { id: saved.id, slug: saved.slug } };
}

export async function deleteMaterial(id: number): Promise<Result<null>> {
  await requireAdmin();
  const images = await db
    .select({ id: media.id, url: media.url })
    .from(materialMedia)
    .innerJoin(media, eq(materialMedia.mediaId, media.id))
    .where(eq(materialMedia.materialId, id));
  const docs = await db
    .select({ url: materialFiles.url })
    .from(materialFiles)
    .where(eq(materialFiles.materialId, id));

  await db.transaction(async (tx) => {
    await tx.delete(materials).where(eq(materials.id, id));
    if (images.length > 0) await tx.delete(media).where(inArray(media.id, images.map((i) => i.id)));
    // Tags nobody uses any more.
    const used = tx.select({ id: materialTags.tagId }).from(materialTags);
    await tx.delete(tags).where(notInArray(tags.id, used));
  });

  await deleteBlobs([...images.map((i) => i.url), ...docs.map((d) => d.url)]);
  updateTag("materials");
  return { ok: true, data: null };
}

/** Stores one (already downscaled) photo. Vercel Blob in production, public/uploads locally. */
export async function uploadImage(form: FormData): Promise<Result<{ url: string }>> {
  await requireAdmin();
  const file = form.get("file");
  if (!(file instanceof File) || !file.type.startsWith("image/")) {
    return { ok: false, error: "Not an image" };
  }
  if (file.size > 4 * 1024 * 1024) return { ok: false, error: "Image is larger than 4 MB" };

  const ext = file.type.split("/")[1]?.replace("jpeg", "jpg") ?? "img";
  const name = `materials/${crypto.randomUUID()}.${ext}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(name, file, { access: "public", contentType: file.type });
    return { ok: true, data: { url: blob.url } };
  }
  if (process.env.VERCEL) return { ok: false, error: "BLOB_READ_WRITE_TOKEN is not set" };

  const target = path.join(process.cwd(), "public", "uploads", name);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, Buffer.from(await file.arrayBuffer()));
  return { ok: true, data: { url: `/uploads/${name}` } };
}

/**
 * Local development only: stores a document in public/uploads. On Vercel the browser
 * uploads documents straight to Blob through /api/upload instead.
 */
export async function uploadDocumentLocal(form: FormData): Promise<Result<{ url: string }>> {
  await requireAdmin();
  if (process.env.VERCEL) return { ok: false, error: "Use direct upload on Vercel" };
  const file = form.get("file");
  const kind = file instanceof File ? documentKind(file) : null;
  if (!(file instanceof File) || !kind) return { ok: false, error: "badFile" };

  const name = `documents/${crypto.randomUUID()}.${DOCUMENT_KINDS[kind].ext}`;
  const target = path.join(process.cwd(), "public", "uploads", name);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, Buffer.from(await file.arrayBuffer()));
  return { ok: true, data: { url: `/uploads/${name}` } };
}


/** Only files we stored ourselves: our Blob store, or local uploads in development. */
function isStoredFile(url: string) {
  return (
    /^https:\/\/[a-z0-9]+\.public\.blob\.vercel-storage\.com\/documents\//i.test(url) ||
    (!process.env.VERCEL && url.startsWith("/uploads/documents/"))
  );
}

/** Reads a page's title, description and preview image from its <meta> tags. */
export async function fetchLinkPreview(
  rawUrl: string,
): Promise<Result<{ title: string; description: string; image: string | null }>> {
  await requireAdmin();
  let url: URL;
  try {
    url = new URL(rawUrl.trim());
    if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error();
  } catch {
    return { ok: false, error: "Bad URL" };
  }

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; IngeniumBot/1.0)", Accept: "text/html" },
      signal: AbortSignal.timeout(8000),
      redirect: "follow",
    });
    const html = (await res.text()).slice(0, 500_000);
    const meta = (key: string) => {
      const re = new RegExp(
        `<meta[^>]+(?:property|name)=["']${key}["'][^>]*content=["']([^"']*)["']|<meta[^>]+content=["']([^"']*)["'][^>]*(?:property|name)=["']${key}["']`,
        "i",
      );
      const m = html.match(re);
      return decode(m?.[1] ?? m?.[2] ?? "");
    };
    const title =
      meta("og:title") || meta("twitter:title") || decode(html.match(/<title[^>]*>([^<]*)/i)?.[1] ?? "");
    const description = meta("og:description") || meta("description") || meta("twitter:description");
    const image = meta("og:image") || meta("twitter:image");
    return {
      ok: true,
      data: {
        title: title.trim(),
        description: description.trim(),
        image: image ? new URL(image, res.url).toString() : null,
      },
    };
  } catch {
    return { ok: false, error: "fetchFailed" };
  }
}

async function uniqueSlug(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  wanted: string,
  ownId?: number,
) {
  const base = slugify(wanted) || "material";
  for (let i = 1; ; i++) {
    const slug = i === 1 ? base : `${base}-${i}`;
    const clash = await tx
      .select({ id: materials.id })
      .from(materials)
      .where(ownId ? and(eq(materials.slug, slug), ne(materials.id, ownId)) : eq(materials.slug, slug))
      .limit(1);
    if (clash.length === 0) return slug;
  }
}

async function deleteBlobs(urls: string[]) {
  const blobs = urls.filter((u) => u.includes(".blob.vercel-storage.com/"));
  if (blobs.length > 0 && process.env.BLOB_READ_WRITE_TOKEN) await del(blobs).catch(() => {});
}

function decode(s: string) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}
