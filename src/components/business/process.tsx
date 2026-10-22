"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, ExternalLink, Filter, Workflow } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { BlockFrame } from "./frame";

// A clickable process: a flow of steps with arrows, or a funnel whose bars shrink with the metric
// and show the conversion between steps. Clicking a step opens its description.

export type ProcessStepView = {
  title: React.ReactNode;
  metric: string;
  value: number;
  description?: React.ReactNode;
  link: string;
};

const UI = {
  ru: { flow: "Процесс", funnel: "Воронка", conv: "конверсия", total: "сквозная", open: "Подробнее", hint: "Нажмите на шаг, чтобы раскрыть" },
  en: { flow: "Process", funnel: "Funnel", conv: "conversion", total: "overall", open: "Open", hint: "Click a step to expand it" },
};

const pctText = (x: number, locale: Locale) =>
  `${(x * 100).toLocaleString(locale, { maximumFractionDigits: x < 0.1 ? 2 : 1 })} %`;

const COLORS = ["var(--accent)", "var(--plum)", "var(--ochre)", "var(--rose)"];

export function ProcessBlock({
  type,
  title,
  steps,
  locale,
}: {
  type: "flow" | "funnel";
  title?: React.ReactNode;
  steps: ProcessStepView[];
  locale: Locale;
}) {
  const ui = UI[locale];
  const [open, setOpen] = useState<number | null>(null);
  const toggle = (i: number) => setOpen((o) => (o === i ? null : i));
  const detail = open !== null && steps[open] && (steps[open].description || steps[open].link) ? steps[open] : null;

  return (
    <BlockFrame icon={type === "funnel" ? Filter : Workflow} tone="plum" title={title ?? ui[type]}>
      {type === "flow" ? (
        <ol className="flex flex-col items-stretch gap-1 sm:flex-row sm:flex-wrap sm:items-center">
          {steps.map((s, i) => (
            <li key={i} className="flex flex-col items-center gap-1 sm:flex-row">
              <motion.button
                type="button"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => toggle(i)}
                aria-expanded={open === i}
                className={`w-full rounded-xl border-2 px-3.5 py-2.5 text-left transition-colors sm:w-auto sm:max-w-56 ${
                  open === i ? "border-accent bg-accent-soft" : "border-line bg-surface-2/60 hover:border-accent/60"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span
                    className="flex size-6 shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold text-white"
                    style={{ background: COLORS[i % COLORS.length] }}
                  >
                    {i + 1}
                  </span>
                  <span className="text-sm font-semibold">{s.title}</span>
                </span>
                {s.metric && <span className="mt-1 block pl-8 font-mono text-xs text-muted">{s.metric}</span>}
              </motion.button>
              {i < steps.length - 1 && (
                <ArrowRight size={18} className="shrink-0 rotate-90 text-muted sm:rotate-0" aria-hidden />
              )}
            </li>
          ))}
        </ol>
      ) : (
        <Funnel steps={steps} open={open} onToggle={toggle} locale={locale} />
      )}
      <AnimatePresence initial={false}>
        {detail && (
          <motion.div
            key={open}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 rounded-xl border border-line bg-surface-2 p-3 text-sm leading-relaxed">
              <div className="font-semibold">{detail.title}</div>
              {detail.description && <div className="mt-1 text-muted">{detail.description}</div>}
              {detail.link && (
                <a
                  href={detail.link}
                  className="mt-2 inline-flex items-center gap-1 text-accent hover:underline"
                  {...(/^https?:/.test(detail.link) ? { target: "_blank", rel: "noreferrer" } : {})}
                >
                  {ui.open}
                  <ExternalLink size={12} />
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <p className="no-print mt-2 text-[11px] text-muted">{ui.hint}</p>
    </BlockFrame>
  );
}

function Funnel({
  steps,
  open,
  onToggle,
  locale,
}: {
  steps: ProcessStepView[];
  open: number | null;
  onToggle: (i: number) => void;
  locale: Locale;
}) {
  const ui = UI[locale];
  const max = Math.max(...steps.map((s) => (Number.isFinite(s.value) ? s.value : 0)), 1);
  const first = steps[0]?.value;
  const last = steps.at(-1)?.value;
  return (
    <div className="grid gap-1.5">
      {steps.map((s, i) => {
        const width = Number.isFinite(s.value) ? Math.max(14, (s.value / max) * 100) : 100 - i * (70 / steps.length);
        const prev = steps[i - 1]?.value;
        const conv = i > 0 && prev > 0 && Number.isFinite(s.value) ? s.value / prev : NaN;
        return (
          <div key={i}>
            {Number.isFinite(conv) && (
              <div className="py-0.5 text-center font-mono text-[11px] text-muted">
                ↓ {ui.conv} {pctText(conv, locale)}
              </div>
            )}
            <motion.button
              type="button"
              onClick={() => onToggle(i)}
              aria-expanded={open === i}
              initial={{ width: "8%" }}
              whileInView={{ width: `${width}%` }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 90, damping: 18, delay: i * 0.06 }}
              whileHover={{ scale: 1.015 }}
              className={`mx-auto flex min-w-fit items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 text-left text-white shadow-sm ring-offset-2 ring-offset-surface ${
                open === i ? "ring-2 ring-ink/40" : ""
              }`}
              style={{ background: COLORS[i % COLORS.length] }}
            >
              <span className="truncate text-sm font-semibold">{s.title}</span>
              <span className="shrink-0 font-mono text-sm font-bold tabular-nums">{s.metric}</span>
            </motion.button>
          </div>
        );
      })}
      {steps.length > 2 && first > 0 && Number.isFinite(last) && (
        <p className="mt-2 text-center text-xs text-muted">
          {ui.total} {ui.conv}: <b className="font-mono text-ink">{pctText((last ?? 0) / first, locale)}</b>
        </p>
      )}
    </div>
  );
}
