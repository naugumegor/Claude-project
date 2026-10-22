"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { upload } from "@vercel/blob/client";
import { Box, Check, FileCode, FileText, FileUp, ImagePlus, Loader2, Trash2, Wand2, X } from "lucide-react";
import type { Dictionary } from "@/dictionaries";
import { locales, type Locale } from "@/lib/i18n";
import type { Material, MaterialFile, MaterialImage, MaterialText, MaterialType } from "@/lib/content";
import { slugify } from "@/lib/slug";
import {
  deleteMaterial,
  fetchLinkPreview,
  saveMaterial,
  uploadDocumentLocal,
  uploadImage,
} from "@/app/[lang]/admin/actions";
import { Markdown } from "@/components/markdown";
import { typeMeta } from "@/components/type-meta";
import { sectionMeta } from "@/components/section-icon";
import { SECTIONS, type SectionSlug } from "@/lib/taxonomy";
import { DOCUMENT_ACCEPT, DOCUMENT_KINDS, documentKind } from "@/lib/documents";

type Dict = Dictionary["admin"];
type UploadingImage = MaterialImage & { key: string; uploading?: boolean };
type UploadingFile = MaterialFile & { key: string; progress?: number };

const MAX_DOCUMENT_BYTES = 100 * 1024 * 1024;

const spring = { type: "spring", stiffness: 420, damping: 34 } as const;
const emptyText: MaterialText = { title: "", excerpt: "", body: "" };

export function MaterialForm({
  locale,
  material,
  subjects,
  dict,
  typeNames,
  langNames,
  directUpload,
}: {
  locale: Locale;
  material: Material | null;
  subjects: { id: number; slug: string; name: string; section: SectionSlug }[];
  dict: Dict;
  typeNames: Record<MaterialType, string>;
  langNames: Record<Locale, string>;
  /** Upload documents straight from the browser to Vercel Blob (production). */
  directUpload: boolean;
}) {
  const router = useRouter();
  const f = dict.form;

  const [type, setType] = useState<MaterialType>(material?.type ?? "note");
  const [lang, setLang] = useState<Locale>(material?.lang ?? locale);
  const [published, setPublished] = useState(material ? material.status === "published" : true);
  const [slug, setSlug] = useState(material?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(material));
  const [subjectId, setSubjectId] = useState<number | undefined>(
    material ? subjects.find((s) => s.slug === material.subject.slug)?.id : subjects[0]?.id,
  );
  const [newSubject, setNewSubject] = useState<{
    nameRu: string;
    nameEn: string;
    section: SectionSlug;
  } | null>(null);
  const [url, setUrl] = useState(material?.url ?? "");
  const [tags, setTags] = useState<string[]>(material?.tags ?? []);
  const [tagDraft, setTagDraft] = useState("");
  const [texts, setTexts] = useState<Record<Locale, MaterialText>>({
    ru: { ...emptyText, ...material?.text.ru },
    en: { ...emptyText, ...material?.text.en },
  });
  const [textTab, setTextTab] = useState<Locale>(lang);
  const [preview, setPreview] = useState(false);
  const [images, setImages] = useState<UploadingImage[]>(
    (material?.images ?? []).map((img) => ({ ...img, key: String(img.id ?? img.src) })),
  );
  const [files, setFiles] = useState<UploadingFile[]>(
    (material?.files ?? []).map((f) => ({ ...f, key: String(f.id ?? f.url) })),
  );
  const [error, setError] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [saving, startSaving] = useTransition();
  const fileInput = useRef<HTMLInputElement>(null);
  const docInput = useRef<HTMLInputElement>(null);
  const [draggingDoc, setDraggingDoc] = useState(false);

  const message = (code: string) => (code in f ? f[code as keyof typeof f] : code);

  const setText = (l: Locale, patch: Partial<MaterialText>) => {
    setTexts((prev) => ({ ...prev, [l]: { ...prev[l], ...patch } }));
    if (l === lang && patch.title !== undefined && !slugTouched) setSlug(slugify(patch.title));
  };

  const addTags = (raw: string) => {
    const next = raw
      .split(",")
      .map((t) => t.trim().toLowerCase().replace(/^#/, ""))
      .filter(Boolean);
    if (next.length) setTags((prev) => [...new Set([...prev, ...next])]);
    setTagDraft("");
  };

  const onFetchPreview = async () => {
    if (!url.trim()) return;
    setFetching(true);
    setError(null);
    const res = await fetchLinkPreview(url);
    setFetching(false);
    if (!res.ok) return setError(message(res.error));
    const { title, description, image } = res.data;
    setText(lang, {
      title: texts[lang].title || title,
      excerpt: texts[lang].excerpt || description,
    });
    if (image && !images.some((i) => i.src === image)) {
      setImages((prev) => [...prev, { key: image, src: image, alt: title, width: null, height: null }]);
    }
  };

  const onFiles = async (files: FileList | File[]) => {
    for (const file of Array.from(files).filter((x) => x.type.startsWith("image/"))) {
      const key = crypto.randomUUID();
      const local = URL.createObjectURL(file);
      setImages((prev) => [...prev, { key, src: local, alt: "", width: null, height: null, uploading: true }]);
      try {
        const { blob, width, height } = await downscale(file);
        const form = new FormData();
        form.append("file", new File([blob], file.name, { type: blob.type }));
        const res = await uploadImage(form);
        if (!res.ok) throw new Error(res.error);
        setImages((prev) =>
          prev.map((i) => (i.key === key ? { ...i, src: res.data.url, width, height, uploading: false } : i)),
        );
      } catch (e) {
        setImages((prev) => prev.filter((i) => i.key !== key));
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        URL.revokeObjectURL(local);
      }
    }
  };

  const onDocuments = async (list: FileList | File[]) => {
    for (const file of Array.from(list)) {
      const kind = documentKind(file);
      if (!kind) {
        setError(f.badFile);
        continue;
      }
      if (file.size > MAX_DOCUMENT_BYTES) {
        setError(f.fileTooBig);
        continue;
      }
      const key = crypto.randomUUID();
      const name = file.name.replace(/\.(pdf|html?|glb)$/i, "");
      setFiles((prev) => [...prev, { key, url: "", name, kind, size: file.size, progress: 0 }]);
      const setProgress = (progress: number) =>
        setFiles((prev) => prev.map((x) => (x.key === key ? { ...x, progress } : x)));
      try {
        let url: string;
        if (directUpload) {
          const blob = await upload(`documents/${slugify(name) || "document"}.${DOCUMENT_KINDS[kind].ext}`, file, {
            access: "public",
            handleUploadUrl: "/api/upload",
            contentType: DOCUMENT_KINDS[kind].type,
            multipart: file.size > 8 * 1024 * 1024,
            onUploadProgress: ({ percentage }) => setProgress(percentage),
          });
          url = blob.url;
        } else {
          const form = new FormData();
          form.append("file", file);
          const res = await uploadDocumentLocal(form);
          if (!res.ok) throw new Error(message(res.error));
          url = res.data.url;
        }
        setFiles((prev) => prev.map((x) => (x.key === key ? { ...x, url, progress: undefined } : x)));
      } catch (e) {
        setFiles((prev) => prev.filter((x) => x.key !== key));
        setError(e instanceof Error ? e.message : String(e));
      }
    }
  };

  const onSave = () => {
    setError(null);
    startSaving(async () => {
      const res = await saveMaterial({
        id: material?.id,
        type,
        lang,
        status: published ? "published" : "draft",
        slug,
        subjectId: newSubject ? undefined : subjectId,
        newSubject: newSubject ?? undefined,
        url: type === "link" ? url : undefined,
        tags: tagDraft.trim() ? [...tags, tagDraft] : tags,
        texts,
        images: images
          .filter((i) => !i.uploading)
          .map(({ id, src, alt, width, height }) => ({ id, src, alt, width, height })),
        files: files
          .filter((x) => x.progress === undefined)
          .map(({ id, url, name, kind, size }) => ({ id, url, name, kind, size })),
      });
      if (!res.ok) return setError(message(res.error));
      setSlug(res.data.slug);
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 1800);
      if (!material) router.replace(`/${locale}/admin/editor?id=${res.data.id}`);
      else router.refresh();
    });
  };

  const onDelete = () => {
    if (!material || !confirm(f.confirmDelete)) return;
    startSaving(async () => {
      const res = await deleteMaterial(material.id);
      if (!res.ok) return setError(res.error);
      router.push(`/${locale}/admin`);
    });
  };

  const uploading = images.some((i) => i.uploading) || files.some((x) => x.progress !== undefined);

  return (
    <div className="mt-6 pb-24">
      <h1 className="font-display text-3xl font-extrabold tracking-tight">
        {material ? dict.edit : dict.new}
      </h1>

      <div className="mt-8 grid gap-6">
        {/* Type */}
        <Field label={f.type}>
          <div className="flex w-fit gap-1 rounded-2xl border border-line bg-surface p-1">
            {(["note", "doc", "link", "photo"] as const).map((t) => {
              const Icon = typeMeta[t].icon;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`group relative flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                    type === t ? "text-accent-ink" : "text-muted hover:text-ink"
                  }`}
                >
                  {type === t && (
                    <motion.span layoutId="form-type" transition={spring} className="absolute inset-0 rounded-xl bg-accent" />
                  )}
                  <Icon size={16} className="relative transition-transform group-hover:scale-125" />
                  <span className="relative">{typeNames[t]}</span>
                </button>
              );
            })}
          </div>
        </Field>

        <div className="grid gap-6 sm:grid-cols-2">
          {/* Original language */}
          <Field label={f.lang}>
            <div className="flex w-fit gap-1 rounded-2xl border border-line bg-surface p-1">
              {locales.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => {
                    setLang(l);
                    setTextTab(l);
                  }}
                  className={`relative rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                    lang === l ? "text-accent-ink" : "text-muted hover:text-ink"
                  }`}
                >
                  {lang === l && (
                    <motion.span layoutId="form-lang" transition={spring} className="absolute inset-0 rounded-xl bg-accent" />
                  )}
                  <span className="relative">{langNames[l]}</span>
                </button>
              ))}
            </div>
          </Field>

          {/* Subject */}
          <Field label={f.subject}>
            {newSubject ? (
              <div className="grid gap-2">
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input
                    placeholder={f.subjectRu}
                    value={newSubject.nameRu}
                    onChange={(e) => setNewSubject({ ...newSubject, nameRu: e.target.value })}
                  />
                  <Input
                    placeholder={f.subjectEn}
                    value={newSubject.nameEn}
                    onChange={(e) => setNewSubject({ ...newSubject, nameEn: e.target.value })}
                  />
                  <IconButton label={f.remove} onClick={() => setNewSubject(null)}>
                    <X size={16} />
                  </IconButton>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="mr-1 text-xs text-muted">{f.section}</span>
                  {SECTIONS.map((sec) => {
                    const Icon = sectionMeta[sec.slug].icon;
                    const active = newSubject.section === sec.slug;
                    return (
                      <button
                        key={sec.slug}
                        type="button"
                        onClick={() => setNewSubject({ ...newSubject, section: sec.slug })}
                        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs transition-all ${
                          active
                            ? "border-ochre bg-ochre-soft text-ink"
                            : "border-line text-muted hover:border-ochre hover:text-ink"
                        }`}
                      >
                        <Icon size={12} />
                        {sec.name[locale]}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="grid gap-3">
                {SECTIONS.map((sec) => ({ sec, items: subjects.filter((s) => s.section === sec.slug) }))
                  .filter(({ items }) => items.length > 0)
                  .map(({ sec, items }) => {
                    const meta = sectionMeta[sec.slug];
                    const Icon = meta.icon;
                    return (
                      <div key={sec.slug} className="flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex w-full items-center gap-1.5 text-xs font-semibold uppercase tracking-wider ${meta.tone}`}
                        >
                          <Icon size={13} />
                          {sec.name[locale]}
                        </span>
                        {items.map((s) => (
                          <motion.button
                            key={s.id}
                            type="button"
                            whileTap={{ scale: 0.94 }}
                            onClick={() => setSubjectId(s.id)}
                            className={`rounded-full border px-3 py-1 text-sm transition-all ${
                              subjectId === s.id
                                ? "border-ochre bg-ochre-soft text-ink shadow-[0_4px_14px_-6px_var(--ochre)]"
                                : "border-line bg-surface text-muted hover:border-ochre hover:text-ink"
                            }`}
                          >
                            {s.name}
                          </motion.button>
                        ))}
                      </div>
                    );
                  })}
                <button
                  type="button"
                  onClick={() => setNewSubject({ nameRu: "", nameEn: "", section: "other" })}
                  className="w-fit rounded-full border border-dashed border-line px-3 py-1 text-sm text-muted transition-colors hover:border-accent hover:text-accent"
                >
                  {f.newSubject}
                </button>
              </div>
            )}
          </Field>
        </div>

        {/* Link */}
        <AnimatePresence initial={false}>
          {type === "link" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <Field label={f.url}>
                <div className="flex gap-2">
                  <Input
                    type="url"
                    placeholder="https://"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={onFetchPreview}
                    disabled={fetching || !url.trim()}
                    className="group inline-flex shrink-0 items-center gap-2 rounded-xl border border-line bg-surface px-4 text-sm font-medium transition-all hover:border-ochre hover:text-ochre disabled:opacity-50"
                  >
                    {fetching ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Wand2 size={16} className="transition-transform group-hover:rotate-12" />
                    )}
                    {fetching ? f.fetching : f.fetch}
                  </button>
                </div>
              </Field>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Texts */}
        <Field label={f.texts}>
          <div className="overflow-hidden rounded-2xl border border-line bg-surface">
            <div className="flex items-center justify-between gap-2 border-b border-line px-2 py-2">
              <div className="flex gap-1">
                {locales.map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setTextTab(l)}
                    className={`relative rounded-lg px-3 py-1.5 text-sm transition-colors ${
                      textTab === l ? "text-ink" : "text-muted hover:text-ink"
                    }`}
                  >
                    {textTab === l && (
                      <motion.span layoutId="text-tab" transition={spring} className="absolute inset-0 rounded-lg bg-surface-2" />
                    )}
                    <span className="relative">
                      {langNames[l]}{" "}
                      <span className="text-xs text-muted">({l === lang ? f.original : f.translation})</span>
                    </span>
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1">
                {(
                  [
                    [f.insertCards, CARDS_TEMPLATE],
                    [f.insertQuiz, QUIZ_TEMPLATE],
                    [f.insertCalc, CALC_TEMPLATE],
                    [f.insertPython, PYTHON_TEMPLATE],
                    [f.insert3d, MODEL_TEMPLATE],
                  ] as const
                ).map(([label, template]) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => {
                      const body = texts[textTab].body ?? "";
                      setText(textTab, { body: `${body.trimEnd()}${body.trim() ? "\n\n" : ""}${template}\n` });
                      setPreview(false);
                    }}
                    className="hidden rounded-lg px-2.5 py-1.5 text-sm text-plum transition-colors hover:bg-plum-soft sm:block"
                  >
                    {label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setPreview((p) => !p)}
                  className="rounded-lg px-3 py-1.5 text-sm text-accent transition-colors hover:bg-accent-soft"
                >
                  {preview ? f.write : f.preview}
                </button>
              </div>
            </div>
            <div className="grid gap-3 p-4">
              <Input
                placeholder={f.title}
                value={texts[textTab].title}
                onChange={(e) => setText(textTab, { title: e.target.value })}
                className="font-display text-lg font-bold"
              />
              <textarea
                placeholder={f.excerpt}
                rows={2}
                value={texts[textTab].excerpt}
                onChange={(e) => setText(textTab, { excerpt: e.target.value })}
                className={inputClass}
              />
              {preview ? (
                <div className="min-h-64 rounded-xl border border-line bg-bg/50 px-5 py-2">
                  <Markdown locale={textTab}>{texts[textTab].body || "…"}</Markdown>
                </div>
              ) : (
                <textarea
                  placeholder={f.body}
                  rows={14}
                  value={texts[textTab].body}
                  onChange={(e) => setText(textTab, { body: e.target.value })}
                  className={`${inputClass} font-mono text-sm leading-relaxed`}
                />
              )}
            </div>
          </div>
        </Field>

        {/* Images */}
        <Field label={f.images}>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              onFiles(e.dataTransfer.files);
            }}
            onClick={() => fileInput.current?.click()}
            className={`group flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-8 text-center text-sm transition-all ${
              dragging
                ? "scale-[1.01] border-accent bg-accent-soft text-accent"
                : "border-line bg-surface text-muted hover:border-accent hover:text-accent"
            }`}
          >
            <ImagePlus size={28} className="transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-110" />
            {f.drop}
            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={(e) => e.target.files && onFiles(e.target.files)}
            />
          </div>
          {images.length > 0 && (
            <motion.ul layout className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence>
                {images.map((img, i) => (
                  <motion.li
                    key={img.key}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="overflow-hidden rounded-xl border border-line bg-surface"
                  >
                    <div className="relative aspect-[4/3] bg-surface-2">
                      {/* eslint-disable-next-line @next/next/no-img-element -- local blob: previews */}
                      <img src={img.src} alt={img.alt} className="size-full object-cover" />
                      {img.uploading && (
                        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-surface/70 text-sm">
                          <Loader2 size={16} className="animate-spin" /> {f.uploading}
                        </div>
                      )}
                      {i === 0 && !img.uploading && (
                        <span className="absolute left-2 top-2 rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-accent-ink">
                          {f.cover}
                        </span>
                      )}
                      <button
                        type="button"
                        aria-label={f.remove}
                        onClick={() => setImages((prev) => prev.filter((x) => x.key !== img.key))}
                        className="absolute right-2 top-2 rounded-lg bg-surface/90 p-1.5 text-muted transition-colors hover:text-rose"
                      >
                        <X size={14} />
                      </button>
                    </div>
                    <input
                      placeholder={f.alt}
                      value={img.alt}
                      onChange={(e) =>
                        setImages((prev) => prev.map((x) => (x.key === img.key ? { ...x, alt: e.target.value } : x)))
                      }
                      className="w-full bg-transparent px-3 py-2 text-sm outline-none"
                    />
                  </motion.li>
                ))}
              </AnimatePresence>
            </motion.ul>
          )}
        </Field>

        {/* Documents */}
        <Field label={f.files} hint={f.filesHint}>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDraggingDoc(true);
            }}
            onDragLeave={() => setDraggingDoc(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDraggingDoc(false);
              onDocuments(e.dataTransfer.files);
            }}
            onClick={() => docInput.current?.click()}
            className={`group flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-7 text-center text-sm transition-all ${
              draggingDoc
                ? "scale-[1.01] border-plum bg-plum-soft text-plum"
                : "border-line bg-surface text-muted hover:border-plum hover:text-plum"
            }`}
          >
            <FileUp size={28} className="transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-110" />
            {f.dropFiles}
            <input
              ref={docInput}
              type="file"
              accept={DOCUMENT_ACCEPT}
              multiple
              hidden
              onChange={(e) => {
                if (e.target.files) onDocuments(e.target.files);
                e.target.value = "";
              }}
            />
          </div>
          {files.length > 0 && (
            <motion.ul layout className="mt-3 grid gap-2">
              <AnimatePresence>
                {files.map((doc) => {
                  const Icon = doc.kind === "pdf" ? FileText : doc.kind === "model" ? Box : FileCode;
                  return (
                    <motion.li
                      key={doc.key}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -12 }}
                      className="relative flex items-center gap-3 overflow-hidden rounded-xl border border-line bg-surface px-3 py-2"
                    >
                      {doc.progress !== undefined && (
                        <motion.span
                          className="absolute inset-y-0 left-0 bg-plum-soft"
                          animate={{ width: `${doc.progress}%` }}
                          transition={{ ease: "easeOut" }}
                        />
                      )}
                      <span
                        className={`relative flex size-9 shrink-0 items-center justify-center rounded-lg ${
                          doc.kind === "pdf"
                            ? "bg-rose-soft text-rose"
                            : doc.kind === "model"
                              ? "bg-accent-soft text-accent"
                              : "bg-plum-soft text-plum"
                        }`}
                      >
                        <Icon size={18} />
                      </span>
                      <input
                        value={doc.name}
                        onChange={(e) =>
                          setFiles((prev) => prev.map((x) => (x.key === doc.key ? { ...x, name: e.target.value } : x)))
                        }
                        className="relative min-w-0 flex-1 bg-transparent text-sm font-medium outline-none"
                      />
                      <span className="relative shrink-0 text-xs uppercase text-muted">
                        {doc.progress !== undefined ? (
                          <span className="inline-flex items-center gap-1">
                            <Loader2 size={12} className="animate-spin" /> {Math.round(doc.progress)}%
                          </span>
                        ) : (
                          `${doc.kind} · ${formatBytes(doc.size)}`
                        )}
                      </span>
                      <button
                        type="button"
                        aria-label={f.remove}
                        onClick={() => setFiles((prev) => prev.filter((x) => x.key !== doc.key))}
                        className="relative rounded-lg p-1.5 text-muted transition-colors hover:text-rose"
                      >
                        <X size={14} />
                      </button>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </motion.ul>
          )}
        </Field>

        {/* Tags */}
        <Field label={f.tags} hint={f.tagsHint}>
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2 focus-within:border-accent focus-within:shadow-[0_0_0_4px_var(--accent-soft)]">
            <AnimatePresence>
              {tags.map((t) => (
                <motion.button
                  key={t}
                  type="button"
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => setTags((prev) => prev.filter((x) => x !== t))}
                  className="group flex items-center gap-1 rounded-full bg-surface-2 px-2.5 py-0.5 text-sm text-muted hover:text-rose"
                >
                  #{t}
                  <X size={12} className="opacity-50 group-hover:opacity-100" />
                </motion.button>
              ))}
            </AnimatePresence>
            <input
              value={tagDraft}
              onChange={(e) => (e.target.value.endsWith(",") ? addTags(e.target.value) : setTagDraft(e.target.value))}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTags(tagDraft);
                } else if (e.key === "Backspace" && !tagDraft) {
                  setTags((prev) => prev.slice(0, -1));
                }
              }}
              onBlur={() => tagDraft && addTags(tagDraft)}
              className="min-w-32 flex-1 bg-transparent py-1 text-sm outline-none"
            />
          </div>
        </Field>

        {/* Slug */}
        <Field label={f.slug}>
          <div className="flex items-center rounded-xl border border-line bg-surface focus-within:border-accent">
            <span className="hidden pl-3 text-sm text-muted sm:block">/{locale}/materials/</span>
            <input
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setSlugTouched(true);
              }}
              onBlur={() => setSlug(slugify(slug))}
              className="w-full bg-transparent px-3 py-2.5 text-sm outline-none sm:pl-0"
            />
          </div>
        </Field>
      </div>

      {/* Sticky action bar */}
      <div className="sticky bottom-4 z-30 mt-10">
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-surface/90 p-3 shadow-[0_20px_50px_-20px_rgba(35,38,43,0.4)] backdrop-blur">
          <label className="flex cursor-pointer select-none items-center gap-2 text-sm">
            <span
              className={`relative h-6 w-11 rounded-full transition-colors ${published ? "bg-accent" : "bg-line"}`}
            >
              <motion.span
                layout
                transition={spring}
                className={`absolute top-0.5 size-5 rounded-full bg-white shadow ${published ? "right-0.5" : "left-0.5"}`}
              />
            </span>
            <input
              type="checkbox"
              className="sr-only"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
            />
            {published ? f.publish : f.draft}
          </label>

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="text-sm text-rose"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <div className="ml-auto flex items-center gap-2">
            {material && (
              <button
                type="button"
                onClick={onDelete}
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-sm text-muted transition-colors hover:bg-rose-soft hover:text-rose"
              >
                <Trash2 size={16} />
                <span className="hidden sm:inline">{f.delete}</span>
              </button>
            )}
            <motion.button
              type="button"
              onClick={onSave}
              disabled={saving || uploading}
              whileTap={{ scale: 0.96 }}
              className="inline-flex min-w-36 items-center justify-center gap-2 rounded-xl bg-accent px-5 py-2.5 font-medium text-accent-ink shadow-[0_8px_20px_-10px_var(--accent)] transition-opacity disabled:opacity-60"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={saving ? "saving" : savedFlash ? "saved" : "save"}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="inline-flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> {f.saving}
                    </>
                  ) : savedFlash ? (
                    <>
                      <Check size={16} /> {f.saved}
                    </>
                  ) : (
                    f.save
                  )}
                </motion.span>
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-line bg-surface px-3 py-2.5 outline-none transition-[border-color,box-shadow] placeholder:text-muted/70 focus:border-accent focus:shadow-[0_0_0_4px_var(--accent-soft)]";

function Input({ className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputClass} ${className}`} />;
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 flex items-baseline gap-2">
        <span className="text-sm font-semibold">{label}</span>
        {hint && <span className="text-xs text-muted">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function IconButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="shrink-0 rounded-xl border border-line bg-surface px-3 text-muted transition-colors hover:text-rose"
    >
      {children}
    </button>
  );
}

// Study blocks the note page turns into flip cards and a mini test (see src/lib/study.ts).
const CARDS_TEMPLATE = "```cards\nВопрос или термин :: Ответ или определение\nФормула площади круга :: $S = \\pi r^2$\n```";
const QUIZ_TEMPLATE = "```quiz\n? Вопрос\n- Неверный вариант\n+ Верный вариант\n- Ещё неверный\n> Пояснение (необязательно)\n```";
// Live formula (src/lib/calc.ts), runnable Python and a 3D model (src/lib/embed.ts).
const CALC_TEMPLATE =
  "```calc\ntitle: Название\nF = 1000 | 100..5000 | Н | Сила\nL = 2 | 0.5..5 | м | Длина\nM = F*L | | Н·м | Момент\nplot x: 0..L | F*x | M(x)\naxes: x, м ; M, Н·м\n```";
const PYTHON_TEMPLATE = "```python\nimport numpy as np\n\nx = np.linspace(0, 1, 5)\nprint(x ** 2)\n```";
const MODEL_TEMPLATE = "```3d\nsrc: https://ссылка-на-модель.glb\ntitle: Подпись\n```";


function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/** Shrinks a photo to at most 2000px on the long side and re-encodes it as WebP. */
async function downscale(file: File): Promise<{ blob: Blob; width: number; height: number }> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 2000 / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Encode failed"))), "image/webp", 0.85),
  );
  return { blob, width, height };
}
