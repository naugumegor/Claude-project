"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import type { Locale } from "@/lib/i18n";
import {
  COMMON_FITS,
  computeFit,
  FIT_KIND_NAMES,
  GRADES,
  HOLE_LETTERS,
  parseFit,
  SHAFT_LETTERS,
  type FitKind,
} from "@/lib/fits";

const text = {
  ru: {
    size: "Номинал, мм",
    hole: "Отверстие",
    shaft: "Вал",
    limits: "Предельные размеры",
    gapMax: "Наибольший зазор",
    gapMin: "Наименьший зазор",
    intMax: "Наибольший натяг",
    intMin: "Наименьший натяг",
    zero: "нулевая линия",
    outOfRange: "Поддерживаются размеры от 1 до 500 мм и квалитеты 5–12.",
    common: "Рекомендуемые посадки",
    um: "мкм",
  },
  en: {
    size: "Nominal, mm",
    hole: "Hole",
    shaft: "Shaft",
    limits: "Limits of size",
    gapMax: "Max clearance",
    gapMin: "Min clearance",
    intMax: "Max interference",
    intMin: "Min interference",
    zero: "zero line",
    outOfRange: "Sizes from 1 to 500 mm and grades IT5–IT12 are supported.",
    common: "Recommended fits",
    um: "µm",
  },
};

const tone: Record<FitKind, string> = {
  clearance: "bg-accent-soft text-accent",
  transition: "bg-ochre-soft text-ochre",
  interference: "bg-rose-soft text-rose",
};

const fmt = (v: number) => (v > 0 ? `+${v}` : `${v}`);

export function FitCalculator({ locale }: { locale: Locale }) {
  const t = text[locale];
  const params = useSearchParams();
  const initial = parseFit(params.get("fit") ?? "") ?? parseFit("H7/k6")!;
  const [size, setSize] = useState(() => Number(params.get("d")) || 25);
  const [hole, setHole] = useState(initial.hole);
  const [shaft, setShaft] = useState(initial.shaft);
  const fit = computeFit(hole, shaft, size);
  const name = `${hole.letter}${hole.grade}/${shaft.letter}${shaft.grade}`;

  const pick = (value: string) => {
    const p = parseFit(value);
    if (!p) return;
    setHole(p.hole);
    setShaft(p.shaft);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      <div className="rounded-2xl border border-line bg-surface p-4 sm:p-5">
        <div className="flex flex-wrap items-end gap-3">
          <label className="grid gap-1 text-xs text-muted">
            {t.size}
            <input
              type="number"
              min={1}
              max={500}
              step="any"
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className="w-28 rounded-xl border border-line bg-surface-2 px-3 py-2 font-mono text-sm text-ink outline-none focus:border-accent"
            />
          </label>
          <ZonePicker
            label={t.hole}
            letters={HOLE_LETTERS}
            value={hole}
            onChange={setHole}
          />
          <span className="pb-2 font-mono text-lg text-muted">/</span>
          <ZonePicker
            label={t.shaft}
            letters={SHAFT_LETTERS}
            value={shaft}
            onChange={setShaft}
          />
          {fit && (
            <motion.span
              key={fit.kind}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`mb-1.5 rounded-full px-3 py-1 text-sm font-semibold ${tone[fit.kind]}`}
            >
              {FIT_KIND_NAMES[fit.kind][locale]}
            </motion.span>
          )}
        </div>

        {fit ? (
          <>
            <ZoneDiagram fit={fit} labels={{ hole: t.hole, shaft: t.shaft, zero: t.zero, um: t.um }} />
            <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div className="rounded-xl bg-surface-2 px-3 py-2">
                <div className="text-xs text-muted">{t.limits}</div>
                <div className="font-mono">
                  {t.hole}: {mm(size, fit.hole.lower)} … {mm(size, fit.hole.upper)}
                </div>
                <div className="font-mono">
                  {t.shaft}: {mm(size, fit.shaft.lower)} … {mm(size, fit.shaft.upper)}
                </div>
              </div>
              <div className="rounded-xl bg-surface-2 px-3 py-2 font-mono">
                {fit.maxGap > 0 && <Row label={t.gapMax} value={fit.maxGap} um={t.um} />}
                {fit.minGap > 0 && <Row label={t.gapMin} value={fit.minGap} um={t.um} />}
                {fit.minGap < 0 && <Row label={t.intMax} value={-fit.minGap} um={t.um} />}
                {fit.maxGap < 0 && <Row label={t.intMin} value={-fit.maxGap} um={t.um} />}
              </div>
            </div>
          </>
        ) : (
          <p className="mt-6 text-sm text-rose">{t.outOfRange}</p>
        )}
      </div>

      <div className="rounded-2xl border border-line bg-surface p-2">
        <p className="px-2 pb-1 pt-2 text-xs font-semibold uppercase tracking-wider text-muted">{t.common}</p>
        {COMMON_FITS.map((f) => (
          <button
            key={f.fit}
            type="button"
            onClick={() => pick(f.fit)}
            className={`group flex w-full items-baseline gap-3 rounded-xl px-2 py-1.5 text-left text-sm transition-colors ${
              f.fit === name ? "bg-accent-soft" : "hover:bg-surface-2"
            }`}
          >
            <span className="w-16 shrink-0 font-mono font-semibold transition-transform group-hover:translate-x-0.5">
              {f.fit}
            </span>
            <span className="text-xs text-muted">{f[locale]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function mm(size: number, um: number) {
  return (size + um / 1000).toFixed(3);
}

function Row({ label, value, um }: { label: string; value: number; um: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="font-sans text-muted">{label}</span>
      <span>
        {value} {um}
      </span>
    </div>
  );
}

function ZonePicker({
  label,
  letters,
  value,
  onChange,
}: {
  label: string;
  letters: string[];
  value: { letter: string; grade: number };
  onChange: (v: { letter: string; grade: number }) => void;
}) {
  const select =
    "rounded-xl border border-line bg-surface-2 px-2 py-2 font-mono text-sm text-ink outline-none focus:border-accent";
  return (
    <span className="grid gap-1 text-xs text-muted">
      {label}
      <span className="flex gap-1">
        <select
          aria-label={label}
          value={value.letter}
          onChange={(e) => onChange({ ...value, letter: e.target.value })}
          className={select}
        >
          {letters.map((l) => (
            <option key={l}>{l}</option>
          ))}
        </select>
        <select
          aria-label={`${label} IT`}
          value={value.grade}
          onChange={(e) => onChange({ ...value, grade: Number(e.target.value) })}
          className={select}
        >
          {GRADES.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </span>
    </span>
  );
}

/** Tolerance zones of hole and shaft against the zero line, to scale. */
function ZoneDiagram({
  fit,
  labels,
}: {
  fit: NonNullable<ReturnType<typeof computeFit>>;
  labels: { hole: string; shaft: string; zero: string; um: string };
}) {
  const W = 520;
  const H = 200;
  const top = Math.max(fit.hole.upper, fit.shaft.upper, 0);
  const bottom = Math.min(fit.hole.lower, fit.shaft.lower, 0);
  const span = top - bottom || 1;
  const y = (v: number) => 20 + ((top - v) / span) * (H - 40);
  const zone = (x: number, z: { upper: number; lower: number }, color: string, name: string) => (
    <g>
      <motion.rect
        initial={false}
        animate={{ y: y(z.upper), height: Math.max(2, y(z.lower) - y(z.upper)) }}
        transition={{ type: "spring", stiffness: 260, damping: 28 }}
        x={x}
        width={110}
        rx={6}
        fill={color}
        fillOpacity={0.22}
        stroke={color}
        strokeWidth={1.5}
      />
      <text x={x + 55} y={H - 2} textAnchor="middle" className="fill-muted text-[11px]">
        {name}
      </text>
      <text x={x + 116} y={y(z.upper) + 4} className="fill-ink font-mono text-[11px]">
        {fmt(z.upper)}
      </text>
      <text x={x + 116} y={y(z.lower) + 4} className="fill-ink font-mono text-[11px]">
        {fmt(z.lower)}
      </text>
    </g>
  );
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mt-5 w-full">
      <line x1={10} x2={W - 10} y1={y(0)} y2={y(0)} stroke="var(--ink)" strokeWidth={1.2} />
      <text x={W - 12} y={y(0) - 5} textAnchor="end" className="fill-muted text-[10px]">
        {labels.zero}, {labels.um}
      </text>
      {zone(130, fit.hole, "var(--accent)", labels.hole)}
      {zone(310, fit.shaft, "var(--ochre)", labels.shaft)}
    </svg>
  );
}
