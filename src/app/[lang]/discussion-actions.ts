"use server";

import { after } from "next/server";
import { updateTag } from "next/cache";
import { and, count, desc, eq, gt, ne } from "drizzle-orm";
import { db } from "@/db";
import { commentReports, comments, reactions, users } from "@/db/schema";
import { getAdmin, requireAdmin, getUser } from "@/lib/session";
import { applyModeration, getModerateAll, looksLikeSpam, setModerateAll, targetIsPublic, type Moderation } from "@/lib/discussion";
import {
  COMMENTS_PER_DAY,
  COMMENT_GAP_MS,
  COMMENT_MAX,
  COMMENT_MAX_LINKS,
  EDIT_WINDOW_MS,
  LINKS_AFTER_MS,
  REACTIONS,
  REPORTS_TO_HIDE,
  TRUSTED_AFTER,
  countLinks,
  type CommentError,
  type Target,
  type TargetType,
} from "@/lib/discussion-shared";
import { notifyOwnerComment } from "@/lib/telegram-notify";

// Comments and reactions. Every action re-checks the session and the rules on the server:
// the limits in the form are only there to save readers a round trip.

type Result = { ok: true; pending?: boolean } | { ok: false; error: CommentError };

const TARGET_TYPES: TargetType[] = ["material", "doc", "news"];
const isTarget = (t: Target) => TARGET_TYPES.includes(t.type) && Number.isInteger(t.id) && t.id > 0;

/** The signed-in author with what the rules need: account age, ban, admin. */
async function author() {
  const session = await getUser();
  if (!session) return null;
  const [row] = await db
    .select({ id: users.id, createdAt: users.createdAt, banned: users.commentBanned })
    .from(users)
    .where(eq(users.id, session.id))
    .limit(1);
  if (!row) return null;
  return { ...row, admin: Boolean(await getAdmin()) };
}

/** Text rules shared by new comments and edits. */
function checkText(body: string, who: { createdAt: Date; admin: boolean }): CommentError | null {
  if (!body) return "empty";
  if (body.length > COMMENT_MAX) return "tooLong";
  if (who.admin) return null;
  const links = countLinks(body);
  if (links > COMMENT_MAX_LINKS) return "tooManyLinks";
  if (links > 0 && Date.now() - who.createdAt.getTime() < LINKS_AFTER_MS) return "noLinksYet";
  return null;
}

export async function postComment(input: { target: Target; parentId?: number | null; body: string }): Promise<Result> {
  const who = await author();
  if (!who) return { ok: false, error: "signIn" };
  if (who.banned) return { ok: false, error: "banned" };
  const target = { type: input.target.type, id: Number(input.target.id) };
  if (!isTarget(target) || !(await targetIsPublic(target))) return { ok: false, error: "notFound" };

  const body = String(input.body ?? "").replace(/\r\n/g, "\n").trim();
  const textError = checkText(body, who);
  if (textError) return { ok: false, error: textError };

  if (!who.admin) {
    const [last] = await db
      .select({ at: comments.createdAt })
      .from(comments)
      .where(eq(comments.userId, who.id))
      .orderBy(desc(comments.createdAt))
      .limit(1);
    if (last && Date.now() - last.at.getTime() < COMMENT_GAP_MS) return { ok: false, error: "tooFast" };
    const [today] = await db
      .select({ n: count() })
      .from(comments)
      .where(and(eq(comments.userId, who.id), gt(comments.createdAt, new Date(Date.now() - 86_400_000))));
    if (today.n >= COMMENTS_PER_DAY) return { ok: false, error: "dailyLimit" };
  }

  // Replies go one level deep: answering a reply attaches to its top comment.
  let parentId: number | null = null;
  if (input.parentId) {
    const [parent] = await db
      .select({ id: comments.id, parentId: comments.parentId, type: comments.targetType, targetId: comments.targetId })
      .from(comments)
      .where(eq(comments.id, Number(input.parentId)))
      .limit(1);
    if (!parent || parent.type !== target.type || parent.targetId !== target.id) return { ok: false, error: "notFound" };
    parentId = parent.parentId ?? parent.id;
  }

  let reason: string | null = null;
  if (!who.admin) {
    if (await getModerateAll()) reason = "all";
    else if (looksLikeSpam(body)) reason = "words";
    else {
      const [approved] = await db
        .select({ n: count() })
        .from(comments)
        .where(and(eq(comments.userId, who.id), eq(comments.status, "published")));
      if (approved.n < TRUSTED_AFTER) reason = "new";
    }
  }

  const [row] = await db
    .insert(comments)
    .values({ targetType: target.type, targetId: target.id, userId: who.id, parentId, body, status: reason ? "pending" : "published", reason })
    .returning();
  if (!reason) updateTag("comments");
  if (!who.admin) after(() => notifyOwnerComment(row.id));
  return { ok: true, pending: Boolean(reason) };
}

/** Own comments only, within the edit window. Spam words send an edited comment back to review. */
export async function editComment(id: number, text: string): Promise<Result> {
  const who = await author();
  if (!who) return { ok: false, error: "signIn" };
  if (who.banned) return { ok: false, error: "banned" };
  const [c] = await db.select().from(comments).where(and(eq(comments.id, id), eq(comments.userId, who.id))).limit(1);
  if (!c || c.status === "deleted" || c.status === "hidden") return { ok: false, error: "notFound" };
  if (!who.admin && Date.now() - c.createdAt.getTime() > EDIT_WINDOW_MS) return { ok: false, error: "tooLate" };

  const body = String(text ?? "").replace(/\r\n/g, "\n").trim();
  const textError = checkText(body, who);
  if (textError) return { ok: false, error: textError };

  const toReview = !who.admin && c.status === "published" && looksLikeSpam(body);
  await db
    .update(comments)
    .set({ body, editedAt: new Date(), ...(toReview && { status: "pending", reason: "words" }) })
    .where(eq(comments.id, id));
  if (c.status === "published") updateTag("comments");
  if (toReview) after(() => notifyOwnerComment(id));
  return { ok: true, pending: toReview || c.status === "pending" };
}

/**
 * The author removes their comment. One with replies stays as an empty "deleted" placeholder,
 * so the conversation under it still makes sense; otherwise the row goes for good.
 */
export async function deleteComment(id: number): Promise<Result> {
  const who = await author();
  if (!who) return { ok: false, error: "signIn" };
  const [c] = await db.select().from(comments).where(and(eq(comments.id, id), eq(comments.userId, who.id))).limit(1);
  if (!c) return { ok: false, error: "notFound" };
  const [replies] = await db
    .select({ n: count() })
    .from(comments)
    .where(and(eq(comments.parentId, id), ne(comments.status, "deleted")));
  if (replies.n > 0) await db.update(comments).set({ status: "deleted", body: "" }).where(eq(comments.id, id));
  else await db.delete(comments).where(eq(comments.id, id));
  if (c.status === "published") updateTag("comments");
  return { ok: true };
}

/** One report per reader; enough different readers send the comment back to the admin. */
export async function reportComment(id: number): Promise<Result> {
  const who = await author();
  if (!who) return { ok: false, error: "signIn" };
  const [c] = await db.select().from(comments).where(eq(comments.id, id)).limit(1);
  if (!c || c.status !== "published" || c.userId === who.id) return { ok: false, error: "notFound" };
  await db.insert(commentReports).values({ commentId: id, userId: who.id }).onConflictDoNothing();
  const [reports] = await db.select({ n: count() }).from(commentReports).where(eq(commentReports.commentId, id));
  if (reports.n >= REPORTS_TO_HIDE) {
    await db
      .update(comments)
      .set({ status: "pending", reason: "reports" })
      .where(and(eq(comments.id, id), eq(comments.status, "published")));
    updateTag("comments");
    after(() => notifyOwnerComment(id));
  }
  return { ok: true };
}

/**
 * Toggles a reaction on a material, document or news post, or a like on a comment.
 * Returns the new state, or null when nobody is signed in.
 */
export async function toggleReaction(
  type: TargetType | "comment",
  targetId: number,
  kind: string,
): Promise<{ on: boolean } | null> {
  const who = await author();
  if (!who) return null;
  if (who.banned) return { on: false };
  const id = Number(targetId);
  if (type === "comment") {
    if (kind !== "like") return { on: false };
    const [c] = await db.select({ userId: comments.userId, status: comments.status }).from(comments).where(eq(comments.id, id)).limit(1);
    if (!c || c.status !== "published" || c.userId === who.id) return { on: false };
  } else {
    if (!REACTIONS.some((r) => r.kind === kind) || !isTarget({ type, id }) || !(await targetIsPublic({ type, id }))) {
      return { on: false };
    }
  }
  const mine = and(eq(reactions.userId, who.id), eq(reactions.targetType, type), eq(reactions.targetId, id), eq(reactions.kind, kind));
  const removed = await db.delete(reactions).where(mine).returning();
  if (removed.length > 0) return { on: false };
  await db.insert(reactions).values({ userId: who.id, targetType: type, targetId: id, kind }).onConflictDoNothing();
  return { on: true };
}

// ---------- Admin ----------

export async function moderateComment(id: number, decision: Moderation) {
  await requireAdmin();
  await applyModeration(id, decision);
  updateTag("comments");
}

/** A banned reader keeps reading and signing in, but can't comment or react; their pending comments go. */
export async function setCommentBan(userId: number, banned: boolean) {
  await requireAdmin();
  await db.update(users).set({ commentBanned: banned }).where(eq(users.id, userId));
  if (banned) {
    await db
      .update(comments)
      .set({ status: "hidden" })
      .where(and(eq(comments.userId, userId), eq(comments.status, "pending")));
  }
  updateTag("comments");
}

export async function setModerateEverything(value: boolean) {
  await requireAdmin();
  await setModerateAll(value);
}
