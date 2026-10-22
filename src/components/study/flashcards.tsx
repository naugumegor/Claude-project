"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Download, Layers, RotateCcw, Sparkles } from "lucide-react";
import type { Locale } from "@/lib/i18n";

export type Flashcard = {
  id: string;
  front: React.ReactNode;
  back: React.ReactNode;
  raw: { front: string; back: string };
};

type Progress = Record<string, { box: number; due: number }>;

const STORE = "ingenium:cards";
const DAY = 24 * 60 * 60 * 1000;
/** Leitner boxes: a card you know moves up a box and comes back after this many days. */
const INTERVALS = [0, 1, 3, 7, 16, 35];

const text = {
  ru: {
    title: "Карточки",
    due: (n: number) => `${n} к повторению`,
    flip: "Нажми, чтобы перевернуть",
    know: "Знаю",
    again: "Ещё раз",
    done: "На сегодня всё! Карточки вернутся по графику повторений.",
    restart: "Пройти все заново",
    anki: "В Anki",
  },
  en: {
    title: "Flashcards",
    due: (n: number) => `${n} due`,
    flip: "Tap to flip",
    know: "Got it",
    again: "Again",
    done: "All done for today! Cards come back on a spaced schedule.",
    restart: "Review all again",
    anki: "To Anki",
  },
};

function load(): Progress {
  try {
    return JSON.parse(localStorage.getItem(STORE) ?? "{}");
  } catch {
    return {};
  }
}

function save(progress: Progress) {
  try {
    localStorage.setItem(STORE, JSON.stringify(progress));
  } catch {
    // Private mode: progress just isn't remembered.
  }
}

export function Flashcards({ cards, locale }: { cards: Flashcard[]; locale: Locale }) {
  const t = text[locale];
  const [queue, setQueue] = useState<string[]>(() => cards.map((c) => c.id));
  const [flipped, setFlipped] = useState(false);
  const [direction, setDirection] = useState(1);

  // Only cards that are due today, once we can read what was learned before.
  useEffect(() => {
    const progress = load();
    const now = Date.now();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage is only readable after mount
    setQueue(cards.filter((c) => (progress[c.id]?.due ?? 0) <= now).map((c) => c.id));
  }, [cards]);

  const current = cards.find((c) => c.id === queue[0]);

  const answer = (known: boolean) => {
    if (!current) return;
    const progress = load();
    const box = known ? Math.min((progress[current.id]?.box ?? 0) + 1, INTERVALS.length - 1) : 0;
    progress[current.id] = { box, due: Date.now() + INTERVALS[box] * DAY };
    save(progress);
    setDirection(known ? 1 : -1);
    setFlipped(false);
    // A missed card goes to the back of today's queue.
    setQueue((q) => (known ? q.slice(1) : [...q.slice(1), q[0]]));
  };

  const exportAnki = () => {
    // Anki imports plain text: one card per line, front and back separated by a tab.
    const body = cards.map((c) => `${c.raw.front.replace(/\t/g, " ")}\t${c.raw.back.replace(/\t/g, " ")}`).join("\n");
    const url = URL.createObjectURL(new Blob([body], { type: "text/plain;charset=utf-8" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: "ingenium-cards.txt" });
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="not-prose study-block my-8 rounded-2xl border border-line bg-surface p-4 sm:p-5">
      <div className="mb-4 flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-lg bg-plum-soft text-plum">
          <Layers size={16} />
        </span>
        <span className="font-display font-bold">{t.title}</span>
        <span className="text-sm text-muted">· {t.due(queue.length)}</span>
        <button
          type="button"
          onClick={exportAnki}
          className="no-print group ml-auto inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-muted transition-colors hover:bg-plum-soft hover:text-plum"
        >
          <Download size={14} className="transition-transform group-hover:translate-y-0.5" />
          {t.anki}
        </button>
      </div>

      {current ? (
        <>
          <div className="relative h-52 [perspective:1200px]">
            <AnimatePresence mode="popLayout" custom={direction}>
              <motion.button
                key={current.id + queue.length}
                type="button"
                onClick={() => setFlipped((f) => !f)}
                custom={direction}
                initial={{ opacity: 0, x: 60 * direction, rotateZ: 3 * direction }}
                animate={{ opacity: 1, x: 0, rotateZ: 0, rotateY: flipped ? 180 : 0 }}
                exit={{ opacity: 0, x: -80 * direction, rotateZ: -4 * direction }}
                transition={{ type: "spring", stiffness: 260, damping: 26 }}
                className="absolute inset-0 w-full cursor-pointer [transform-style:preserve-3d]"
              >
                <Face className="bg-surface-2">
                  <span className="text-lg font-semibold">{current.front}</span>
                  <span className="absolute bottom-3 text-xs text-muted">{t.flip}</span>
                </Face>
                <Face className="bg-plum-soft [transform:rotateY(180deg)]">
                  <span className="text-lg">{current.back}</span>
                </Face>
              </motion.button>
            </AnimatePresence>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <motion.button
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={() => answer(false)}
              className="rounded-xl border border-line py-2.5 text-sm font-medium text-muted transition-colors hover:border-rose hover:bg-rose-soft hover:text-rose"
            >
              {t.again}
            </motion.button>
            <motion.button
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={() => answer(true)}
              className="rounded-xl bg-accent py-2.5 text-sm font-medium text-accent-ink shadow-[0_8px_20px_-12px_var(--accent)]"
            >
              {t.know}
            </motion.button>
          </div>
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-3 rounded-xl bg-accent-soft px-4 py-8 text-center"
        >
          <Sparkles className="text-accent" />
          <p className="text-sm">{t.done}</p>
          <button
            type="button"
            onClick={() => setQueue(cards.map((c) => c.id))}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-accent transition-colors hover:bg-surface"
          >
            <RotateCcw size={14} />
            {t.restart}
          </button>
        </motion.div>
      )}

      {/* Printed cheat sheets get the plain list instead of the interactive deck. */}
      <dl className="print-only hidden">
        {cards.map((c) => (
          <div key={c.id}>
            <dt className="font-semibold">{c.front}</dt>
            <dd>{c.back}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function Face({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <span
      className={`absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-line px-6 text-center [backface-visibility:hidden] ${className}`}
    >
      {children}
    </span>
  );
}
