import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { and, desc, eq, inArray, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { commentReports, comments, materialTexts, materials, news, ownerSettings, reactions, userDocuments, users } from "@/db/schema";
import type { Locale } from "@/lib/i18n";
import { ADMIN_GITHUB_ID, devBypass } from "@/lib/session";
import { REACTIONS, type ReactionKind, type Target, type TargetType } from "@/lib/discussion-shared";

// Comments and reactions under materials, readers' documents and news posts.
// Thread reads are per request (they depend on who is looking); the home page feed is cached
// under the "comments" tag, which every change to a published comment refreshes.

export const isAdminGithubId = (githubId: string | null | undefined) =>
  githubId === ADMIN_GITHUB_ID || (devBypass && githubId === "dev");

/** Spam markers that send a comment to review instead of straight onto the page. Swearing is fine. */
const STOP_WORDS = [
  /казино|casino|ставк[аиу] на спорт|букмекер|betting|1xbet|vulkan casino/i,
  /криптовалют|cryptocurrency|bitcoin|биткоин|usdt|airdrop|forex|форекс/i,
  /заработ\S* (от|до|без)|пассивн\S* доход|earn \$?\d+|make money|free money/i,
  /viagra|виагр|cialis|эскорт|escort|onlyfans|(?<!\p{L})xxx|porn|(?<!\p{L})порн/iu,
  /t\.me\/|wa\.me\/|telegram\.me\/|bit\.ly|tinyurl|кредит без справок|микрозайм/i,
];

export const looksLikeSpam = (text: string) => STOP_WORDS.some((re) => re.test(text));

const MODERATE_ALL_KEY = "comments.moderateAll";

export async function getModerateAll() {
  const [row] = await db.select().from(ownerSettings).where(eq(ownerSettings.key, MODERATE_ALL_KEY)).limit(1);
  return row?.value === true;
}

export async function setModerateAll(value: boolean) {
  await db
    .insert(ownerSettings)
    .values({ key: MODERATE_ALL_KEY, value })
    .onConflictDoUpdate({ target: ownerSettings.key, set: { value, updatedAt: new Date() } });
}

/** True when the target exists and the public can see it, so nobody comments on drafts or made-up ids. */
export async function targetIsPublic({ type, id }: Target) {
  const table = { material: materials, doc: userDocuments, news }[type];
  const [row] = await db
    .select({ id: table.id })
    .from(table)
    .where(and(eq(table.id, id), eq(table.status, "published")))
    .limit(1);
  return Boolean(row);
}

export type ThreadComment = {
  id: number;
  parentId: number | null;
  authorId: number;
  author: string;
  byAdmin: boolean;
  body: string;
  status: "published" | "pending" | "hidden" | "deleted";
  createdAt: string;
  edited: boolean;
  likes: number;
  liked: boolean;
};

/**
 * The comments a viewer may see under one target: everything published, the viewer's own
 * comments still waiting for review (the admin sees all of those), and placeholders for
 * deleted comments that still have visible replies.
 */
export async function loadThread(target: Target, viewer: { id: number; admin: boolean } | null) {
  const visible = viewer?.admin
    ? inArray(comments.status, ["published", "pending", "deleted"])
    : viewer
      ? or(
          inArray(comments.status, ["published", "deleted"]),
          and(eq(comments.status, "pending"), eq(comments.userId, viewer.id)),
        )
      : inArray(comments.status, ["published", "deleted"]);

  const rows = await db
    .select({ c: comments, author: users.name, githubId: users.githubId })
    .from(comments)
    .innerJoin(users, eq(comments.userId, users.id))
    .where(and(eq(comments.targetType, target.type), eq(comments.targetId, target.id), visible))
    .orderBy(comments.createdAt)
    .limit(500);

  const ids = rows.map((r) => r.c.id);
  const likeRows = ids.length
    ? await db
        .select({
          id: reactions.targetId,
          n: sql<number>`count(*)::int`,
          mine: viewer ? sql<boolean>`bool_or(${reactions.userId} = ${viewer.id})` : sql<boolean>`false`,
        })
        .from(reactions)
        .where(and(eq(reactions.targetType, "comment"), inArray(reactions.targetId, ids)))
        .groupBy(reactions.targetId)
    : [];
  const likes = new Map(likeRows.map((r) => [r.id, r]));

  const list: ThreadComment[] = rows.map(({ c, author, githubId }) => ({
    id: c.id,
    parentId: c.parentId,
    authorId: c.userId,
    author: author || "—",
    byAdmin: isAdminGithubId(githubId),
    body: c.status === "deleted" ? "" : c.body,
    status: c.status,
    createdAt: c.createdAt.toISOString(),
    edited: Boolean(c.editedAt),
    likes: likes.get(c.id)?.n ?? 0,
    liked: Boolean(likes.get(c.id)?.mine),
  }));
  // A deleted comment is only worth a placeholder while it holds replies up.
  const withReplies = new Set(list.filter((c) => c.status !== "deleted").map((c) => c.parentId));
  return list.filter((c) => c.status !== "deleted" || withReplies.has(c.id));
}

export async function loadReactions(target: Target, viewerId: number | null) {
  const rows = await db
    .select({
      kind: reactions.kind,
      n: sql<number>`count(*)::int`,
      mine: viewerId ? sql<boolean>`bool_or(${reactions.userId} = ${viewerId})` : sql<boolean>`false`,
    })
    .from(reactions)
    .where(and(eq(reactions.targetType, target.type), eq(reactions.targetId, target.id)))
    .groupBy(reactions.kind);
  const byKind = new Map(rows.map((r) => [r.kind, r]));
  return REACTIONS.map(({ kind }) => ({
    kind: kind as ReactionKind,
    count: byKind.get(kind)?.n ?? 0,
    mine: Boolean(byKind.get(kind)?.mine),
  }));
}

export type FeedItem = {
  id: number;
  author: string;
  byAdmin: boolean;
  body: string;
  createdAt: string;
  title: string;
  href: string;
};

/** "Обсуждают сейчас" on the home page: the latest published comments with where they were written. */
export async function getRecentComments(locale: Locale, limit = 6): Promise<FeedItem[]> {
  "use cache";
  cacheTag("comments", "materials", "news", "user-docs");
  cacheLife("max");
  const rows = await db
    .select({ c: comments, author: users.name, githubId: users.githubId })
    .from(comments)
    .innerJoin(users, eq(comments.userId, users.id))
    .where(eq(comments.status, "published"))
    .orderBy(desc(comments.createdAt))
    .limit(limit * 3);

  const idsOf = (type: TargetType) => [...new Set(rows.filter((r) => r.c.targetType === type).map((r) => r.c.targetId))];
  const [materialRows, docRows, newsRows] = await Promise.all([
    idsOf("material").length
      ? db
          .select({ id: materials.id, slug: materials.slug, lang: materials.lang, locale: materialTexts.locale, title: materialTexts.title })
          .from(materials)
          .innerJoin(materialTexts, eq(materialTexts.materialId, materials.id))
          .where(and(inArray(materials.id, idsOf("material")), eq(materials.status, "published")))
      : [],
    idsOf("doc").length
      ? db
          .select({ id: userDocuments.id, name: userDocuments.name })
          .from(userDocuments)
          .where(and(inArray(userDocuments.id, idsOf("doc")), eq(userDocuments.status, "published")))
      : [],
    idsOf("news").length
      ? db
          .select({ id: news.id, slug: news.slug, titleRu: news.titleRu, titleEn: news.titleEn })
          .from(news)
          .where(and(inArray(news.id, idsOf("news")), eq(news.status, "published")))
      : [],
  ]);

  const where = new Map<string, { title: string; href: string }>();
  // A material's title in the page's language, else in the language it was written in.
  const rank = (m: (typeof materialRows)[number]) => (m.locale === locale ? 2 : m.locale === m.lang ? 1 : 0);
  const best = new Map<number, (typeof materialRows)[number]>();
  for (const m of materialRows) {
    const seen = best.get(m.id);
    if (!seen || rank(m) > rank(seen)) best.set(m.id, m);
  }
  for (const m of best.values()) where.set(`material:${m.id}`, { title: m.title, href: `/${locale}/materials/${m.slug}` });
  for (const d of docRows) where.set(`doc:${d.id}`, { title: d.name, href: `/${locale}/docs/${d.id}` });
  for (const n of newsRows) {
    where.set(`news:${n.id}`, { title: (locale === "en" && n.titleEn) || n.titleRu, href: `/${locale}/news/${n.slug}` });
  }

  return rows
    .flatMap(({ c, author, githubId }) => {
      const place = where.get(`${c.targetType}:${c.targetId}`);
      if (!place) return [];
      return [{
        id: c.id,
        author: author || "—",
        byAdmin: isAdminGithubId(githubId),
        body: c.body,
        createdAt: c.createdAt.toISOString(),
        ...place,
        href: `${place.href}#comment-${c.id}`,
      }];
    })
    .slice(0, limit);
}

/** Comments waiting for the admin, newest first, with a link to where each was written. */
export async function loadReviewQueue() {
  const rows = await db
    .select({ c: comments, author: users.name, authorId: users.id, banned: users.commentBanned })
    .from(comments)
    .innerJoin(users, eq(comments.userId, users.id))
    .where(eq(comments.status, "pending"))
    .orderBy(desc(comments.createdAt))
    .limit(100);
  return rows.map(({ c, author, authorId, banned }) => ({
    id: c.id,
    body: c.body,
    reason: c.reason,
    author: author || "—",
    authorId,
    banned,
    createdAt: c.createdAt.toISOString(),
    target: { type: c.targetType as TargetType, id: c.targetId },
  }));
}

/** Where a comment lives on the site, for links from the admin page and the Telegram bot. */
export async function targetPath(target: Target, locale: Locale) {
  if (target.type === "doc") return `/${locale}/docs/${target.id}`;
  if (target.type === "news") {
    const [row] = await db.select({ slug: news.slug }).from(news).where(eq(news.id, target.id)).limit(1);
    return row ? `/${locale}/news/${row.slug}` : null;
  }
  const [row] = await db.select({ slug: materials.slug }).from(materials).where(eq(materials.id, target.id)).limit(1);
  return row ? `/${locale}/materials/${row.slug}` : null;
}

export type Moderation = "approve" | "hide" | "delete";

/** The admin's decision on a comment, from the admin page or a button in the Telegram bot. */
export async function applyModeration(id: number, decision: Moderation) {
  if (decision === "delete") {
    await db.delete(comments).where(eq(comments.id, id));
    return;
  }
  await db
    .update(comments)
    .set({ status: decision === "approve" ? "published" : "hidden", reason: null })
    .where(eq(comments.id, id));
  // An approved comment starts with a clean slate of reports.
  if (decision === "approve") await db.delete(commentReports).where(eq(commentReports.commentId, id));
}

/** The request's clock, for "5 min ago" and the edit window; call it after the session is read. */
export const requestTime = () => Date.now();

/** Drops the comments and reactions of something that is being deleted (they have no foreign key to it). */
export async function deleteDiscussion(target: Target) {
  await db.delete(comments).where(and(eq(comments.targetType, target.type), eq(comments.targetId, target.id)));
  await db.delete(reactions).where(and(eq(reactions.targetType, target.type), eq(reactions.targetId, target.id)));
}
