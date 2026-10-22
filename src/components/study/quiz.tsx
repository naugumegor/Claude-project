"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, ListChecks, RotateCcw, X } from "lucide-react";
import type { Locale } from "@/lib/i18n";

export type QuizQuestion = {
  id: string;
  question: React.ReactNode;
  options: { text: React.ReactNode; correct: boolean }[];
  explanation?: React.ReactNode;
};

const text = {
  ru: {
    title: "Мини-тест",
    score: (ok: number, all: number) => `Правильно ${ok} из ${all}`,
    great: "Отлично, тема усвоена!",
    retry: "Пройти ещё раз",
  },
  en: {
    title: "Quick quiz",
    score: (ok: number, all: number) => `${ok} of ${all} correct`,
    great: "Nailed it!",
    retry: "Try again",
  },
};

export function Quiz({ questions, locale }: { questions: QuizQuestion[]; locale: Locale }) {
  const t = text[locale];
  const [picked, setPicked] = useState<Record<string, number>>({});
  const answered = Object.keys(picked).length;
  const correct = questions.filter((q) => q.options[picked[q.id]]?.correct).length;
  const finished = answered === questions.length;

  return (
    <div className="not-prose study-block my-8 rounded-2xl border border-line bg-surface p-4 sm:p-5">
      <div className="mb-4 flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-lg bg-ochre-soft text-ochre">
          <ListChecks size={16} />
        </span>
        <span className="font-display font-bold">{t.title}</span>
        <span className="ml-auto text-sm text-muted">
          {answered}/{questions.length}
        </span>
      </div>

      <div className="grid gap-5">
        {questions.map((q, qi) => {
          const choice = picked[q.id];
          const done = choice !== undefined;
          return (
            <div key={q.id}>
              <p className="mb-2 font-medium">
                {qi + 1}. {q.question}
              </p>
              <div className="grid gap-1.5">
                {q.options.map((o, oi) => {
                  const state = !done ? "idle" : o.correct ? "right" : oi === choice ? "wrong" : "dim";
                  return (
                    <motion.button
                      key={oi}
                      type="button"
                      disabled={done}
                      onClick={() => setPicked((p) => ({ ...p, [q.id]: oi }))}
                      whileTap={done ? undefined : { scale: 0.98 }}
                      animate={state === "wrong" ? { x: [0, -6, 6, -3, 0] } : { x: 0 }}
                      transition={{ duration: 0.35 }}
                      className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm transition-colors ${
                        state === "idle"
                          ? "border-line hover:border-ochre hover:bg-ochre-soft/50"
                          : state === "right"
                            ? "border-accent bg-accent-soft"
                            : state === "wrong"
                              ? "border-rose bg-rose-soft"
                              : "border-line opacity-50"
                      }`}
                    >
                      <span
                        className={`flex size-5 shrink-0 items-center justify-center rounded-full border text-[10px] ${
                          state === "right"
                            ? "border-accent bg-accent text-accent-ink"
                            : state === "wrong"
                              ? "border-rose bg-rose text-white"
                              : "border-line text-muted"
                        }`}
                      >
                        {state === "right" ? <Check size={12} /> : state === "wrong" ? <X size={12} /> : String.fromCharCode(65 + oi)}
                      </span>
                      <span>{o.text}</span>
                    </motion.button>
                  );
                })}
              </div>
              <AnimatePresence>
                {done && q.explanation && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-2 overflow-hidden text-sm text-muted"
                  >
                    {q.explanation}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Printed cheat sheets list each question with its right answer. */}
      <dl className="print-only hidden">
        {questions.map((q) => (
          <div key={q.id}>
            <dt className="font-semibold">{q.question}</dt>
            <dd>{q.options.filter((o) => o.correct).map((o, i) => <span key={i}>{o.text} </span>)}</dd>
          </div>
        ))}
      </dl>

      <AnimatePresence>
        {finished && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-5 flex flex-wrap items-center gap-3 rounded-xl bg-surface-2 px-4 py-3"
          >
            <span className="font-display text-lg font-bold">{t.score(correct, questions.length)}</span>
            {correct === questions.length && <span className="text-sm text-accent">{t.great}</span>}
            <button
              type="button"
              onClick={() => setPicked({})}
              className="no-print ml-auto inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-muted transition-colors hover:bg-surface hover:text-ink"
            >
              <RotateCcw size={14} />
              {t.retry}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
