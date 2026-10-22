"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { computeFit, FIT_KIND_NAMES, parseFit, COMMON_FITS, type FitKind } from "@/lib/fits";
import type { Steel } from "@/lib/reference-data";
import type { GlossaryTerm } from "@/lib/glossary";

// Inline `H7/p6`, `Ø25 H7/p6` or `40Х` in a note: a dotted underline that opens a small card
// with the numbers, on hover with a mouse or on tap on a phone.

const text = {
  ru: {
    hole: "Отверстие",
    shaft: "Вал",
    gap: "Зазор",
    interference: "Натяг",
    max: "макс.",
    min: "мин.",
    forSize: (d: number, given: boolean) => (given ? `Для Ø${d} мм` : `Для примера Ø${d} мм`),
    more: "В справочник",
    uts: "σв",
    yield: "σт",
    mpa: "МПа",
    um: "мкм",
  },
  en: {
    hole: "Hole",
    shaft: "Shaft",
    gap: "Clearance",
    interference: "Interference",
    max: "max",
    min: "min",
    forSize: (d: number, given: boolean) => (given ? `For Ø${d} mm` : `Example: Ø${d} mm`),
    more: "Open reference",
    uts: "UTS",
    yield: "Yield",
    mpa: "MPa",
    um: "µm",
  },
};

const kindTone: Record<FitKind, string> = {
  clearance: "bg-accent-soft text-accent",
  transition: "bg-ochre-soft text-ochre",
  interference: "bg-rose-soft text-rose",
};

const CODE_LABEL =
  "rounded-md border-b border-dashed border-accent bg-accent-soft/60 px-1 py-0.5 font-mono text-[0.88em] text-ink transition-colors hover:bg-accent-soft";
const TERM_LABEL = "border-b border-dotted border-plum text-inherit transition-colors hover:bg-plum-soft hover:text-plum";

function Tip({
  label,
  children,
  labelClass = CODE_LABEL,
}: {
  label: React.ReactNode;
  children: React.ReactNode;
  labelClass?: string;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ left: 0, top: 0, above: false });
  const anchor = useRef<HTMLSpanElement>(null);
  const hoverTimer = useRef<number | undefined>(undefined);

  const place = () => {
    const r = anchor.current!.getBoundingClientRect();
    const width = Math.min(320, window.innerWidth - 24);
    const left = Math.max(12, Math.min(r.left + r.width / 2 - width / 2, window.innerWidth - width - 12));
    const above = r.bottom + 240 > window.innerHeight && r.top > 260;
    setPos({ left, top: above ? r.top - 8 : r.bottom + 8, above });
  };

  const show = () => {
    window.clearTimeout(hoverTimer.current);
    place();
    setOpen(true);
  };
  const hide = () => {
    hoverTimer.current = window.setTimeout(() => setOpen(false), 120);
  };

  useEffect(() => {
    if (!open) return;
    const close = (e: Event) => {
      if (e.type === "pointerdown" && anchor.current?.parentElement?.contains(e.target as Node)) return;
      setOpen(false);
    };
    window.addEventListener("scroll", close, { passive: true });
    window.addEventListener("pointerdown", close);
    return () => {
      window.removeEventListener("scroll", close);
      window.removeEventListener("pointerdown", close);
    };
  }, [open]);

  return (
    <span className="relative" onPointerEnter={(e) => e.pointerType === "mouse" && show()} onPointerLeave={hide}>
      <span
        ref={anchor}
        role="button"
        tabIndex={0}
        aria-expanded={open}
        onClick={() => (open ? setOpen(false) : show())}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (open) setOpen(false);
            else show();
          } else if (e.key === "Escape") setOpen(false);
        }}
        className={`ref-tip cursor-help ${labelClass}`}
      >
        {label}
      </span>
      <AnimatePresence>
        {open && (
          <motion.span
            role="tooltip"
            initial={{ opacity: 0, y: pos.above ? 6 : -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.16 }}
            style={{
              left: pos.left,
              top: pos.top,
              width: "min(320px, calc(100vw - 24px))",
              translateY: pos.above ? "-100%" : 0,
            }}
            className="not-prose fixed z-50 block rounded-xl border border-line bg-surface p-3 text-left font-sans text-sm leading-snug text-ink shadow-[0_18px_40px_-18px_rgba(0,0,0,0.35)]"
            onPointerEnter={() => window.clearTimeout(hoverTimer.current)}
            onPointerLeave={hide}
          >
            {children}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

const fmt = (v: number) => (v > 0 ? `+${v}` : `${v}`);

export function FitTip({ code, locale }: { code: string; locale: Locale }) {
  const t = text[locale];
  const parsed = parseFit(code)!;
  const size = parsed.size ?? 25;
  const fit = computeFit(parsed.hole, parsed.shaft, size);
  const name = `${parsed.hole.letter}${parsed.hole.grade}/${parsed.shaft.letter}${parsed.shaft.grade}`;
  const usage = COMMON_FITS.find((f) => f.fit === name);

  return (
    <Tip label={code}>
      <span className="flex items-center gap-2">
        <span className="font-mono font-bold">{name}</span>
        {fit && (
          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${kindTone[fit.kind]}`}>
            {FIT_KIND_NAMES[fit.kind][locale]}
          </span>
        )}
      </span>
      {usage && <span className="mt-1 block text-muted">{usage[locale]}</span>}
      {fit && (
        <>
          <span className="mt-2 block text-xs text-muted">{t.forSize(size, parsed.size !== undefined)}</span>
          <span className="mt-1 grid grid-cols-2 gap-1.5 font-mono text-xs">
            <span className="rounded-lg bg-surface-2 px-2 py-1">
              <span className="block font-sans text-muted">{t.hole}</span>
              {fmt(fit.hole.upper)} / {fmt(fit.hole.lower)} {t.um}
            </span>
            <span className="rounded-lg bg-surface-2 px-2 py-1">
              <span className="block font-sans text-muted">{t.shaft}</span>
              {fmt(fit.shaft.upper)} / {fmt(fit.shaft.lower)} {t.um}
            </span>
          </span>
          <span className="mt-1.5 block text-xs">
            {fit.maxGap > 0 && (
              <span className="mr-3">
                {t.gap} {t.max} <b className="font-mono">{fit.maxGap}</b>
              </span>
            )}
            {fit.minGap > 0 && (
              <span className="mr-3">
                {t.gap} {t.min} <b className="font-mono">{fit.minGap}</b>
              </span>
            )}
            {fit.minGap < 0 && (
              <span className="mr-3">
                {t.interference} {t.max} <b className="font-mono">{-fit.minGap}</b>
              </span>
            )}
            {fit.maxGap < 0 && (
              <span>
                {t.interference} {t.min} <b className="font-mono">{-fit.maxGap}</b>
              </span>
            )}
          </span>
        </>
      )}
      <MoreLink href={`/${locale}/reference?fit=${encodeURIComponent(name)}&d=${size}#fits`} label={t.more} />
    </Tip>
  );
}

export function SteelTip({ code, steel, locale }: { code: string; steel: Steel; locale: Locale }) {
  const t = text[locale];
  return (
    <Tip label={code}>
      <span className="flex flex-wrap items-baseline gap-x-2">
        <span className="font-mono font-bold">{steel.grade}</span>
        <span className="text-xs text-muted">{steel.standard}</span>
      </span>
      <span className="mt-0.5 block text-xs text-muted">≈ {steel.analogs}</span>
      <span className="mt-1.5 block text-xs">{steel.composition[locale]}</span>
      {(steel.uts || steel.hardness) && (
        <span className="mt-1.5 flex flex-wrap gap-1.5 font-mono text-xs">
          {steel.uts && (
            <span className="rounded-lg bg-surface-2 px-2 py-0.5">
              {t.uts} {steel.uts} {t.mpa}
            </span>
          )}
          {steel.yield && (
            <span className="rounded-lg bg-surface-2 px-2 py-0.5">
              {t.yield} {steel.yield} {t.mpa}
            </span>
          )}
          {steel.hardness && <span className="rounded-lg bg-surface-2 px-2 py-0.5">{steel.hardness}</span>}
        </span>
      )}
      <span className="mt-1 block text-[11px] text-muted">{steel.state[locale]}</span>
      <span className="mt-1.5 block">{steel.use[locale]}</span>
      <MoreLink href={`/${locale}/reference?steel=${encodeURIComponent(steel.grade)}#steels`} label={t.more} />
    </Tip>
  );
}

function MoreLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="group mt-2 inline-flex items-center gap-1 text-xs font-semibold text-accent"
    >
      {label}
      <ArrowUpRight size={12} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
    </Link>
  );
}

/** A glossary term from [[term]] in a note: the definition plus the term in the other language. */
export function GlossaryTip({ term, locale, children }: { term: GlossaryTerm; locale: Locale; children: React.ReactNode }) {
  const other = locale === "ru" ? term.en : term.ru;
  return (
    <Tip label={children} labelClass={TERM_LABEL}>
      <span className="flex flex-wrap items-baseline gap-x-2">
        <b className="font-display text-[15px]">{locale === "ru" ? term.ru : term.en}</b>
        <span className="text-xs text-muted">{other}</span>
      </span>
      <span className="mt-1.5 block">{locale === "ru" ? term.def_ru : term.def_en}</span>
      <Link href={`/${locale}/glossary#${term.id}`} className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-plum hover:underline">
        {locale === "ru" ? "Весь глоссарий" : "Full glossary"}
        <ArrowUpRight size={12} />
      </Link>
    </Tip>
  );
}
