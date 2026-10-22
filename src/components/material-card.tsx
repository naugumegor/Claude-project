"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import type { LocalizedMaterial } from "@/lib/content";
import type { Locale } from "@/lib/i18n";
import { typeMeta } from "./type-meta";

export type CardLabels = {
  type: string;
  subject: string;
  date: string;
};

export function MaterialCard({
  material,
  locale,
  labels,
  index = 0,
}: {
  material: LocalizedMaterial;
  locale: Locale;
  labels: CardLabels;
  index?: number;
}) {
  const meta = typeMeta[material.type];
  const Icon = meta.icon;
  const cover = material.images?.[0];

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: Math.min(index, 6) * 0.06, ease: [0.2, 0.8, 0.2, 1] }}
      whileHover={{ y: -6 }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-surface transition-[border-color,box-shadow] duration-300 hover:border-transparent hover:shadow-[0_20px_50px_-24px_rgba(35,38,43,0.45)]"
    >
      <div
        className={`relative aspect-[16/9] overflow-hidden border-b border-line ${cover ? "bg-surface-2" : meta.soft}`}
      >
        {cover ? (
          <Image
            src={cover.src}
            alt={cover.alt}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          // No picture: a big faded type icon and the title's first letter instead.
          <>
            <Icon
              aria-hidden
              strokeWidth={1.2}
              className={`absolute -bottom-6 -right-4 size-40 opacity-25 transition-transform duration-700 group-hover:-rotate-12 group-hover:scale-110 ${meta.tone}`}
            />
            <span
              aria-hidden
              className={`absolute left-6 top-3 font-display text-7xl font-extrabold opacity-30 transition-transform duration-700 group-hover:translate-x-2 ${meta.tone}`}
            >
              {material.title.charAt(0)}
            </span>
          </>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center gap-2.5">
          <span
            className={`flex size-9 items-center justify-center rounded-xl transition-all duration-300 group-hover:-rotate-6 group-hover:scale-110 ${meta.soft} ${meta.tone} ${meta.glow}`}
          >
            <Icon size={18} />
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-muted">
            {labels.type}
          </span>
          <span className="text-xs text-muted/60">·</span>
          <span className="text-xs text-muted">{labels.subject}</span>
        </div>
        <h3 className="font-display text-lg font-bold leading-snug tracking-tight">
          <Link
            href={`/${locale}/materials/${material.slug}`}
            className="after:absolute after:inset-0 after:content-['']"
          >
            {material.title}
          </Link>
        </h3>
        <p className="line-clamp-3 text-sm leading-relaxed text-muted">{material.excerpt}</p>
        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="flex flex-wrap gap-1.5">
            {material.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-surface-2 px-2.5 py-0.5 text-xs text-muted"
              >
                #{tag}
              </span>
            ))}
          </div>
          <ArrowUpRight
            size={18}
            className="shrink-0 text-muted transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent"
          />
        </div>
        <time className="text-xs text-muted/80" dateTime={material.createdAt}>
          {labels.date}
        </time>
      </div>
    </motion.article>
  );
}
