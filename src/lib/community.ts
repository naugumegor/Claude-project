import { cacheLife, cacheTag } from "next/cache";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { news, userDocuments, users } from "@/db/schema";
import type { Locale } from "@/lib/i18n";
import type { DocumentKind } from "@/lib/documents";

// Public, cached reads of readers' published documents and of news posts. Every change calls
// updateTag("user-docs") or updateTag("news"), so the home page and /news update at once.

export type PublicUserDoc = {
  id: number;
  name: string;
  description: string;
  kind: DocumentKind;
  author: string;
  publishedAt: string;
};

export async function getPublishedUserDocs(limit = 6): Promise<PublicUserDoc[]> {
  "use cache";
  cacheTag("user-docs");
  cacheLife("max");
  const rows = await db
    .select({ doc: userDocuments, author: users.name })
    .from(userDocuments)
    .innerJoin(users, eq(userDocuments.userId, users.id))
    .where(eq(userDocuments.status, "published"))
    .orderBy(desc(userDocuments.publishedAt))
    .limit(limit);
  return rows.map(({ doc, author }) => ({
    id: doc.id,
    name: doc.name,
    description: doc.description,
    kind: doc.kind,
    author,
    publishedAt: (doc.publishedAt ?? doc.createdAt).toISOString(),
  }));
}

export type NewsPost = {
  id: number;
  slug: string;
  title: string;
  body: string;
  cover: string | null;
  pinned: boolean;
  publishedAt: string;
  /** True when the post has no text in the requested language and falls back to Russian. */
  fallback: boolean;
};

type NewsRow = typeof news.$inferSelect;

export function localizeNews(row: NewsRow, locale: Locale): NewsPost {
  const en = locale === "en" && row.titleEn.trim() !== "";
  return {
    id: row.id,
    slug: row.slug,
    title: en ? row.titleEn : row.titleRu,
    body: en ? row.bodyEn : row.bodyRu,
    cover: row.cover,
    pinned: row.pinned > 0,
    publishedAt: (row.publishedAt ?? row.createdAt).toISOString(),
    fallback: locale === "en" && !en,
  };
}

export async function getNews(locale: Locale): Promise<NewsPost[]> {
  "use cache";
  cacheTag("news");
  cacheLife("max");
  const rows = await db
    .select()
    .from(news)
    .where(eq(news.status, "published"))
    .orderBy(desc(news.pinned), desc(news.publishedAt));
  return rows.map((r) => localizeNews(r, locale));
}

export async function getNewsPost(locale: Locale, slug: string): Promise<NewsPost | null> {
  "use cache";
  cacheTag("news");
  cacheLife("max");
  const [row] = await db
    .select()
    .from(news)
    .where(and(eq(news.slug, slug), eq(news.status, "published")))
    .limit(1);
  return row ? localizeNews(row, locale) : null;
}

/** The first lines of a Markdown post as plain text, for cards. */
export function excerpt(md: string) {
  return md
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_`$|-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 220);
}
