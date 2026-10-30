"use server";

import { updateTag } from "next/cache";
import { after } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { news } from "@/db/schema";
import { slugify } from "@/lib/slug";
import { requireAdmin } from "@/lib/session";
import { announceNews } from "@/lib/telegram-notify";
import { deleteDiscussion } from "@/lib/discussion";

type Result<T = null> = { ok: true; data: T } | { ok: false; error: string };

export type NewsInput = {
  id?: number;
  titleRu: string;
  titleEn: string;
  bodyRu: string;
  bodyEn: string;
  cover: string;
  pinned: boolean;
  published: boolean;
};

export async function saveNews(input: NewsInput): Promise<Result<{ id: number; slug: string }>> {
  await requireAdmin();
  const titleRu = input.titleRu.trim().slice(0, 200);
  if (!titleRu) return { ok: false, error: "needTitle" };
  const cover = input.cover.trim();
  if (cover && !/^https:\/\//.test(cover) && !cover.startsWith("/uploads/")) return { ok: false, error: "badCover" };

  const [existing] = input.id ? await db.select().from(news).where(eq(news.id, input.id)).limit(1) : [];
  if (input.id && !existing) return { ok: false, error: "notFound" };

  const base = slugify(input.titleEn.trim() || titleRu) || "news";
  let slug = existing?.slug ?? base;
  if (!existing) {
    for (let i = 2; ; i++) {
      const [clash] = await db.select({ id: news.id }).from(news).where(eq(news.slug, slug)).limit(1);
      if (!clash) break;
      slug = `${base}-${i}`;
    }
  }

  const values = {
    slug,
    titleRu,
    titleEn: input.titleEn.trim().slice(0, 200),
    bodyRu: input.bodyRu,
    bodyEn: input.bodyEn,
    cover: cover || null,
    pinned: input.pinned ? 1 : 0,
    status: input.published ? ("published" as const) : ("draft" as const),
    // The first publication sets the date; later edits keep it.
    publishedAt: input.published ? (existing?.publishedAt ?? new Date()) : null,
  };
  const [row] = existing
    ? await db.update(news).set(values).where(eq(news.id, existing.id)).returning()
    : await db.insert(news).values(values).returning();
  updateTag("news");
  if (input.published && !existing?.publishedAt) after(() => announceNews(row.id));
  return { ok: true, data: { id: row.id, slug: row.slug } };
}

export async function deleteNews(id: number): Promise<Result> {
  await requireAdmin();
  await db.delete(news).where(eq(news.id, id));
  await deleteDiscussion({ type: "news", id });
  updateTag("news");
  updateTag("comments");
  return { ok: true, data: null };
}
