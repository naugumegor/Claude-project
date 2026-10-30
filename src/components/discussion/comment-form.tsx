"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { SendHorizontal } from "lucide-react";
import { postComment } from "@/app/[lang]/discussion-actions";
import { COMMENT_MAX, type TargetType } from "@/lib/discussion-shared";
import type { DiscussionLabels } from "./comment-item";

/** New comment, or a reply when `parentId` is set. */
export function CommentForm({
  target,
  parentId,
  labels,
  autoFocus,
  onDone,
}: {
  target: { type: TargetType; id: number };
  parentId?: number;
  labels: DiscussionLabels;
  autoFocus?: boolean;
  onDone?: () => void;
}) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [message, setMessage] = useState<{ tone: "error" | "info"; text: string } | null>(null);
  const [pending, start] = useTransition();
  const ref = useRef<HTMLTextAreaElement>(null);

  const submit = () =>
    start(async () => {
      setMessage(null);
      const result = await postComment({ target, parentId, body });
      if (!result.ok) {
        setMessage({ tone: "error", text: labels.errors[result.error] });
        return;
      }
      setBody("");
      if (result.pending) setMessage({ tone: "info", text: labels.sentPending });
      router.refresh();
      onDone?.();
    });

  const left = COMMENT_MAX - body.length;
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="group/form"
    >
      <div className="rounded-2xl border border-line bg-surface transition-[border-color,box-shadow] duration-300 focus-within:border-accent focus-within:shadow-[0_12px_30px_-20px_var(--accent)]">
        <textarea
          ref={ref}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit();
          }}
          placeholder={parentId ? labels.replyPlaceholder : labels.placeholder}
          maxLength={COMMENT_MAX}
          rows={parentId ? 2 : 3}
          autoFocus={autoFocus}
          className="block w-full resize-y rounded-2xl bg-transparent px-4 py-3 text-[15px] outline-none placeholder:text-muted/80"
        />
        <div className="flex items-center justify-between gap-3 border-t border-line px-3 py-2">
          <span className={`text-xs tabular-nums ${left < 100 ? "text-rose" : "text-muted"}`}>
            {body.length > 0 && left}
          </span>
          <div className="flex items-center gap-2">
            {onDone && (
              <button type="button" onClick={onDone} className="rounded-lg px-3 py-1.5 text-sm text-muted hover:text-ink">
                {labels.cancel}
              </button>
            )}
            <button
              type="submit"
              disabled={pending || body.trim() === ""}
              className="group inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-medium text-accent-ink shadow-[0_8px_20px_-12px_var(--accent)] transition-transform hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-50"
            >
              {pending ? labels.sending : labels.send}
              <SendHorizontal size={15} className="transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </div>
      {message && (
        <p role="status" className={`mt-2 text-sm ${message.tone === "error" ? "text-rose" : "text-accent"}`}>
          {message.text}
        </p>
      )}
    </form>
  );
}
