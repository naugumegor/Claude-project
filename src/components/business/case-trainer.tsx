"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Check, CircleHelp, RotateCcw, Scale, X } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import type { CaseOption } from "@/lib/business-blocks";
import { BlockFrame, FrameButton } from "./frame";

// The decision trainer: a business situation, a few options, and after the choice the reasoning
// behind every option. "Good" scores a point, "partial" half a point.

export type CaseView = {
  id: string;
  situation: React.ReactNode;
  options: (Omit<CaseOption, "text" | "why"> & { text: React.ReactNode; why?: React.ReactNode })[];
};

const UI = {
  ru: {
    title: "Тренажёр решений",
    of: "из",
    next: "Дальше",
    finish: "Итог",
    again: "Пройти заново",
    score: "Счёт",
    good: "Сильное решение",
    partial: "Можно, но есть риски",
    bad: "Плохое решение",
    result: (s: number, n: number) =>
      s >= n * 0.8 ? "Отлично: мыслите как управленец." : s >= n * 0.5 ? "Неплохо, но разберите пояснения." : "Стоит перечитать конспект и попробовать ещё.",
  },
  en: {
    title: "Decision trainer",
    of: "of",
    next: "Next",
    finish: "Result",
    again: "Try again",
    score: "Score",
    good: "Strong decision",
    partial: "Possible, but risky",
    bad: "Poor decision",
    result: (s: number, n: number) =>
      s >= n * 0.8 ? "Great: you think like a manager." : s >= n * 0.5 ? "Not bad, read the explanations." : "Reread the note and try again.",
  },
};

const STYLE = {
  good: { box: "border-accent bg-accent-soft", icon: Check, dot: "bg-accent text-accent-ink", points: 1 },
  partial: { box: "border-ochre bg-ochre-soft", icon: Scale, dot: "bg-ochre text-white", points: 0.5 },
  bad: { box: "border-rose bg-rose-soft", icon: X, dot: "bg-rose text-white", points: 0 },
};

export function CaseTrainer({ cases, title, locale }: { cases: CaseView[]; title?: React.ReactNode; locale: Locale }) {
  const ui = UI[locale];
  const [step, setStep] = useState(0);
  const [picks, setPicks] = useState<number[]>([]);
  const done = step >= cases.length;
  const current = cases[step];
  const picked = picks[step];
  const score = picks.reduce((s, p, i) => s + STYLE[cases[i].options[p].verdict].points, 0);

  return (
    <BlockFrame
      icon={CircleHelp}
      tone="ochre"
      title={title ?? ui.title}
      actions={
        <span className="rounded-full bg-surface-2 px-2.5 py-1 font-mono text-xs tabular-nums text-muted">
          {ui.score}: {score.toLocaleString(locale)} / {cases.length}
        </span>
      }
    >
      <div className="mb-4 flex gap-1">
        {cases.map((c, i) => (
          <span
            key={c.id}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i < picks.length ? STYLE[cases[i].options[picks[i]].verdict].dot.split(" ")[0] : i === step ? "bg-accent/40" : "bg-line"
            }`}
          />
        ))}
      </div>
      <AnimatePresence mode="wait" initial={false}>
        {done ? (
          <motion.div key="done" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="py-4 text-center">
            <div className="font-display text-4xl font-extrabold text-accent">
              {score.toLocaleString(locale)} / {cases.length}
            </div>
            <p className="mt-2 text-sm">{ui.result(score, cases.length)}</p>
            <button
              type="button"
              onClick={() => {
                setPicks([]);
                setStep(0);
              }}
              className="group mt-4 inline-flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-accent-ink"
            >
              <RotateCcw size={14} className="transition-transform group-hover:-rotate-90" />
              {ui.again}
            </button>
          </motion.div>
        ) : (
          <motion.div key={current.id} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              {step + 1} {ui.of} {cases.length}
            </p>
            <div className="mt-1 text-[15px] leading-relaxed">{current.situation}</div>
            <div className="mt-4 grid gap-2">
              {current.options.map((o, i) => {
                const s = STYLE[o.verdict];
                const show = picked !== undefined;
                const Icon = s.icon;
                return (
                  <motion.button
                    key={i}
                    type="button"
                    disabled={show}
                    whileHover={show ? undefined : { x: 3 }}
                    onClick={() => setPicks((p) => [...p.slice(0, step), i])}
                    className={`rounded-xl border-2 p-3 text-left text-sm transition-colors ${
                      show ? (i === picked ? s.box : o.verdict === "good" ? `${s.box} opacity-80` : "border-line opacity-70") : "border-line hover:border-accent"
                    }`}
                  >
                    <span className="flex items-start gap-2.5">
                      <span
                        className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                          show ? s.dot : "bg-surface-2 text-muted"
                        }`}
                      >
                        {show ? <Icon size={12} strokeWidth={3} /> : String.fromCharCode(65 + i)}
                      </span>
                      <span className="min-w-0">
                        <span className="font-medium">{o.text}</span>
                        {show && (
                          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-1 block text-[13px] text-muted">
                            <b className="font-semibold text-ink">{ui[o.verdict]}.</b> {o.why}
                          </motion.span>
                        )}
                      </span>
                    </span>
                  </motion.button>
                );
              })}
            </div>
            {picked !== undefined && (
              <div className="mt-4 flex justify-end">
                <FrameButton onClick={() => setStep((s) => s + 1)} active>
                  {step + 1 === cases.length ? ui.finish : ui.next}
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                </FrameButton>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </BlockFrame>
  );
}
