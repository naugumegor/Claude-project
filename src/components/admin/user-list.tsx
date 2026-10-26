"use client";

import { useState, useTransition } from "react";
import { Check, KeyRound } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { issueResetLink } from "@/app/[lang]/admin/user-actions";

type Row = { id: number; name: string; email: string | null; github: string | null; created: string };

/** Registered readers, with a button that copies a one-time password reset link. */
export function UserList({
  rows,
  locale,
  labels,
}: {
  rows: Row[];
  locale: Locale;
  labels: { resetLink: string; copied: string; noPassword: string };
}) {
  const [pending, start] = useTransition();
  const [done, setDone] = useState<{ id: number; link: string } | null>(null);
  const issue = (id: number) =>
    start(async () => {
      const link = await issueResetLink(id, locale);
      if (!link) return;
      setDone({ id, link });
      await navigator.clipboard?.writeText(link).catch(() => {});
    });

  return (
    <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
      {rows.map((u) => (
        <li key={u.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
          <span className="min-w-0 flex-1">
            <span className="block truncate font-medium">{u.name || u.email || u.github}</span>
            <span className="block truncate text-xs text-muted">
              {[u.email, u.github && `@${u.github}`, u.created].filter(Boolean).join(" · ")}
            </span>
          </span>
          {u.email ? (
            <button
              type="button"
              disabled={pending}
              onClick={() => issue(u.id)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 text-sm text-muted transition-colors hover:border-accent hover:text-accent disabled:opacity-50"
            >
              {done?.id === u.id ? <Check size={14} /> : <KeyRound size={14} />}
              {done?.id === u.id ? labels.copied : labels.resetLink}
            </button>
          ) : (
            <span className="text-xs text-muted">{labels.noPassword}</span>
          )}
          {done?.id === u.id && (
            <input
              readOnly
              value={done.link}
              onFocus={(e) => e.currentTarget.select()}
              className="w-full rounded-lg border border-line bg-bg/40 px-2.5 py-1.5 font-mono text-xs text-muted outline-none"
            />
          )}
        </li>
      ))}
    </ul>
  );
}
