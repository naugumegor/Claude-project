"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ChartGantt, Pencil, Plus, Printer, RotateCcw, Trash2 } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { isoDate, parseDate, schedule, type GanttSource, type GanttTask } from "@/lib/business-blocks";
import { useStored } from "@/lib/use-stored";
import { BlockFrame, FrameButton, escapeHtml, printHtml } from "./frame";

// A Gantt chart: tasks start on a day, on a date or after other tasks ("после 1,2"); the critical
// path, where any delay moves the finish date, is drawn in red. In edit mode every field is
// editable; the /tools constructor keeps the plan in this browser.

const UI = {
  ru: {
    title: "Диаграмма Ганта",
    edit: "Править",
    pdf: "PDF",
    reset: "Сбросить",
    add: "Задача",
    task: "Задача",
    start: "Начало",
    days: "Дней",
    done: "Готово, %",
    total: "Длительность проекта",
    finish: "Финиш",
    critical: "Критический путь",
    dayShort: "д",
    startHint: "день, дата или «после 1,2»",
    newTask: "Новая задача",
    projectStart: "Старт проекта",
    confirm: "Сбросить план к исходному?",
  },
  en: {
    title: "Gantt chart",
    edit: "Edit",
    pdf: "PDF",
    reset: "Reset",
    add: "Task",
    task: "Task",
    start: "Start",
    days: "Days",
    done: "Done, %",
    total: "Project length",
    finish: "Finish",
    critical: "Critical path",
    dayShort: "d",
    startHint: "day, date or “after 1,2”",
    newTask: "New task",
    projectStart: "Project start",
    confirm: "Reset the plan to the original?",
  },
};

const DAY = 86_400_000;

export function Gantt({
  source,
  locale,
  storageKey,
  startEditing = false,
}: {
  source: GanttSource;
  locale: Locale;
  /** Set on the /tools constructor: the plan is saved in this browser. */
  storageKey?: string;
  startEditing?: boolean;
}) {
  const ui = UI[locale];
  const [plan, setPlan, resetPlan] = useStored<GanttSource>(storageKey ?? null, source);
  const [editing, setEditing] = useState(startEditing);
  // Today's marker: the clock is read after mount, so prerendered HTML doesn't freeze a date.
  const [now, setNow] = useState<number | null>(null);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- the current time is only known in the browser
  useEffect(() => setNow(Date.now()), []);
  const { tasks, days, origin } = schedule(plan);
  const dated = parseDate(plan.start) !== null || plan.tasks.some((t) => parseDate(t.start) !== null);
  const cell = days > 90 ? 8 : days > 45 ? 14 : 24;
  // Positions are percentages of the timeline, which fills the card and scrolls when it can't fit.
  const pct = (d: number) => `${(d / days) * 100}%`;
  // Label every day when there is room, otherwise every few days or every week.
  const step = dated ? (cell >= 24 ? 3 : 7) : cell >= 24 ? 1 : cell >= 14 ? 5 : 7;
  const fmt = (d: number) =>
    new Date(origin + d * DAY).toLocaleDateString(locale, { day: "numeric", month: "short", timeZone: "UTC" });
  const label = (d: number) => (dated ? fmt(d) : `${d + 1}`);
  const today = now === null ? -1 : Math.floor((now - origin) / DAY);

  const update = (i: number, patch: Partial<GanttTask>) =>
    setPlan((p) => ({ ...p, tasks: p.tasks.map((t, j) => (j === i ? { ...t, ...patch } : t)) }));
  const remove = (i: number) =>
    setPlan((p) => ({
      ...p,
      // Renumber "после N" references so they keep pointing at the same tasks.
      tasks: p.tasks
        .filter((_, j) => j !== i)
        .map((t) => {
          const m = t.start.match(/^((?:после|after)\s+)([\d,\s]+)$/i);
          if (!m) return t;
          const refs = m[2]
            .split(",")
            .map((n) => Number(n.trim()))
            .filter((n) => n && n !== i + 1)
            .map((n) => (n > i + 1 ? n - 1 : n));
          return { ...t, start: refs.length ? `${m[1]}${refs.join(",")}` : "1" };
        }),
    }));

  const print = () => {
    const rows = tasks
      .map(
        (t, i) =>
          `<tr><td>${i + 1}</td><td>${escapeHtml(t.name)}</td><td>${label(t.from)}</td><td>${label(t.to - 1)}</td><td>${t.days}</td><td>${t.done}%</td>` +
          `<td style="width:45%"><div style="margin-left:${(t.from / days) * 100}%;width:${(t.days / days) * 100}%" class="bar${t.critical ? " crit" : ""}"></div></td></tr>`,
      )
      .join("");
    const title = plan.title || ui.title;
    printHtml(
      title,
      `<h1>${escapeHtml(title)}</h1><p class="sub">${ui.total}: ${days} ${ui.dayShort}${dated ? ` · ${fmt(0)} – ${fmt(days - 1)}` : ""} · Ingenium</p>` +
        `<table><tr><th>#</th><th>${ui.task}</th><th>${ui.start}</th><th>${ui.finish}</th><th>${ui.days}</th><th>${ui.done}</th><th></th></tr>${rows}</table>`,
    );
  };

  return (
    <BlockFrame
      icon={ChartGantt}
      tone="plum"
      title={plan.title || ui.title}
      actions={
        <>
          <FrameButton onClick={() => setEditing((e) => !e)} active={editing}>
            <Pencil size={14} />
            {ui.edit}
          </FrameButton>
          {(editing || storageKey) && (
            <FrameButton
              onClick={() => {
                if (window.confirm(ui.confirm)) resetPlan();
              }}
            >
              <RotateCcw size={14} className="transition-transform group-hover:-rotate-90" />
              {ui.reset}
            </FrameButton>
          )}
          <FrameButton onClick={print}>
            <Printer size={14} />
            {ui.pdf}
          </FrameButton>
        </>
      }
    >
      <div className="flex overflow-hidden rounded-xl border border-line">
        <div className="w-36 shrink-0 border-r border-line bg-surface-2/60 sm:w-48">
          <div className="h-8 border-b border-line" />
          {tasks.map((t, i) => (
            <div key={i} className="flex h-9 items-center gap-1.5 border-b border-line/60 px-2 text-[13px] last:border-b-0">
              <span className="font-mono text-[11px] text-muted">{i + 1}</span>
              <span className="truncate" title={t.name}>
                {t.name}
              </span>
            </div>
          ))}
        </div>
        <div className="min-w-0 flex-1 overflow-x-auto">
          <div className="relative pr-2" style={{ minWidth: days * cell + 8 }}>
            <div className="relative h-8 border-b border-line">
              {Array.from({ length: Math.ceil(days / step) }, (_, k) => (
                <span
                  key={k}
                  className="absolute bottom-0 top-0 whitespace-nowrap border-l border-line/60 pl-1 pt-2 text-[10px] text-muted"
                  style={{ left: pct(k * step) }}
                >
                  {label(k * step)}
                </span>
              ))}
            </div>
            {dated && today >= 0 && today < days && (
              <div className="absolute bottom-0 top-8 z-10 w-0.5 bg-ochre/70" style={{ left: pct(today + 0.5) }} />
            )}
            {tasks.map((t, i) => (
              <div key={i} className="relative h-9 border-b border-line/60 last:border-b-0">
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: i * 0.04 }}
                  title={`${t.name}: ${label(t.from)} – ${label(t.to - 1)} (${t.days} ${ui.dayShort}, ${t.done}%)`}
                  className={`absolute top-1.5 h-6 origin-left overflow-hidden rounded-md ${t.critical ? "bg-rose/25 ring-1 ring-rose" : "bg-accent/25 ring-1 ring-accent"}`}
                  style={{ left: `calc(${pct(t.from)} + 2px)`, width: `max(calc(${pct(t.days)} - 4px), 6px)` }}
                >
                  <div className={`h-full ${t.critical ? "bg-rose/70" : "bg-accent/70"}`} style={{ width: `${t.done}%` }} />
                  {cell * t.days > 44 && (
                    <span className="absolute inset-0 flex items-center px-1.5 font-mono text-[10px] font-semibold text-ink">
                      {t.done}%
                    </span>
                  )}
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted">
        <span>
          {ui.total}: <b className="font-mono text-ink">{days}</b> {ui.dayShort}
          {dated && ` · ${fmt(0)} – ${fmt(days - 1)}`}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-4 rounded-sm bg-rose/70" />
          {ui.critical}
        </span>
      </div>

      {editing && (
        <div className="mt-4 rounded-xl border border-line p-3">
          <div className="mb-3 grid gap-2 sm:grid-cols-2">
            <input
              value={plan.title}
              onChange={(e) => setPlan((p) => ({ ...p, title: e.target.value }))}
              placeholder={ui.title}
              className="rounded-lg border border-line bg-surface-2 px-2.5 py-1.5 text-sm outline-none focus:border-accent"
            />
            <label className="flex items-center gap-2 text-sm text-muted">
              {ui.projectStart}
              <input
                type="date"
                value={plan.start}
                onChange={(e) => setPlan((p) => ({ ...p, start: e.target.value }))}
                className="rounded-lg border border-line bg-surface-2 px-2 py-1 text-ink outline-none focus:border-accent"
              />
            </label>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[34rem] text-sm">
              <thead>
                <tr className="text-left text-xs text-muted">
                  <th className="w-6 pb-1 font-normal">#</th>
                  <th className="pb-1 font-normal">{ui.task}</th>
                  <th className="pb-1 font-normal">{ui.start}</th>
                  <th className="w-20 pb-1 font-normal">{ui.days}</th>
                  <th className="w-20 pb-1 font-normal">{ui.done}</th>
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody>
                {plan.tasks.map((t, i) => (
                  <tr key={i}>
                    <td className="font-mono text-xs text-muted">{i + 1}</td>
                    <td className="py-0.5 pr-1.5">
                      <input value={t.name} onChange={(e) => update(i, { name: e.target.value })} className={INPUT} />
                    </td>
                    <td className="py-0.5 pr-1.5">
                      <input
                        value={t.start}
                        onChange={(e) => update(i, { start: e.target.value })}
                        placeholder={ui.startHint}
                        className={`${INPUT} font-mono`}
                      />
                    </td>
                    <td className="py-0.5 pr-1.5">
                      <input
                        type="number"
                        min={1}
                        value={t.days}
                        onChange={(e) => update(i, { days: Math.max(1, Math.round(Number(e.target.value) || 1)) })}
                        className={`${INPUT} font-mono`}
                      />
                    </td>
                    <td className="py-0.5 pr-1.5">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        step={5}
                        value={t.done}
                        onChange={(e) => update(i, { done: Math.min(100, Math.max(0, Number(e.target.value) || 0)) })}
                        className={`${INPUT} font-mono`}
                      />
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => remove(i)}
                        aria-label="×"
                        className="rounded-md p-1.5 text-muted transition-colors hover:bg-rose-soft hover:text-rose"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <FrameButton
            onClick={() =>
              setPlan((p) => ({
                ...p,
                tasks: [...p.tasks, { name: ui.newTask, start: p.tasks.length ? `${locale === "ru" ? "после" : "after"} ${p.tasks.length}` : "1", days: 3, done: 0 }],
              }))
            }
          >
            <Plus size={14} />
            {ui.add}
          </FrameButton>
          <p className="mt-1 text-[11px] text-muted">
            {ui.start}: {ui.startHint}. {dated ? isoDate(origin) : ""}
          </p>
        </div>
      )}
    </BlockFrame>
  );
}

const INPUT = "w-full rounded-md border border-line bg-surface-2 px-2 py-1 outline-none focus:border-accent";
