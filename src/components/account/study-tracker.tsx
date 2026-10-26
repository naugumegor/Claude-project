"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { CalendarDays, Clock, Flame, Trophy } from "lucide-react";
import type { Dictionary } from "@/dictionaries";
import type { Locale } from "@/lib/i18n";
import { addDays, localDay, streaks } from "@/lib/streaks";

type Labels = Dictionary["tracker"];
type Day = { day: string; count: number; minutes: number };

const WEEKS = 53;
// Sequential ramp: one hue (accent), light to dark, mixed into the empty-cell surface.
const LEVELS = ["var(--surface-2)", "c 30%", "c 55%", "c 78%", "var(--accent)"].map((v) =>
  v.startsWith("c ") ? `color-mix(in oklab, var(--accent) ${v.slice(2)}, var(--surface-2))` : v,
);
const level = (n: number) => (n === 0 ? 0 : n <= 1 ? 1 : n <= 3 ? 2 : n <= 5 ? 3 : 4);

/** The «Учёба» tab: today's pomodoros, streaks, totals and a GitHub-style year heat map. */
export function StudyTracker({
  days,
  totals,
  labels,
  locale,
}: {
  days: Day[];
  totals: { count: number; minutes: number; days: number };
  labels: Labels;
  locale: Locale;
}) {
  // "Today" is the reader's own date, known only in the browser; the server render uses its own.
  const [today, setToday] = useState(() => days.at(-1)?.day ?? new Date().toISOString().slice(0, 10));
  useEffect(() => setToday(localDay()), []); // eslint-disable-line react-hooks/set-state-in-effect -- the clock is browser-only

  const byDay = useMemo(() => new Map(days.map((d) => [d.day, d])), [days]);
  const { current, longest } = useMemo(() => streaks(new Set(byDay.keys()), today), [byDay, today]);
  const todayRow = byDay.get(today);

  // Columns are weeks (Monday first), the last one holds today.
  const grid = useMemo(() => {
    const weekday = (new Date(`${today}T00:00:00Z`).getUTCDay() + 6) % 7;
    const start = addDays(today, -weekday - (WEEKS - 1) * 7);
    return Array.from({ length: WEEKS }, (_, w) =>
      Array.from({ length: 7 }, (_, d) => {
        const day = addDays(start, w * 7 + d);
        return day > today ? null : day;
      }),
    );
  }, [today]);

  const monthFmt = new Intl.DateTimeFormat(locale, { month: "short", timeZone: "UTC" });
  const dayFmt = new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", weekday: "short", timeZone: "UTC" });
  // A month is named above the week that holds its 1st.
  const months = grid.map((week) => {
    const first = week.find((d) => d?.endsWith("-01"));
    return first ? monthFmt.format(new Date(`${first}T00:00:00Z`)) : "";
  });

  const [hover, setHover] = useState<string | null>(null);
  const shown = hover ?? today;
  const shownRow = byDay.get(shown);

  // On phones the year doesn't fit: start scrolled to the recent end.
  const scroller = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scroller.current) scroller.current.scrollLeft = scroller.current.scrollWidth;
  }, []);

  const tiles = [
    {
      icon: Clock,
      label: labels.today,
      value: todayRow?.count ?? 0,
      unit: labels.pomodoros,
      note: `${todayRow?.minutes ?? 0} ${labels.min}`,
    },
    { icon: Flame, label: labels.streak, value: current, unit: labels.days, hot: current > 0 },
    { icon: Trophy, label: labels.record, value: longest, unit: labels.days },
    {
      icon: CalendarDays,
      label: labels.total,
      value: Math.round((totals.minutes / 60) * 10) / 10,
      unit: labels.hours,
      note: `${totals.days} ${labels.activeDays}`,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {tiles.map((t, i) => (
          <motion.div
            key={t.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="group rounded-2xl border border-line bg-surface p-4"
          >
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted">
              <t.icon
                size={14}
                className={`transition-transform group-hover:scale-110 ${t.hot ? "fill-rose/20 text-rose" : ""}`}
              />
              {t.label}
            </p>
            <p className="mt-2 font-display text-3xl font-extrabold tabular-nums tracking-tight">
              {t.value}
              <span className="ml-1 text-sm font-medium text-muted">{t.unit}</span>
            </p>
            {t.note && <p className="mt-0.5 text-xs text-muted">{t.note}</p>}
          </motion.div>
        ))}
      </div>

      <div className="rounded-2xl border border-line bg-surface p-4 sm:p-5">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="font-display font-bold">{labels.heatmap}</h3>
          <p className="text-xs text-muted" aria-live="polite">
            <span className="font-medium text-ink">{dayFmt.format(new Date(`${shown}T00:00:00Z`))}</span>
            {" · "}
            {shownRow ? `${shownRow.count} ${labels.pomodoros}, ${shownRow.minutes} ${labels.min}` : labels.none}
          </p>
        </div>

        <div ref={scroller} className="overflow-x-auto pb-1 pr-1">
          <div className="inline-grid grid-cols-[auto_1fr] gap-x-2" onMouseLeave={() => setHover(null)}>
            <span className="sticky left-0 bg-surface" />
            <div className="flex gap-[2px] text-[10px] text-muted">
              {months.map((m, w) => (
                <span key={w} className="w-[10px] overflow-visible whitespace-nowrap">
                  {m}
                </span>
              ))}
            </div>
            <div className="sticky left-0 z-10 grid grid-rows-7 gap-[2px] bg-surface pr-1 text-[10px] leading-[10px] text-muted">
              {labels.weekdays.map((d, i) => (
                <span key={i}>{d}</span>
              ))}
            </div>
            <div className="flex gap-[2px]" role="grid" aria-label={labels.heatmap}>
              {grid.map((week, w) => (
                <div key={w} className="grid grid-rows-7 gap-[2px]" role="row">
                  {week.map((day, d) => {
                    if (!day) return <span key={d} className="size-[10px]" />;
                    const n = byDay.get(day)?.count ?? 0;
                    return (
                      <span
                        key={d}
                        role="gridcell"
                        aria-label={`${day}: ${n}`}
                        title={`${dayFmt.format(new Date(`${day}T00:00:00Z`))}: ${n}`}
                        onMouseEnter={() => setHover(day)}
                        onClick={() => setHover(day)}
                        className={`size-[10px] rounded-[3px] transition-transform hover:scale-125 ${
                          day === today ? "ring-1 ring-ink/40 ring-offset-1 ring-offset-surface" : ""
                        }`}
                        style={{ background: LEVELS[level(n)] }}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-end gap-1.5 text-[10px] text-muted">
          {labels.less}
          {LEVELS.map((c) => (
            <span key={c} className="size-[10px] rounded-[3px]" style={{ background: c }} />
          ))}
          {labels.more}
        </div>
      </div>

      {totals.count === 0 ? (
        <p className="rounded-2xl border border-dashed border-line px-6 py-8 text-center text-muted">{labels.empty}</p>
      ) : (
        !todayRow &&
        current > 0 && (
          <p className="flex items-center gap-2 rounded-2xl bg-rose-soft px-4 py-3 text-sm text-rose">
            <Flame size={16} />
            {labels.keepUp}
          </p>
        )
      )}
    </div>
  );
}
