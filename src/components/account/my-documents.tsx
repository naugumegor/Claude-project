"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { upload } from "@vercel/blob/client";
import { AnimatePresence, motion } from "motion/react";
import { Box, ExternalLink, FileCode, FileText, Home, ImageIcon, Loader2, Trash2, Undo2, Upload } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { DOCUMENT_ACCEPT, documentKind, fileFormat, kindLabel, stripExt, type DocumentKind } from "@/lib/documents";
import { normalizeUpload } from "@/lib/heic";
import { USER_DOC_MAX_BYTES } from "@/lib/user-docs-shared";
import { slugify } from "@/lib/slug";
import { formatDate } from "@/lib/format";
import {
  addUserDocument,
  deleteUserDocument,
  setUserDocPublic,
  uploadUserDocLocal,
} from "@/app/[lang]/account/doc-actions";

export type MyDoc = {
  id: number;
  name: string;
  description: string;
  kind: DocumentKind;
  size: number;
  status: "private" | "pending" | "published" | "rejected";
  createdAt: string;
};

type Labels = {
  lead: string;
  upload: string;
  name: string;
  description: string;
  file: string;
  limit: string;
  empty: string;
  open: string;
  delete: string;
  confirmDelete: string;
  publish: string;
  withdraw: string;
  status: Record<MyDoc["status"], string>;
  uploading: string;
  tooBig: string;
  badType: string;
  failed: string;
};

const ICONS = { pdf: FileText, html: FileCode, model: Box, image: ImageIcon };
const TONES = {
  pdf: "bg-rose-soft text-rose",
  html: "bg-plum-soft text-plum",
  model: "bg-accent-soft text-accent",
  image: "bg-ochre-soft text-ochre",
};
const STATUS_TONES = {
  private: "bg-surface-2 text-muted",
  pending: "bg-ochre-soft text-ochre",
  published: "bg-accent-soft text-accent",
  rejected: "bg-rose-soft text-rose",
};

const mb = (bytes: number, locale: Locale) =>
  bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} ${locale === "ru" ? "КБ" : "KB"}`
    : `${(bytes / 1024 / 1024).toLocaleString(locale, { maximumFractionDigits: 1 })} ${locale === "ru" ? "МБ" : "MB"}`;

export function MyDocuments({
  docs,
  labels,
  locale,
  userId,
  directUpload,
}: {
  docs: MyDoc[];
  labels: Labels;
  locale: Locale;
  userId: number;
  directUpload: boolean;
}) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const input = useRef<HTMLInputElement>(null);

  const pick = (f: File | undefined) => {
    setError(null);
    if (!f) return;
    if (!documentKind(f)) return setError(labels.badType);
    if (f.size > USER_DOC_MAX_BYTES) return setError(labels.tooBig);
    setFile(f);
    if (!name) setName(stripExt(f.name));
  };

  const submit = async () => {
    if (!file) return;
    const kind = documentKind(file)!;
    setError(null);
    setProgress(0);
    try {
      // iPhone photos (HEIC) become JPEG first, so every browser can show them.
      const ready = await normalizeUpload(file);
      const format = fileFormat(kind, ready);
      let url: string;
      if (directUpload) {
        const blob = await upload(`user-docs/${userId}/${slugify(name) || "document"}.${format.ext}`, ready, {
          access: "public",
          handleUploadUrl: "/api/upload",
          contentType: format.type,
          multipart: ready.size > 8 * 1024 * 1024,
          onUploadProgress: ({ percentage }) => setProgress(percentage),
        });
        url = blob.url;
      } else {
        const form = new FormData();
        form.append("file", ready);
        const res = await uploadUserDocLocal(form);
        if (!res.ok) throw new Error(labels[res.error as "tooBig" | "badType"] ?? labels.failed);
        url = res.data.url;
      }
      const res = await addUserDocument({ name: name || file.name, description, url, kind, size: ready.size });
      if (!res.ok) throw new Error(labels[res.error as "badType"] ?? labels.failed);
      setFile(null);
      setName("");
      setDescription("");
      if (input.current) input.current.value = "";
      router.refresh();
    } catch (e) {
      setError(e instanceof Error && e.message ? e.message : labels.failed);
    }
    setProgress(null);
  };

  const act = (fn: () => Promise<{ ok: boolean }>) =>
    startTransition(async () => {
      const res = await fn();
      if (!res.ok) setError(labels.failed);
      router.refresh();
    });

  return (
    <div>
      <p className="mb-5 max-w-2xl text-sm text-muted">{labels.lead}</p>

      <div className="rounded-2xl border border-dashed border-line bg-surface p-4">
        <label
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            pick(e.dataTransfer.files[0]);
          }}
          className="group flex cursor-pointer items-center gap-3 rounded-xl bg-surface-2/60 px-4 py-3 transition-colors hover:bg-accent-soft"
        >
          <span className="flex size-10 items-center justify-center rounded-xl bg-accent-soft text-accent transition-transform group-hover:-translate-y-0.5">
            <Upload size={18} />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium">{file ? file.name : labels.file}</span>
            <span className="block text-xs text-muted">{file ? mb(file.size, locale) : labels.limit}</span>
          </span>
          <input
            ref={input}
            type="file"
            accept={DOCUMENT_ACCEPT}
            className="sr-only"
            onChange={(e) => pick(e.target.files?.[0])}
          />
        </label>
        <AnimatePresence initial={false}>
          {file && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={labels.name}
                  maxLength={120}
                  className="rounded-xl border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
                />
                <input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={labels.description}
                  maxLength={400}
                  className="rounded-xl border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
                />
              </div>
              <button
                type="button"
                onClick={submit}
                disabled={progress !== null || !name.trim()}
                className="mt-3 inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-accent-ink transition-transform hover:-translate-y-0.5 disabled:opacity-60"
              >
                {progress !== null ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
                {progress !== null ? `${labels.uploading} ${Math.round(progress)}%` : labels.upload}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        {error && <p className="mt-2 text-sm text-rose">{error}</p>}
      </div>

      {docs.length === 0 ? (
        <p className="mt-6 text-sm text-muted">{labels.empty}</p>
      ) : (
        <ul className="mt-6 grid gap-3">
          {docs.map((d) => {
            const Icon = ICONS[d.kind];
            const shared = d.status === "pending" || d.status === "published";
            return (
              <motion.li
                key={d.id}
                layout
                className="group flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-surface p-3 transition-colors hover:border-accent/50"
              >
                <span className={`flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl transition-transform group-hover:scale-105 ${TONES[d.kind]}`}>
                  {d.kind === "image" ? (
                    // eslint-disable-next-line @next/next/no-img-element -- a private file, not for the image optimizer
                    <img src={`/api/user-files/${d.id}`} alt="" loading="lazy" className="size-full object-cover" />
                  ) : (
                    <Icon size={18} />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{d.name}</span>
                  <span className="block truncate text-xs text-muted">
                    {d.description ? `${d.description} · ` : ""}
                    {kindLabel(d.kind, locale)} · {mb(d.size, locale)} · {formatDate(d.createdAt, locale)}
                  </span>
                </span>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_TONES[d.status]}`}>{labels.status[d.status]}</span>
                <span className="flex items-center gap-1">
                  <a
                    href={`/${locale}/docs/${d.id}`}
                    className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs text-muted transition-colors hover:bg-accent-soft hover:text-accent"
                  >
                    <ExternalLink size={14} />
                    {labels.open}
                  </a>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => act(() => setUserDocPublic(d.id, !shared))}
                    className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs text-muted transition-colors hover:bg-ochre-soft hover:text-ochre disabled:opacity-50"
                  >
                    {shared ? <Undo2 size={14} /> : <Home size={14} />}
                    {shared ? labels.withdraw : labels.publish}
                  </button>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => window.confirm(labels.confirmDelete) && act(() => deleteUserDocument(d.id))}
                    aria-label={labels.delete}
                    title={labels.delete}
                    className="rounded-lg p-1.5 text-muted transition-colors hover:bg-rose-soft hover:text-rose disabled:opacity-50"
                  >
                    <Trash2 size={14} />
                  </button>
                </span>
              </motion.li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
