"use client";

import { useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Check, EyeOff, Flag, Pencil, Reply, ThumbsUp, Trash2 } from "lucide-react";
import type { Dictionary } from "@/dictionaries";
import {
  deleteComment,
  editComment,
  moderateComment,
  reportComment,
  toggleReaction,
} from "@/app/[lang]/discussion-actions";
import { COMMENT_MAX, type TargetType } from "@/lib/discussion-shared";
import { CommentForm } from "./comment-form";

export type DiscussionLabels = Dictionary["discussion"];

export type CommentView = {
  id: number;
  author: string;
  initial: string;
  byAdmin: boolean;
  /** Raw Markdown, for the edit box. */
  raw: string;
  status: "published" | "pending" | "hidden" | "deleted";
  when: string;
  edited: boolean;
  likes: number;
  liked: boolean;
  own: boolean;
  canEdit: boolean;
};

const AVATAR_TONES = ["bg-ochre", "bg-plum", "bg-rose", "bg-accent"];

/** One comment with its buttons; the rendered Markdown comes from the server as `body`. */
export function CommentItem({
  comment: c,
  body,
  target,
  replyTo,
  viewer,
  labels,
  loginHref,
  children,
}: {
  comment: CommentView;
  body: ReactNode;
  target: { type: TargetType; id: number };
  /** Top comment id this one's replies attach to; null hides the Reply button. */
  replyTo: number | null;
  viewer: { signedIn: boolean; admin: boolean; banned: boolean };
  labels: DiscussionLabels;
  loginHref: string;
  children?: ReactNode;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<"view" | "edit" | "reply">("view");
  const [draft, setDraft] = useState(c.raw);
  const [error, setError] = useState<string | null>(null);
  const [reported, setReported] = useState(false);
  const [liked, setLiked] = useState(c.liked);
  const [pending, start] = useTransition();
  const likes = c.likes + (liked === c.liked ? 0 : liked ? 1 : -1);

  const run = (fn: () => Promise<unknown>) =>
    start(async () => {
      setError(null);
      const result = (await fn()) as { ok?: boolean; error?: keyof DiscussionLabels["errors"] } | undefined;
      if (result && result.ok === false && result.error) setError(labels.errors[result.error]);
      router.refresh();
    });

  const tone = c.byAdmin ? "bg-accent" : AVATAR_TONES[c.author.length % AVATAR_TONES.length];
  const deleted = c.status === "deleted";
  const action =
    "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 transition-colors hover:bg-surface-2 hover:text-ink disabled:opacity-50";

  return (
    <motion.li
      id={`comment-${c.id}`}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="scroll-mt-24 target:[&>div]:bg-accent-soft/60"
    >
      <div className="flex gap-3 rounded-xl p-2 transition-colors">
        <span
          className={`flex size-9 shrink-0 items-center justify-center rounded-xl font-display text-sm font-bold text-white ${deleted ? "bg-line" : tone}`}
          aria-hidden
        >
          {deleted ? "·" : c.initial}
        </span>
        <div className="min-w-0 flex-1">
          {deleted ? (
            <p className="py-1.5 text-sm italic text-muted">{labels.deleted}</p>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm">
                <span className="font-semibold">{c.author}</span>
                {c.byAdmin && (
                  <span className="rounded-full bg-accent px-2 py-px text-[11px] font-semibold text-accent-ink">
                    {labels.author}
                  </span>
                )}
                <span className="text-muted">
                  {c.when}
                  {c.edited && ` · ${labels.edited}`}
                </span>
                {c.status === "pending" && (
                  <span className="rounded-full bg-ochre-soft px-2 py-px text-[11px] font-semibold text-ochre">
                    {viewer.admin && !c.own ? labels.pendingAdmin : labels.pending}
                  </span>
                )}
              </div>

              {mode === "edit" ? (
                <div className="mt-2">
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    maxLength={COMMENT_MAX}
                    rows={3}
                    className="block w-full resize-y rounded-xl border border-line bg-surface px-3 py-2 text-[15px] outline-none focus:border-accent"
                  />
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() =>
                        run(async () => {
                          const r = await editComment(c.id, draft);
                          if (r.ok) setMode("view");
                          return r;
                        })
                      }
                      className="rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-accent-ink disabled:opacity-50"
                    >
                      {labels.save}
                    </button>
                    <button type="button" onClick={() => setMode("view")} className="rounded-lg px-3 py-1.5 text-sm text-muted hover:text-ink">
                      {labels.cancel}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-1">{body}</div>
              )}

              <div className="mt-1.5 flex flex-wrap items-center gap-1 text-[13px] text-muted">
                {c.status === "published" && (
                  <button
                    type="button"
                    disabled={pending || c.own || viewer.banned}
                    aria-pressed={liked}
                    aria-label={labels.like}
                    onClick={() => {
                      if (!viewer.signedIn) return router.push(loginHref);
                      setLiked(!liked);
                      run(() => toggleReaction("comment", c.id, "like"));
                    }}
                    className={`${action} ${liked ? "text-accent" : ""}`}
                  >
                    <ThumbsUp size={13} className={liked ? "fill-accent/30" : ""} />
                    {likes > 0 && <span className="tabular-nums">{likes}</span>}
                  </button>
                )}
                {replyTo !== null && c.status === "published" && !viewer.banned && (
                  <button
                    type="button"
                    onClick={() => (viewer.signedIn ? setMode(mode === "reply" ? "view" : "reply") : router.push(loginHref))}
                    className={action}
                  >
                    <Reply size={13} />
                    {labels.reply}
                  </button>
                )}
                {c.canEdit && mode !== "edit" && (
                  <button type="button" onClick={() => { setDraft(c.raw); setMode("edit"); }} className={action}>
                    <Pencil size={13} />
                    {labels.edit}
                  </button>
                )}
                {c.own && (
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => confirm(labels.confirmDelete) && run(() => deleteComment(c.id))}
                    className={`${action} hover:text-rose`}
                  >
                    <Trash2 size={13} />
                    {labels.delete}
                  </button>
                )}
                {viewer.signedIn && !c.own && !viewer.admin && c.status === "published" && (
                  <button
                    type="button"
                    disabled={pending || reported}
                    onClick={() => {
                      setReported(true);
                      run(() => reportComment(c.id));
                    }}
                    className={`${action} hover:text-rose`}
                  >
                    <Flag size={13} />
                    {reported ? labels.reported : labels.report}
                  </button>
                )}
                {viewer.admin && !c.own && (
                  <>
                    {c.status === "pending" && (
                      <button type="button" disabled={pending} onClick={() => run(() => moderateComment(c.id, "approve"))} className={`${action} text-accent`}>
                        <Check size={13} />
                        {labels.approve}
                      </button>
                    )}
                    <button type="button" disabled={pending} onClick={() => run(() => moderateComment(c.id, "hide"))} className={`${action} hover:text-rose`}>
                      <EyeOff size={13} />
                      {labels.hide}
                    </button>
                  </>
                )}
              </div>
              {error && <p className="mt-1 text-sm text-rose">{error}</p>}
            </>
          )}
        </div>
      </div>

      {(children || mode === "reply") && (
        <ul className="ml-[22px] space-y-1 border-l-2 border-line pl-4 sm:ml-[26px] sm:pl-5">
          {children}
          {mode === "reply" && replyTo !== null && (
            <li className="py-2">
              <CommentForm target={target} parentId={replyTo} labels={labels} autoFocus onDone={() => setMode("view")} />
            </li>
          )}
        </ul>
      )}
    </motion.li>
  );
}
