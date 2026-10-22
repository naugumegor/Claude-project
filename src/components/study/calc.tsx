"use client";

import { useId, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Maximize2, RotateCcw, SlidersHorizontal, TriangleAlert } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import {
  evaluate,
  formatNumber,
  niceStep,
  solve,
  ticks,
  type CalcSource,
  type Scope,
} from "@/lib/calc";

const text = {
  ru: { title: "Живая формула", reset: "Сбросить", fit: "Подогнать оси", errors: "Ошибки в блоке calc" },
  en: { title: "Live formula", reset: "Reset", fit: "Fit axes", errors: "Errors in the calc block" },
};

const COLORS = ["var(--accent)", "var(--ochre)", "var(--plum)", "var(--rose)"];
const SAMPLES = 240;
const W = 640;
const H = 300;
const PAD = { l: 52, r: 16, t: 14, b: 34 };

type Box = { x0: number; x1: number; y0: number; y1: number };
type Series = { label: React.ReactNode; color: string; points: [number, number][]; explicit: boolean };

export function Calc({
  source,
  labels,
  locale,
}: {
  source: CalcSource;
  /** Server-rendered labels (they may hold $math$): values by name, plots by index, title. */
  labels: { title?: React.ReactNode; values: Record<string, React.ReactNode>; plots: React.ReactNode[] };
  locale: Locale;
}) {
  const t = text[locale];
  const sliders = source.values.filter((v) => v.range);
  const results = source.values.filter((v) => !v.range);

  const initial = useMemo(() => {
    const s: Scope = {};
    // Slider start values may depend on earlier constants, so solve top to bottom.
    const scope = solve(source.values, {});
    for (const v of sliders) s[v.name] = scope[v.name];
    return s;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- source never changes for a block
  }, []);

  const [slider, setSlider] = useState<Scope>(initial);
  const view = (s: Scope) => buildSeries(source, s, labels.plots);
  const [box, setBox] = useState<Box | null>(() => view(initial).fit);

  const scope = solve(source.values, slider);
  const { series, fit } = view(slider);

  const change = (name: string, value: number) => {
    const next = { ...slider, [name]: value };
    setSlider(next);
    // Axes only grow while sliding, so a bigger load visibly bends the beam further.
    const nextFit = view(next).fit;
    setBox((b) => (b && nextFit ? union(b, nextFit) : nextFit));
  };

  if (source.errors.length && !source.values.length && !source.plots.length) {
    return <Errors title={t.errors} errors={source.errors} />;
  }

  return (
    <div className="not-prose calc-block my-8 rounded-2xl border border-line bg-surface p-4 sm:p-5">
      <div className="mb-4 flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-lg bg-accent-soft text-accent">
          <SlidersHorizontal size={16} />
        </span>
        <span className="font-display font-bold">{labels.title ?? t.title}</span>
        <button
          type="button"
          onClick={() => {
            setSlider(initial);
            setBox(view(initial).fit);
          }}
          className="no-print group ml-auto inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-muted transition-colors hover:bg-accent-soft hover:text-accent"
        >
          <RotateCcw size={14} className="transition-transform group-hover:-rotate-90" />
          {t.reset}
        </button>
      </div>

      {sliders.length > 0 && (
        <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
          {sliders.map((v) => {
            const min = evaluate(v.range!.min, scope);
            const max = evaluate(v.range!.max, scope);
            const step = v.range!.step ? evaluate(v.range!.step, scope) : niceStep(max - min);
            const value = slider[v.name];
            return (
              <label key={v.name} className="block">
                <span className="flex items-baseline gap-2 text-sm">
                  <span className="truncate text-muted">{labels.values[v.name] ?? v.name}</span>
                  <span className="ml-auto shrink-0 font-mono font-semibold tabular-nums">
                    {v.name} = {formatNumber(value, locale)}
                    {v.unit && <span className="ml-1 font-sans font-normal text-muted">{v.unit}</span>}
                  </span>
                </span>
                <input
                  type="range"
                  min={min}
                  max={max}
                  step={step}
                  value={value}
                  onChange={(e) => change(v.name, Number(e.target.value))}
                  className="calc-range mt-1.5 w-full"
                />
              </label>
            );
          })}
        </div>
      )}

      {results.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {results.map((v) => (
            <div
              key={v.name}
              className="flex min-w-0 items-baseline gap-2 rounded-xl border border-line bg-surface-2 px-3 py-2"
            >
              <span className="truncate text-xs text-muted">{labels.values[v.name] ?? v.name}</span>
              <motion.span
                key={formatNumber(scope[v.name], locale)}
                initial={{ color: "var(--accent)" }}
                animate={{ color: "var(--ink)" }}
                transition={{ duration: 0.6 }}
                className="font-mono text-sm font-semibold tabular-nums"
              >
                {formatNumber(scope[v.name], locale)}
              </motion.span>
              {v.unit && <span className="text-xs text-muted">{v.unit}</span>}
            </div>
          ))}
        </div>
      )}

      {series.length > 0 && box && (
        <Chart
          series={series}
          box={box}
          axes={source.axes}
          locale={locale}
          markers={source.plots
            .filter((p) => p.variable in slider && p.exprs.length === 1)
            .map((p) => slider[p.variable])}
          onFit={fit ? () => setBox(fit) : undefined}
          fitLabel={t.fit}
        />
      )}

      {source.errors.length > 0 && <Errors title={t.errors} errors={source.errors} />}
    </div>
  );
}

function buildSeries(source: CalcSource, slider: Scope, plotLabels: React.ReactNode[]) {
  const scope = solve(source.values, slider);
  const series: Series[] = source.plots.map((p, i) => {
    const from = evaluate(p.from, scope);
    const to = evaluate(p.to, scope);
    const points: [number, number][] = [];
    if (Number.isFinite(from) && Number.isFinite(to) && to !== from) {
      for (let k = 0; k <= SAMPLES; k++) {
        const v = from + ((to - from) * k) / SAMPLES;
        // Re-solve with the plot variable pinned, so derived values that use it follow along.
        const local = solve(source.values, slider, { [p.variable]: v });
        const y = evaluate(p.exprs[p.exprs.length - 1], local);
        const x = p.exprs.length === 2 ? evaluate(p.exprs[0], local) : v;
        points.push([x, y]);
      }
    }
    return { label: plotLabels[i], color: COLORS[i % COLORS.length], points, explicit: p.exprs.length === 1 };
  });
  return { series, fit: fitBox(series) };
}

function fitBox(series: Series[]): Box | null {
  const xs: number[] = [];
  const ys: number[] = [];
  for (const s of series)
    for (const [x, y] of s.points)
      if (Number.isFinite(x) && Number.isFinite(y)) {
        xs.push(x);
        ys.push(y);
      }
  if (!xs.length) return null;
  const [x0, x1] = robust(xs);
  let [y0, y1] = robust(ys);
  // Show zero when the curve sits close enough to it: reads better for loads and deflections.
  if (y0 > 0 && y0 < y1 * 0.5) y0 = 0;
  if (y1 < 0 && y1 > y0 * 0.5) y1 = 0;
  if (y1 - y0 < 1e-12) {
    const d = Math.abs(y0) * 0.1 || 1;
    y0 -= d;
    y1 += d;
  }
  const pad = (y1 - y0) * 0.06;
  return { x0, x1: x1 > x0 ? x1 : x0 + 1, y0: y0 - pad, y1: y1 + pad };
}

/** Min and max, ignoring spikes like tan near its asymptote. */
function robust(values: number[]): [number, number] {
  const sorted = [...values].sort((a, b) => a - b);
  const lo = sorted[0];
  const hi = sorted[sorted.length - 1];
  const q = (p: number) => sorted[Math.floor(p * (sorted.length - 1))];
  const [q0, q1] = [q(0.02), q(0.98)];
  return (hi - lo) > (q1 - q0) * 20 ? [q0, q1] : [lo, hi];
}

function union(a: Box, b: Box): Box {
  return { x0: Math.min(a.x0, b.x0), x1: Math.max(a.x1, b.x1), y0: Math.min(a.y0, b.y0), y1: Math.max(a.y1, b.y1) };
}

function Chart({
  series,
  box,
  axes,
  locale,
  markers,
  onFit,
  fitLabel,
}: {
  series: Series[];
  box: Box;
  axes: [string, string];
  locale: Locale;
  markers: number[];
  onFit?: () => void;
  fitLabel: string;
}) {
  const clip = useId();
  const [hover, setHover] = useState<number | null>(null);
  const sx = (x: number) => PAD.l + ((x - box.x0) / (box.x1 - box.x0)) * (W - PAD.l - PAD.r);
  const sy = (y: number) => H - PAD.b - ((y - box.y0) / (box.y1 - box.y0)) * (H - PAD.t - PAD.b);
  const xTicks = ticks(box.x0, box.x1, 6);
  const yTicks = ticks(box.y0, box.y1, 5);

  const path = (points: [number, number][]) => {
    let d = "";
    let pen = false;
    for (const [x, y] of points) {
      if (!Number.isFinite(x) || !Number.isFinite(y)) {
        pen = false;
        continue;
      }
      // Clamp far-off points so a spike still draws inside the clip region.
      const py = Math.max(-H, Math.min(2 * H, sy(y)));
      d += `${pen ? "L" : "M"}${sx(x).toFixed(1)},${py.toFixed(1)}`;
      pen = true;
    }
    return d;
  };

  // Nearest sample of each explicit curve to the pointer.
  const readout =
    hover === null
      ? []
      : series
          .filter((s) => s.explicit && s.points.length)
          .map((s) => {
            let best = s.points[0];
            for (const p of s.points) if (Math.abs(p[0] - hover) < Math.abs(best[0] - hover)) best = p;
            return { s, p: best };
          });

  return (
    <div className="mt-5">
      <div className="relative">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full touch-none select-none overflow-visible"
          onPointerMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            const px = ((e.clientX - r.left) / r.width) * W;
            const x = box.x0 + ((px - PAD.l) / (W - PAD.l - PAD.r)) * (box.x1 - box.x0);
            setHover(x >= box.x0 && x <= box.x1 ? x : null);
          }}
          onPointerLeave={() => setHover(null)}
        >
          <defs>
            <clipPath id={clip}>
              <rect x={PAD.l} y={PAD.t} width={W - PAD.l - PAD.r} height={H - PAD.t - PAD.b} />
            </clipPath>
          </defs>
          {yTicks.map((y) => (
            <g key={`y${y}`}>
              <line x1={PAD.l} x2={W - PAD.r} y1={sy(y)} y2={sy(y)} stroke="var(--line)" strokeWidth={y === 0 ? 1.4 : 0.7} />
              <text x={PAD.l - 6} y={sy(y) + 3.5} textAnchor="end" className="fill-muted text-[10px] tabular-nums">
                {formatNumber(y, locale)}
              </text>
            </g>
          ))}
          {xTicks.map((x) => (
            <g key={`x${x}`}>
              <line x1={sx(x)} x2={sx(x)} y1={PAD.t} y2={H - PAD.b} stroke="var(--line)" strokeWidth={x === 0 ? 1.4 : 0.7} />
              <text x={sx(x)} y={H - PAD.b + 14} textAnchor="middle" className="fill-muted text-[10px] tabular-nums">
                {formatNumber(x, locale)}
              </text>
            </g>
          ))}
          {axes[0] && (
            <text x={W - PAD.r} y={H - 4} textAnchor="end" className="fill-muted text-[11px]">
              {axes[0]}
            </text>
          )}
          {axes[1] && (
            <text x={PAD.l + 4} y={PAD.t + 10} className="fill-muted text-[11px] font-semibold">
              {axes[1]}
            </text>
          )}

          <g clipPath={`url(#${clip})`}>
            {markers.map((m, i) => (
              <line
                key={i}
                x1={sx(m)}
                x2={sx(m)}
                y1={PAD.t}
                y2={H - PAD.b}
                stroke="var(--ochre)"
                strokeDasharray="4 4"
                strokeWidth={1.2}
              />
            ))}
            {series.map((s, i) => (
              <path
                key={i}
                d={path(s.points)}
                fill="none"
                stroke={s.color}
                strokeWidth={2.4}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            ))}
            {hover !== null && (
              <line x1={sx(hover)} x2={sx(hover)} y1={PAD.t} y2={H - PAD.b} stroke="var(--muted)" strokeWidth={0.8} />
            )}
            {readout.map(({ s, p }, i) =>
              Number.isFinite(p[1]) ? (
                <circle key={i} cx={sx(p[0])} cy={sy(p[1])} r={4} fill="var(--surface)" stroke={s.color} strokeWidth={2} />
              ) : null,
            )}
          </g>
        </svg>

        {readout.length > 0 && (
          <div className="pointer-events-none absolute right-2 top-2 rounded-lg border border-line bg-surface/95 px-2.5 py-1.5 text-xs shadow-sm">
            <div className="text-muted">
              {axes[0] ? axes[0].split(",")[0] : "x"} = {formatNumber(readout[0].p[0], locale)}
            </div>
            {readout.map(({ s, p }, i) => (
              <div key={i} className="flex items-center gap-1.5 font-mono tabular-nums">
                <span className="size-2 rounded-full" style={{ background: s.color }} />
                {formatNumber(p[1], locale)}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
        {series.map((s, i) =>
          s.label ? (
            <span key={i} className="inline-flex items-center gap-1.5">
              <span className="h-0.5 w-4 rounded" style={{ background: s.color }} />
              {s.label}
            </span>
          ) : null,
        )}
        {onFit && (
          <button
            type="button"
            onClick={onFit}
            className="no-print group ml-auto inline-flex items-center gap-1 rounded-md px-2 py-1 transition-colors hover:bg-surface-2 hover:text-ink"
          >
            <Maximize2 size={12} className="transition-transform group-hover:scale-125" />
            {fitLabel}
          </button>
        )}
      </div>
    </div>
  );
}

function Errors({ title, errors }: { title: string; errors: string[] }) {
  return (
    <div className="not-prose my-4 rounded-xl border border-rose bg-rose-soft px-4 py-3 text-sm">
      <p className="flex items-center gap-1.5 font-semibold text-rose">
        <TriangleAlert size={15} />
        {title}
      </p>
      <ul className="mt-1 list-inside list-disc font-mono text-xs">
        {errors.map((e) => (
          <li key={e}>{e}</li>
        ))}
      </ul>
    </div>
  );
}
