"use client";

import { useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Ban, Check, ExternalLink, EyeOff, Trash2 } from "lucide-react";
import type { Dictionary } from "@/dictionaries";
import { moderateComment, setCommentBan, setModerateEverything } from "@/app/[lang]/discussion-actions";

type Row = {
  id: number;
  author: string;
  authorId: number;
  banned: boolean;
  body: string;
  reason: string | null;
  when: string;
  href: string | null;
};

/** Comments waiting for review, with approve / hide / delete / ban, and the "review everything" switch. */
export function CommentReview({
  rows,
  banned,
  moderateAll,
  labels,
}: {
  rows: Row[];
  /** Readers banned from commenting, so a ban can be lifted after their comments are gone. */
  banned: { id: number; name: string }[];
  moderateAll: boolean;
  labels: Dictionary["discussion"];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [all, setAll] = useOptimistic(moderateAll);
  const act = (fn: () => Promise<unknown>) =>
    start(async () => {
      await fn();
      router.refresh();
    });
  const button =
    "inline-flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 text-sm text-muted transition-colors disabled:opacity-50";

  return (
    <>
      <label className="mb-3 flex cursor-pointer items-center gap-2.5 text-sm text-muted">
        <input
          type="checkbox"
          checked={all}
          disabled={pending}
          onChange={(e) => {
            const value = e.target.checked;
            act(async () => {
              setAll(value);
              await setModerateEverything(value);
            });
          }}
          className="size-4 accent-[var(--accent)]"
        />
        {labels.moderateAll}
      </label>
      {rows.length === 0 ? (
        <p className="text-sm text-muted">{labels.adminEmpty}</p>
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
          {rows.map((c) => (
            <li key={c.id} className="px-4 py-3">
              <div className="flex flex-wrap items-center gap-x-2 text-sm">
                <span className="font-semibold">{c.author}</span>
                <span className="text-muted">{c.when}</span>
                {c.reason && (
                  <span className="rounded-full bg-ochre-soft px-2 py-px text-[11px] font-semibold text-ochre">
                    {labels.reasons[c.reason as keyof typeof labels.reasons] ?? c.reason}
                  </span>
                )}
                {c.href && (
                  <a href={c.href} target="_blank" rel="noreferrer" aria-label={labels.open} className="ml-auto rounded-lg p-1.5 text-muted hover:text-accent">
                    <ExternalLink size={15} />
                  </a>
                )}
              </div>
              <p className="mt-1 whitespace-pre-wrap break-words text-[15px]">{c.body}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => act(() => moderateComment(c.id, "approve"))}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-2.5 py-1.5 text-sm font-medium text-accent-ink transition-transform hover:-translate-y-0.5 disabled:opacity-50"
                >
                  <Check size={14} />
                  {labels.approve}
                </button>
                <button type="button" disabled={pending} onClick={() => act(() => moderateComment(c.id, "hide"))} className={`${button} hover:border-ochre hover:text-ochre`}>
                  <EyeOff size={14} />
                  {labels.hide}
                </button>
                <button type="button" disabled={pending} onClick={() => act(() => moderateComment(c.id, "delete"))} className={`${button} hover:border-rose hover:text-rose`}>
                  <Trash2 size={14} />
                  {labels.remove}
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => act(() => setCommentBan(c.authorId, !c.banned))}
                  className={`${button} hover:border-rose hover:text-rose`}
                >
                  <Ban size={14} />
                  {c.banned ? labels.unban : labels.ban}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {banned.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-muted">
          <Ban size={14} />
          {banned.map((u) => (
            <button
              key={u.id}
              type="button"
              disabled={pending}
              onClick={() => act(() => setCommentBan(u.id, false))}
              title={labels.unban}
              className="rounded-full border border-line px-2.5 py-0.5 transition-colors hover:border-accent hover:text-accent disabled:opacity-50"
            >
              {u.name || `#${u.id}`} · {labels.unban}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
