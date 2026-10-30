"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, ExternalLink, Undo2, X } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { reviewUserDocument } from "@/app/[lang]/account/doc-actions";
import { kindLabel, type DocumentKind } from "@/lib/documents";

type Row = { id: number; name: string; description: string; author: string; kind: DocumentKind; status: string };

/** Readers' documents waiting for (or past) review, with approve / decline buttons. */
export function DocReview({
  rows,
  locale,
  labels,
}: {
  rows: Row[];
  locale: Locale;
  labels: { approve: string; reject: string; unpublish: string; view: string };
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const act = (id: number, decision: "approve" | "reject") =>
    start(async () => {
      await reviewUserDocument(id, decision);
      router.refresh();
    });

  return (
    <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
      {rows.map((d) => (
        <li key={d.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
          <span className="min-w-0 flex-1">
            <span className="block truncate font-medium">{d.name}</span>
            <span className="block truncate text-xs text-muted">
              {d.author} · {kindLabel(d.kind, locale)}
              {d.description && ` · ${d.description}`}
            </span>
          </span>
          <a
            href={`/${locale}/docs/${d.id}`}
            target="_blank"
            rel="noreferrer"
            aria-label={labels.view}
            className="rounded-lg p-2 text-muted transition-colors hover:text-accent"
          >
            <ExternalLink size={16} />
          </a>
          {d.status === "published" ? (
            <button
              type="button"
              disabled={pending}
              onClick={() => act(d.id, "reject")}
              className="inline-flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 text-sm text-muted transition-colors hover:border-rose hover:text-rose disabled:opacity-50"
            >
              <Undo2 size={14} />
              {labels.unpublish}
            </button>
          ) : (
            <>
              <button
                type="button"
                disabled={pending}
                onClick={() => act(d.id, "reject")}
                className="inline-flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 text-sm text-muted transition-colors hover:border-rose hover:text-rose disabled:opacity-50"
              >
                <X size={14} />
                {labels.reject}
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => act(d.id, "approve")}
                className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-2.5 py-1.5 text-sm font-medium text-accent-ink transition-transform hover:-translate-y-0.5 disabled:opacity-50"
              >
                <Check size={14} />
                {labels.approve}
              </button>
            </>
          )}
        </li>
      ))}
    </ul>
  );
}
