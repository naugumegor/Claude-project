"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Code2, ExternalLink, Link2, Loader2, Scissors, Trash2 } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { formatDate, plural } from "@/lib/format";
import { PASTE_EXPIRY, PASTE_LANGUAGES, PASTE_MAX_BYTES, PASTE_MAX_TITLE } from "@/lib/share";
import { createPaste, createShortLink, deletePaste, deleteShortLink } from "@/app/[lang]/account/share-actions";
import type { Dictionary, PluralForms } from "@/dictionaries";
import { CopyButton } from "./copy-button";

export type MyLink = { id: number; code: string; url: string; clicks: number; createdAt: string; author?: string };
export type MyPaste = { id: string; title: string; language: string; size: number; createdAt: string; expiresAt: string | null; author?: string };

type Labels = Dictionary["share"];

const field = "rounded-xl border border-line bg-surface px-3 py-2 text-sm outline-none transition-colors focus:border-accent";
const iconBtn =
  "rounded-lg p-1.5 text-muted transition-colors hover:bg-rose-soft hover:text-rose disabled:opacity-50";
const linkBtn =
  "inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs text-muted transition-colors hover:bg-accent-soft hover:text-accent";

/** «Ссылки и пасты» in the account: a short-link form, a paste form, and both lists. */
export function MyShares({
  links,
  pastes,
  labels,
  clicks,
  locale,
  everyone,
}: {
  links: MyLink[];
  pastes: MyPaste[];
  labels: Labels;
  clicks: PluralForms;
  locale: Locale;
  /** The admin sees (and can delete) everyone's items. */
  everyone: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [url, setUrl] = useState("");
  const [code, setCode] = useState("");
  const [linkError, setLinkError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [language, setLanguage] = useState<string>("auto");
  const [body, setBody] = useState("");
  const [expires, setExpires] = useState(0);
  const [pasteError, setPasteError] = useState<string | null>(null);
  const errorText = (key: string) => labels.errors[key as keyof Labels["errors"]] ?? labels.errors.failed;

  const shorten = () =>
    startTransition(async () => {
      setLinkError(null);
      const res = await createShortLink({ url, code });
      if (!res.ok) return setLinkError(errorText(res.error));
      setUrl("");
      setCode("");
      router.refresh();
    });

  const paste = () =>
    startTransition(async () => {
      setPasteError(null);
      if (new TextEncoder().encode(body).length > PASTE_MAX_BYTES) return setPasteError(labels.errors.tooBig);
      const res = await createPaste({ title, language, body, expiresHours: expires });
      if (!res.ok) return setPasteError(errorText(res.error));
      router.push(`/${locale}/p/${res.data.id}`);
    });

  const remove = (fn: () => Promise<{ ok: boolean }>) =>
    window.confirm(labels.confirmDelete) &&
    startTransition(async () => {
      await fn();
      router.refresh();
    });

  return (
    <div>
      <p className="mb-5 max-w-2xl text-sm text-muted">{labels.lead}</p>
      {everyone && <p className="mb-5 rounded-xl bg-ochre-soft px-3 py-2 text-xs text-ochre">{labels.everyone}</p>}

      <div className="grid items-start gap-4 xl:grid-cols-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            shorten();
          }}
          className="min-w-0 rounded-2xl border border-dashed border-line bg-surface p-4"
        >
          <h3 className="mb-3 flex items-center gap-2 font-display font-bold">
            <Link2 size={18} className="text-accent" />
            {labels.linkTitle}
          </h3>
          <input value={url} onChange={(e) => setUrl(e.target.value)} type="url" required placeholder={labels.url} maxLength={2048} className={`${field} w-full`} />
          <div className="mt-2 flex gap-2">
            <span className="flex min-w-0 flex-1 items-center rounded-xl border border-line bg-surface pl-3 text-sm text-muted focus-within:border-accent">
              /s/
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.toLowerCase())}
                placeholder={labels.code}
                maxLength={40}
                className="min-w-0 flex-1 bg-transparent py-2 pr-3 text-ink outline-none"
              />
            </span>
            <button
              disabled={pending || !url.trim()}
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-accent-ink transition-transform hover:-translate-y-0.5 disabled:opacity-60"
            >
              {pending ? <Loader2 size={15} className="animate-spin" /> : <Scissors size={15} />}
              {labels.shorten}
            </button>
          </div>
          {linkError && <p className="mt-2 text-sm text-rose">{linkError}</p>}
        </form>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            paste();
          }}
          className="min-w-0 rounded-2xl border border-dashed border-line bg-surface p-4"
        >
          <h3 className="mb-3 flex items-center gap-2 font-display font-bold">
            <Code2 size={18} className="text-plum" />
            {labels.pasteTitle}
          </h3>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={labels.name} maxLength={PASTE_MAX_TITLE} className={`${field} w-full`} />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
            rows={6}
            spellCheck={false}
            placeholder={labels.body}
            className={`${field} mt-2 w-full resize-y font-mono text-[0.8rem]`}
          />
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <select value={language} onChange={(e) => setLanguage(e.target.value)} aria-label={labels.language} className={field}>
              {PASTE_LANGUAGES.map((l) => (
                <option key={l} value={l}>
                  {l === "auto" ? labels.auto : l}
                </option>
              ))}
            </select>
            <select value={expires} onChange={(e) => setExpires(Number(e.target.value))} aria-label={labels.expiry} className={field}>
              {PASTE_EXPIRY.map((h) => (
                <option key={h} value={h}>
                  {labels.expiry}: {labels.expiryOptions[String(h) as keyof Labels["expiryOptions"]]}
                </option>
              ))}
            </select>
            <button
              disabled={pending || !body.trim()}
              className="ml-auto inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-accent-ink transition-transform hover:-translate-y-0.5 disabled:opacity-60"
            >
              {pending ? <Loader2 size={15} className="animate-spin" /> : <Code2 size={15} />}
              {labels.create}
            </button>
          </div>
          <p className="mt-1 text-xs text-muted">{labels.limit}</p>
          {pasteError && <p className="mt-2 text-sm text-rose">{pasteError}</p>}
        </form>
      </div>

      <h3 className="mb-3 mt-8 font-display text-lg font-bold">{labels.links}</h3>
      {links.length === 0 ? (
        <p className="text-sm text-muted">{labels.emptyLinks}</p>
      ) : (
        <ul className="grid grid-cols-1 gap-3">
          <AnimatePresence initial={false}>
            {links.map((l) => (
              <motion.li
                key={l.id}
                layout
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="group flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-surface p-3 transition-colors hover:border-accent/50"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent transition-transform group-hover:scale-105">
                  <Link2 size={18} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-mono text-sm font-medium">/s/{l.code}</span>
                  <span className="block truncate text-xs text-muted">
                    {l.url} · {plural(l.clicks, clicks, locale)} · {formatDate(l.createdAt, locale)}
                    {l.author && ` · ${l.author}`}
                  </span>
                </span>
                <span className="flex items-center gap-1">
                  <CopyButton text={`/s/${l.code}`} label={labels.copy} done={labels.copied} />
                  <button type="button" disabled={pending} onClick={() => remove(() => deleteShortLink(l.id))} aria-label={labels.delete} title={labels.delete} className={iconBtn}>
                    <Trash2 size={14} />
                  </button>
                </span>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}

      <h3 className="mb-3 mt-8 font-display text-lg font-bold">{labels.pastes}</h3>
      {pastes.length === 0 ? (
        <p className="text-sm text-muted">{labels.emptyPastes}</p>
      ) : (
        <ul className="grid grid-cols-1 gap-3">
          <AnimatePresence initial={false}>
            {pastes.map((p) => (
              <motion.li
                key={p.id}
                layout
                exit={{ opacity: 0 }}
                className="group flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-surface p-3 transition-colors hover:border-plum/50"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-plum-soft text-plum transition-transform group-hover:scale-105">
                  <Code2 size={18} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{p.title || labels.untitled}</span>
                  <span className="block truncate text-xs text-muted">
                    {p.language === "auto" ? labels.auto : p.language} · {(p.size / 1024).toLocaleString(locale, { maximumFractionDigits: 1 })}{" "}
                    {locale === "ru" ? "КБ" : "KB"} · {formatDate(p.createdAt, locale)}
                    {p.expiresAt && ` · ${labels.expires} ${formatDate(p.expiresAt, locale)}`}
                    {p.author && ` · ${p.author}`}
                  </span>
                </span>
                <span className="flex items-center gap-1">
                  <a href={`/${locale}/p/${p.id}`} className={linkBtn}>
                    <ExternalLink size={14} />
                    {labels.open}
                  </a>
                  <CopyButton text={`/${locale}/p/${p.id}`} label={labels.copy} done={labels.copied} />
                  <button type="button" disabled={pending} onClick={() => remove(() => deletePaste(p.id))} aria-label={labels.delete} title={labels.delete} className={iconBtn}>
                    <Trash2 size={14} />
                  </button>
                </span>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}
