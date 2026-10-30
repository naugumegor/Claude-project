"use client";

import { useOptimistic, useTransition } from "react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { toggleReaction } from "@/app/[lang]/discussion-actions";
import { REACTIONS, type ReactionKind, type TargetType } from "@/lib/discussion-shared";

type Count = { kind: ReactionKind; count: number; mine: boolean };

/** 👍 🔥 🤯 ❓ under a material: one tap each, counts update before the server answers. */
export function ReactionBar({
  target,
  initial,
  labels,
  loginHref,
  disabled,
}: {
  target: { type: TargetType; id: number };
  initial: Count[];
  labels: Record<ReactionKind, string>;
  /** Set when nobody is signed in: a tap goes to the sign-in page. */
  loginHref: string | null;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [counts, flip] = useOptimistic(initial, (state, kind: ReactionKind) =>
    state.map((c) => (c.kind === kind ? { ...c, mine: !c.mine, count: c.count + (c.mine ? -1 : 1) } : c)),
  );
  const [, start] = useTransition();

  const onTap = (kind: ReactionKind) => {
    if (loginHref) return router.push(loginHref);
    start(async () => {
      flip(kind);
      const result = await toggleReaction(target.type, target.id, kind);
      if (result === null) router.push(loginHref ?? "/");
      else router.refresh();
    });
  };

  return (
    <div className="flex flex-wrap gap-2">
      {REACTIONS.map(({ kind, emoji }) => {
        const c = counts.find((x) => x.kind === kind)!;
        return (
          <motion.button
            key={kind}
            type="button"
            disabled={disabled}
            onClick={() => onTap(kind)}
            whileTap={{ scale: 0.9 }}
            aria-pressed={c.mine}
            className={`group inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm transition-[background-color,border-color,color,box-shadow] duration-300 disabled:opacity-50 ${
              c.mine
                ? "border-accent bg-accent-soft font-semibold text-accent shadow-[0_8px_22px_-14px_var(--accent)]"
                : "border-line bg-surface text-muted hover:border-accent hover:text-ink"
            }`}
          >
            <motion.span
              key={String(c.mine)}
              initial={{ scale: c.mine ? 0.5 : 1 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 12 }}
              className="inline-block transition-transform group-hover:scale-125"
            >
              {emoji}
            </motion.span>
            {labels[kind]}
            {c.count > 0 && <span className="tabular-nums">· {c.count}</span>}
          </motion.button>
        );
      })}
    </div>
  );
}
