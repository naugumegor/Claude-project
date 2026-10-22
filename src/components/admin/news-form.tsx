"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Eye, Loader2, Pencil, Save, Trash2 } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { Markdown } from "@/components/markdown";
import { deleteNews, saveNews, type NewsInput } from "@/app/[lang]/admin/news-actions";

type Labels = {
  titleRu: string;
  titleEn: string;
  bodyRu: string;
  bodyEn: string;
  cover: string;
  pinned: string;
  published: string;
  save: string;
  saved: string;
  delete: string;
  confirmDelete: string;
  preview: string;
  edit: string;
  needTitle: string;
  badCover: string;
};

const FIELD = "w-full rounded-xl border border-line bg-surface px-3 py-2 outline-none transition-colors focus:border-accent";

/** The admin's news editor: both languages, Markdown with a live preview, pin and publish. */
export function NewsForm({ initial, labels, locale }: { initial: NewsInput; labels: Labels; locale: Locale }) {
  const router = useRouter();
  const [v, setV] = useState(initial);
  const [tab, setTab] = useState<Locale>("ru");
  const [preview, setPreview] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();
  const set = <K extends keyof NewsInput>(k: K) => (value: NewsInput[K]) => setV((p) => ({ ...p, [k]: value }));
  const bodyKey = tab === "ru" ? "bodyRu" : "bodyEn";

  const save = () =>
    start(async () => {
      const res = await saveNews(v);
      if (!res.ok) {
        setMessage({ ok: false, text: labels[res.error as "needTitle" | "badCover"] ?? res.error });
        return;
      }
      setMessage({ ok: true, text: labels.saved });
      if (!v.id) {
        setV((p) => ({ ...p, id: res.data.id }));
        router.replace(`/${locale}/admin/news?id=${res.data.id}`);
      }
      router.refresh();
    });

  return (
    <div className="grid gap-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-sm">
          <span className="text-muted">{labels.titleRu}</span>
          <input value={v.titleRu} onChange={(e) => set("titleRu")(e.target.value)} className={`${FIELD} font-display text-lg font-bold`} />
        </label>
        <label className="grid gap-1 text-sm">
          <span className="text-muted">{labels.titleEn}</span>
          <input value={v.titleEn} onChange={(e) => set("titleEn")(e.target.value)} className={`${FIELD} font-display text-lg font-bold`} />
        </label>
      </div>
      <label className="grid gap-1 text-sm">
        <span className="text-muted">{labels.cover}</span>
        <input value={v.cover} onChange={(e) => set("cover")(e.target.value)} placeholder="https://…" className={FIELD} />
      </label>

      <div className="rounded-2xl border border-line bg-surface">
        <div className="flex flex-wrap items-center gap-1 border-b border-line px-2 py-1.5">
          {(["ru", "en"] as const).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setTab(l)}
              className={`rounded-lg px-3 py-1 text-sm font-medium ${tab === l ? "bg-accent-soft text-accent" : "text-muted hover:text-ink"}`}
            >
              {l === "ru" ? labels.bodyRu : labels.bodyEn}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPreview((p) => !p)}
            className="ml-auto inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-sm text-muted hover:text-ink"
          >
            {preview ? <Pencil size={14} /> : <Eye size={14} />}
            {preview ? labels.edit : labels.preview}
          </button>
        </div>
        {preview ? (
          <div className="px-5 py-4">
            <Markdown locale={tab}>{v[bodyKey] || "…"}</Markdown>
          </div>
        ) : (
          <textarea
            value={v[bodyKey]}
            onChange={(e) => set(bodyKey)(e.target.value)}
            rows={16}
            className="block w-full resize-y rounded-b-2xl bg-surface px-4 py-3 font-mono text-sm leading-relaxed outline-none"
          />
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" checked={v.pinned} onChange={(e) => set("pinned")(e.target.checked)} className="size-4 accent-[var(--accent)]" />
          {labels.pinned}
        </label>
        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" checked={v.published} onChange={(e) => set("published")(e.target.checked)} className="size-4 accent-[var(--accent)]" />
          {labels.published}
        </label>
        <span className="ml-auto flex items-center gap-2">
          {message && <span className={`text-sm ${message.ok ? "text-accent" : "text-rose"}`}>{message.text}</span>}
          {v.id && (
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                window.confirm(labels.confirmDelete) &&
                start(async () => {
                  await deleteNews(v.id!);
                  router.push(`/${locale}/admin`);
                })
              }
              className="inline-flex items-center gap-1.5 rounded-xl border border-line px-3 py-2 text-sm text-muted transition-colors hover:border-rose hover:text-rose"
            >
              <Trash2 size={15} />
              {labels.delete}
            </button>
          )}
          <button
            type="button"
            disabled={pending}
            onClick={save}
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-accent-ink transition-transform hover:-translate-y-0.5 disabled:opacity-60"
          >
            {pending ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {labels.save}
          </button>
        </span>
      </div>
    </div>
  );
}
