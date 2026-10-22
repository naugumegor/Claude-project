"use client";

import { useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { Box, Download, FileCode, FileText, Loader2, Maximize2 } from "lucide-react";
import type { MaterialFile } from "@/lib/content";
import type { Locale } from "@/lib/i18n";
import { ModelViewer } from "./model-viewer";

const spring = { type: "spring", stiffness: 420, damping: 34 } as const;

/** Shows attached PDFs, HTML pages and 3D models inline, with tabs when there are several. */
export function DocumentViewer({
  files,
  labels,
  locale,
  base = "/api/files/",
}: {
  files: (MaterialFile & { id: number })[];
  labels: { openFull: string; download: string };
  locale: Locale;
  /** Where files are served from: a material's files, or readers' documents (/api/user-files/). */
  base?: string;
}) {
  const [active, setActive] = useState(files[0].id);
  const [loaded, setLoaded] = useState<Record<number, boolean>>({});
  const file = files.find((f) => f.id === active) ?? files[0];
  const src = `${base}${file.id}`;

  return (
    <section className="overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_24px_60px_-40px_rgba(35,38,43,0.5)]">
      <div className="flex flex-wrap items-center gap-2 border-b border-line px-3 py-2">
        <LayoutGroup id="doc-tabs">
          <div className="flex min-w-0 flex-1 flex-wrap gap-1">
            {files.map((f) => {
              const Icon = f.kind === "pdf" ? FileText : f.kind === "model" ? Box : FileCode;
              const on = f.id === file.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setActive(f.id)}
                  className={`group relative flex max-w-full items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors ${
                    on ? "text-ink" : "text-muted hover:text-ink"
                  }`}
                >
                  {on && (
                    <motion.span layoutId="doc-tab" transition={spring} className="absolute inset-0 rounded-lg bg-surface-2" />
                  )}
                  <Icon
                    size={16}
                    className={`relative shrink-0 transition-transform group-hover:scale-110 ${
                      f.kind === "pdf" ? "text-rose" : f.kind === "model" ? "text-accent" : "text-plum"
                    }`}
                  />
                  <span className="relative truncate">{f.name}</span>
                  <span className="relative text-[10px] font-semibold uppercase text-muted">
                    {f.kind === "model" ? "3D" : f.kind}
                  </span>
                </button>
              );
            })}
          </div>
        </LayoutGroup>
        <div className="flex items-center gap-1">
          <a
            href={src}
            target="_blank"
            rel="noopener"
            title={labels.openFull}
            className="group flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-muted transition-colors hover:bg-accent-soft hover:text-accent"
          >
            <Maximize2 size={15} className="transition-transform group-hover:scale-110" />
            <span className="hidden sm:inline">{labels.openFull}</span>
          </a>
          <a
            href={`${src}?download`}
            title={labels.download}
            className="group flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-muted transition-colors hover:bg-accent-soft hover:text-accent"
          >
            <Download size={15} className="transition-transform group-hover:translate-y-0.5" />
            <span className="hidden sm:inline">{labels.download}</span>
          </a>
        </div>
      </div>

      {file.kind === "model" ? (
        <div className="[&>figure]:my-0 [&>figure]:rounded-none [&>figure]:border-0">
          <ModelViewer key={file.id} src={src} locale={locale} />
        </div>
      ) : (
        <div className="relative h-[75vh] min-h-[28rem] bg-surface-2">
          <AnimatePresence>
            {!loaded[file.id] && (
              <motion.div
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center text-muted"
              >
                <Loader2 size={24} className="animate-spin" />
              </motion.div>
            )}
          </AnimatePresence>
          <iframe
            key={file.id}
            src={src}
            title={file.name}
            onLoad={() => setLoaded((prev) => ({ ...prev, [file.id]: true }))}
            // HTML documents run in a sandbox without our origin; Chrome's PDF viewer refuses sandboxed frames.
            sandbox={
              file.kind === "html"
                ? "allow-scripts allow-popups allow-popups-to-escape-sandbox allow-forms allow-modals allow-downloads"
                : undefined
            }
            className={`absolute inset-0 size-full bg-white transition-opacity duration-500 ${
              loaded[file.id] ? "opacity-100" : "opacity-0"
            }`}
          />
        </div>
      )}
    </section>
  );
}
