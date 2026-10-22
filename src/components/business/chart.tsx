"use client";

import { useId, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { formatNumber, ticks } from "@/lib/calc";

// A small SVG chart for the business tools: lines, bars and shaded areas over one x axis,
// with vertical markers (break-even, payback) and a hover readout.

export type ChartSeries =
  | { kind: "line"; label: string; color: string; points: [number, number][]; dashed?: boolean }
  | { kind: "bars"; label: string; color: string; negative?: string; points: [number, number][] }
  | { kind: "area"; label: string; color: string; points: [number, number][] };

export type ChartMarker = { x: number; label: string; color?: string };

const W = 640;
const H = 280;
const PAD = { l: 58, r: 16, t: 14, b: 34 };

export function MiniChart({
  series,
  markers = [],
  axes = ["", ""],
  locale,
  xFormat,
}: {
  series: ChartSeries[];
  markers?: ChartMarker[];
  axes?: [string, string];
  locale: Locale;
  xFormat?: (x: number) => string;
}) {
  const clip = useId();
  const [hover, setHover] = useState<number | null>(null);
  const xs = series.flatMap((s) => s.points.map((p) => p[0]));
  const ys = series.flatMap((s) => s.points.map((p) => p[1])).concat(0);
  const finite = (v: number[]) => v.filter(Number.isFinite);
  let [x0, x1] = [Math.min(...finite(xs)), Math.max(...finite(xs))];
  let [y0, y1] = [Math.min(...finite(ys)), Math.max(...finite(ys))];
  if (!(x1 > x0)) x1 = x0 + 1;
  if (!(y1 > y0)) y1 = y0 + 1;
  const hasBars = series.some((s) => s.kind === "bars");
  if (hasBars) {
    x0 -= 0.6;
    x1 += 0.6;
  }
  const pad = (y1 - y0) * 0.08;
  y0 -= y0 < 0 ? pad : 0;
  y1 += pad;

  const sx = (x: number) => PAD.l + ((x - x0) / (x1 - x0)) * (W - PAD.l - PAD.r);
  const sy = (y: number) => H - PAD.b - ((y - y0) / (y1 - y0)) * (H - PAD.t - PAD.b);
  const fx = xFormat ?? ((x: number) => formatNumber(x, locale));
  const barW = hasBars ? Math.max(4, ((W - PAD.l - PAD.r) / (x1 - x0)) * 0.6) : 0;

  const linePath = (pts: [number, number][]) =>
    pts
      .filter(([x, y]) => Number.isFinite(x) && Number.isFinite(y))
      .map(([x, y], i) => `${i ? "L" : "M"}${sx(x).toFixed(1)},${sy(y).toFixed(1)}`)
      .join("");

  const readout =
    hover === null
      ? []
      : series
          .filter((s) => s.points.length)
          .map((s) => {
            let best = s.points[0];
            for (const p of s.points) if (Math.abs(p[0] - hover) < Math.abs(best[0] - hover)) best = p;
            return { s, p: best };
          });

  return (
    <div className="mt-4">
      <div className="relative">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full touch-none select-none overflow-visible"
          onPointerMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            const px = ((e.clientX - r.left) / r.width) * W;
            const x = x0 + ((px - PAD.l) / (W - PAD.l - PAD.r)) * (x1 - x0);
            setHover(x >= x0 && x <= x1 ? x : null);
          }}
          onPointerLeave={() => setHover(null)}
        >
          <defs>
            <clipPath id={clip}>
              <rect x={PAD.l} y={PAD.t} width={W - PAD.l - PAD.r} height={H - PAD.t - PAD.b} />
            </clipPath>
          </defs>
          {ticks(y0, y1, 5).map((y) => (
            <g key={`y${y}`}>
              <line x1={PAD.l} x2={W - PAD.r} y1={sy(y)} y2={sy(y)} stroke="var(--line)" strokeWidth={y === 0 ? 1.4 : 0.7} />
              <text x={PAD.l - 6} y={sy(y) + 3.5} textAnchor="end" className="fill-muted text-[10px] tabular-nums">
                {formatNumber(y, locale)}
              </text>
            </g>
          ))}
          {ticks(hasBars ? x0 + 0.6 : x0, hasBars ? x1 - 0.6 : x1, 8)
            // Bars sit on whole periods, so half-period ticks would repeat labels.
            .filter((x) => !hasBars || Number.isInteger(x))
            .map((x) => (
            <text key={`x${x}`} x={sx(x)} y={H - PAD.b + 14} textAnchor="middle" className="fill-muted text-[10px] tabular-nums">
              {fx(x)}
            </text>
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
            {series.map((s, i) => {
              if (s.kind === "bars")
                return (
                  <g key={i}>
                    {s.points.map(([x, y]) => (
                      <rect
                        key={x}
                        x={sx(x) - barW / 2}
                        width={barW}
                        y={sy(Math.max(0, y))}
                        height={Math.abs(sy(y) - sy(0))}
                        rx={3}
                        fill={y < 0 ? (s.negative ?? "var(--rose)") : s.color}
                        fillOpacity={0.75}
                      />
                    ))}
                  </g>
                );
              if (s.kind === "area")
                return <path key={i} d={`${linePath(s.points)}Z`} fill={s.color} fillOpacity={0.18} stroke="none" />;
              return (
                <path
                  key={i}
                  d={linePath(s.points)}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={2.4}
                  strokeDasharray={s.dashed ? "6 5" : undefined}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              );
            })}
            {markers.map((m, i) =>
              Number.isFinite(m.x) && m.x >= x0 && m.x <= x1 ? (
                <g key={i}>
                  <line x1={sx(m.x)} x2={sx(m.x)} y1={PAD.t} y2={H - PAD.b} stroke={m.color ?? "var(--ochre)"} strokeDasharray="4 4" strokeWidth={1.4} />
                  <text
                    x={sx(m.x) + (sx(m.x) > W * 0.6 ? -4 : 4)}
                    y={PAD.t + 22 + i * 13}
                    textAnchor={sx(m.x) > W * 0.6 ? "end" : "start"}
                    className="text-[10px] font-semibold"
                    fill={m.color ?? "var(--ochre)"}
                  >
                    {m.label}
                  </text>
                </g>
              ) : null,
            )}
            {hover !== null && <line x1={sx(hover)} x2={sx(hover)} y1={PAD.t} y2={H - PAD.b} stroke="var(--muted)" strokeWidth={0.8} />}
          </g>
        </svg>
        {readout.length > 0 && (
          <div className="pointer-events-none absolute right-2 top-2 rounded-lg border border-line bg-surface/95 px-2.5 py-1.5 text-xs shadow-sm">
            <div className="text-muted">{fx(readout[0].p[0])}</div>
            {readout.map(({ s, p }, i) => (
              <div key={i} className="flex items-center gap-1.5 font-mono tabular-nums">
                <span className="size-2 rounded-full" style={{ background: s.color }} />
                {formatNumber(p[1], locale)}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
        {series
          .filter((s) => s.kind !== "area")
          .map((s, i) => (
            <span key={i} className="inline-flex items-center gap-1.5">
              <span className="h-0.5 w-4 rounded" style={{ background: s.color }} />
              {s.label}
            </span>
          ))}
      </div>
    </div>
  );
}
