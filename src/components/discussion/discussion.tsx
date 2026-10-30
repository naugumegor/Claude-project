import type { ReactNode } from "react";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { LogIn, MessagesSquare } from "lucide-react";
import type { Dictionary } from "@/dictionaries";
import type { Locale } from "@/lib/i18n";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getAdmin, getUser } from "@/lib/session";
import { loadReactions, loadThread, requestTime, type ThreadComment } from "@/lib/discussion";
import { EDIT_WINDOW_MS, timeAgo, type Target } from "@/lib/discussion-shared";
import { CommentBody } from "./comment-body";
import { CommentForm } from "./comment-form";
import { CommentItem, type CommentView } from "./comment-item";
import { ReactionBar } from "./reaction-bar";

/**
 * Reactions and comments under a material, a reader's document or a news post. Reads the
 * session, so render it inside <Suspense>; the rest of the page stays static.
 */
export async function Discussion({
  target,
  path,
  locale,
  dict,
  reactions = true,
}: {
  target: Target;
  /** Current page, to come back here after signing in. */
  path: string;
  locale: Locale;
  dict: Dictionary["discussion"];
  reactions?: boolean;
}) {
  const [user, admin] = await Promise.all([getUser(), getAdmin()]);
  const [me] = user
    ? await db.select({ banned: users.commentBanned }).from(users).where(eq(users.id, user.id)).limit(1)
    : [];
  const viewer = { signedIn: Boolean(user), admin: Boolean(admin), banned: Boolean(me?.banned) };
  const [thread, counts] = await Promise.all([
    loadThread(target, user ? { id: user.id, admin: viewer.admin } : null),
    reactions ? loadReactions(target, user?.id ?? null) : null,
  ]);
  const loginHref = `/${locale}/login?next=${encodeURIComponent(`${path}#discussion`)}`;
  const now = requestTime();

  const view = (c: ThreadComment): CommentView => ({
    id: c.id,
    author: c.author,
    initial: (c.author.trim()[0] ?? "?").toUpperCase(),
    byAdmin: c.byAdmin,
    raw: c.body,
    status: c.status,
    when: timeAgo(c.createdAt, locale, now),
    edited: c.edited,
    likes: c.likes,
    liked: c.liked,
    own: user?.id === c.authorId,
    canEdit:
      user?.id === c.authorId &&
      c.status !== "deleted" &&
      (viewer.admin || now - new Date(c.createdAt).getTime() < EDIT_WINDOW_MS),
  });
  const top = thread.filter((c) => c.parentId === null);
  const repliesOf = (id: number) => thread.filter((c) => c.parentId === id);
  const visibleCount = thread.filter((c) => c.status === "published").length;
  const item = (c: ThreadComment, replyTo: number | null, children?: ReactNode) => (
    <CommentItem
      key={c.id}
      comment={view(c)}
      body={c.body ? <CommentBody>{c.body}</CommentBody> : null}
      target={target}
      replyTo={replyTo}
      viewer={viewer}
      labels={dict}
      loginHref={loginHref}
    >
      {children}
    </CommentItem>
  );

  return (
    <section id="discussion" className="no-print focus-hide mt-16 scroll-mt-24 border-t border-line pt-10">
      {counts && (
        <div className="mb-10">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">{dict.reactionsTitle}</h2>
          <ReactionBar
            target={target}
            initial={counts}
            labels={dict.reactions}
            loginHref={user ? null : loginHref}
            disabled={viewer.banned}
          />
        </div>
      )}

      <h2 className="flex items-center gap-2 font-display text-2xl font-bold tracking-tight">
        <MessagesSquare size={22} className="text-accent" />
        {dict.title}
        {visibleCount > 0 && <span className="text-base font-medium text-muted">{visibleCount}</span>}
      </h2>

      <div className="mt-5">
        {!user ? (
          <Link
            href={loginHref}
            className="group flex items-center justify-between gap-4 rounded-2xl border border-dashed border-line bg-surface/70 px-5 py-4 transition-colors hover:border-accent"
          >
            <span className="text-muted">{dict.signIn}</span>
            <span className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-medium text-accent-ink transition-transform group-hover:-translate-y-0.5">
              <LogIn size={15} />
              {dict.signInLink}
            </span>
          </Link>
        ) : viewer.banned ? (
          <p className="rounded-2xl border border-line bg-surface-2 px-5 py-4 text-sm text-muted">{dict.banned}</p>
        ) : (
          <CommentForm target={target} labels={dict} />
        )}
      </div>

      {top.length === 0 ? (
        <p className="mt-6 text-sm text-muted">{dict.empty}</p>
      ) : (
        <ul className="mt-6 space-y-2">
          {top.map((c) => {
            const replies = repliesOf(c.id);
            return item(c, c.status === "published" ? c.id : null, replies.length ? replies.map((r) => item(r, null)) : undefined);
          })}
        </ul>
      )}
    </section>
  );
}

export function DiscussionSkeleton() {
  return (
    <div className="mt-16 border-t border-line pt-10">
      <div className="flex gap-2">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className="h-9 w-28 animate-pulse rounded-full bg-surface-2" />
        ))}
      </div>
      <div className="mt-10 h-8 w-48 animate-pulse rounded-lg bg-surface-2" />
      <div className="mt-5 h-28 animate-pulse rounded-2xl bg-surface-2" />
    </div>
  );
}
