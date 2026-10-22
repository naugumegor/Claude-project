"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Clock,
  Download,
  EyeOff,
  Headphones,
  Minimize2,
  Pause,
  Play,
  Printer,
  Square,
  Target,
} from "lucide-react";
import type { Dictionary } from "@/dictionaries";
import type { Locale } from "@/lib/i18n";

type Labels = Dictionary["study"];

/** The body the tools work on; the material page renders it with this id. */
const BODY_ID = "note-body";
/** What "Test yourself" hides: bold terms and formulas, but not inside cards or quizzes. */
const HIDDEN = "strong, .katex-display, .katex";

export function StudyToolbar({
  minutes,
  locale,
  markdownHref,
  labels,
}: {
  minutes: number;
  locale: Locale;
  markdownHref: string;
  labels: Labels;
}) {
  const recall = useRecall();
  const speech = useSpeech(locale, labels.formula);
  const [focus, setFocus] = useFocusMode();

  const printSheet = () => {
    document.documentElement.dataset.print = "sheet";
    const done = () => {
      delete document.documentElement.dataset.print;
      window.removeEventListener("afterprint", done);
    };
    window.addEventListener("afterprint", done);
    window.print();
  };

  return (
    <>
      <div className="no-print flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-3 py-1.5 text-sm text-muted">
          <Clock size={15} />
          {minutes} {labels.minutes}
        </span>
        <Tool icon={EyeOff} active={recall.on} onClick={recall.toggle} label={labels.recall} />
        {speech.supported && (
          <Tool
            icon={Headphones}
            active={speech.state !== "idle"}
            onClick={speech.state === "idle" ? speech.start : speech.stop}
            label={labels.listen}
          />
        )}
        <Tool icon={Target} active={focus} onClick={() => setFocus(!focus)} label={labels.focus} />
        <Tool icon={Printer} onClick={printSheet} label={labels.print} />
        <a
          href={markdownHref}
          className="group inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 text-sm text-muted transition-all hover:-translate-y-0.5 hover:border-accent hover:text-accent"
        >
          <Download size={15} className="transition-transform group-hover:translate-y-0.5" />
          {labels.markdown}
        </a>
      </div>

      <AnimatePresence>
        {recall.on && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="no-print overflow-hidden"
          >
            <div className="mt-3 flex items-center gap-3 rounded-xl border border-accent/30 bg-accent-soft px-4 py-2.5 text-sm">
              <span className="flex-1">{labels.recallHint}</span>
              <span className="shrink-0 font-semibold text-accent">
                {recall.revealed}/{recall.total} {labels.revealed}
              </span>
              <div className="hidden h-1.5 w-24 overflow-hidden rounded-full bg-surface sm:block">
                <motion.div
                  className="h-full bg-accent"
                  animate={{ width: `${recall.total ? (recall.revealed / recall.total) * 100 : 0}%` }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mini player while the note is being read aloud. */}
      <AnimatePresence>
        {speech.state !== "idle" && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="no-print fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-2xl border border-line bg-surface/95 p-2 pl-3 shadow-[0_20px_50px_-20px_rgba(35,38,43,0.5)] backdrop-blur"
          >
            <span className="flex h-5 items-end gap-0.5" aria-hidden>
              {[0, 1, 2, 3].map((i) => (
                <motion.span
                  key={i}
                  className="w-1 rounded-full bg-accent"
                  animate={speech.state === "playing" ? { height: [4, 18, 8, 14, 4] } : { height: 4 }}
                  transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.15 }}
                />
              ))}
            </span>
            <span className="hidden text-xs text-muted sm:inline">
              {speech.position + 1}/{speech.count}
            </span>
            <button
              type="button"
              onClick={speech.state === "playing" ? speech.pause : speech.resume}
              aria-label={speech.state === "playing" ? labels.pause : labels.play}
              className="flex size-9 items-center justify-center rounded-xl bg-accent text-accent-ink"
            >
              {speech.state === "playing" ? <Pause size={16} /> : <Play size={16} />}
            </button>
            <div className="flex gap-0.5 rounded-xl bg-surface-2 p-0.5" aria-label={labels.speed}>
              {[1, 1.25, 1.5, 2].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => speech.setRate(r)}
                  className={`rounded-lg px-2 py-1 text-xs font-semibold transition-colors ${
                    speech.rate === r ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink"
                  }`}
                >
                  {r}×
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={speech.stop}
              aria-label={labels.stop}
              className="flex size-9 items-center justify-center rounded-xl text-muted transition-colors hover:bg-rose-soft hover:text-rose"
            >
              <Square size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {focus && (
          <motion.button
            type="button"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => setFocus(false)}
            className="no-print fixed right-4 top-4 z-50 inline-flex items-center gap-2 rounded-xl border border-line bg-surface/90 px-3 py-2 text-sm text-muted shadow-lg backdrop-blur transition-colors hover:text-ink"
          >
            <Minimize2 size={15} />
            {labels.exitFocus}
            <kbd className="rounded border border-line px-1 text-[10px]">Esc</kbd>
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}

function Tool({
  icon: Icon,
  label,
  active = false,
  onClick,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.94 }}
      aria-pressed={active}
      className={`group inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-all hover:-translate-y-0.5 ${
        active
          ? "border-accent bg-accent text-accent-ink shadow-[0_6px_16px_-8px_var(--accent)]"
          : "border-line bg-surface text-muted hover:border-accent hover:text-accent"
      }`}
    >
      <Icon size={15} className="transition-transform group-hover:scale-115" />
      {label}
    </motion.button>
  );
}

/** "Test yourself": blurs terms and formulas in the note; a click reveals one. */
function useRecall() {
  const [on, setOn] = useState(false);
  const [counts, setCounts] = useState({ revealed: 0, total: 0 });

  useEffect(() => {
    const body = document.getElementById(BODY_ID);
    if (!body) return;
    const targets = () =>
      [...body.querySelectorAll<HTMLElement>(HIDDEN)].filter(
        (el) => !el.closest(".study-block") && !el.parentElement?.closest(".katex-display, .katex, strong"),
      );
    const count = () =>
      setCounts({
        total: targets().length,
        revealed: targets().filter((el) => el.classList.contains("revealed")).length,
      });

    if (!on) {
      body.removeAttribute("data-recall");
      body.querySelectorAll(".revealed").forEach((el) => el.classList.remove("revealed"));
      return;
    }
    body.setAttribute("data-recall", "");
    targets().forEach((el) => el.classList.add("recall-target"));
    count();
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement).closest<HTMLElement>(".recall-target");
      if (!el || el.classList.contains("revealed")) return;
      e.preventDefault();
      el.classList.add("revealed");
      count();
    };
    body.addEventListener("click", onClick);
    return () => body.removeEventListener("click", onClick);
  }, [on]);

  return { on, toggle: () => setOn((v) => !v), ...counts };
}

/** Focus mode hides the header, footer and everything around the note. Esc leaves it. */
function useFocusMode() {
  const [focus, setFocus] = useState(false);
  useEffect(() => {
    if (!focus) return;
    document.documentElement.dataset.focus = "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setFocus(false);
    window.addEventListener("keydown", onKey);
    return () => {
      delete document.documentElement.dataset.focus;
      window.removeEventListener("keydown", onKey);
    };
  }, [focus]);
  return [focus, setFocus] as const;
}

/** Reads the note aloud sentence by sentence with the browser's own voices. */
function useSpeech(locale: Locale, formulaWord: string) {
  const [supported, setSupported] = useState(false);
  const [state, setState] = useState<"idle" | "playing" | "paused">("idle");
  const [rate, setRateState] = useState(1);
  const [position, setPosition] = useState(0);
  const [count, setCount] = useState(0);
  const sentences = useRef<string[]>([]);
  const run = useRef(0); // bumps on every (re)start so stale onend callbacks are ignored
  const rateRef = useRef(1);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- feature detection needs the browser
    setSupported("speechSynthesis" in window);
    return () => window.speechSynthesis?.cancel();
  }, []);

  const speakFrom = useCallback(
    (first: number) => {
      const synth = window.speechSynthesis;
      synth.cancel();
      const token = ++run.current;
      const voice = synth.getVoices().find((v) => v.lang.toLowerCase().startsWith(locale)) ?? null;
      const say = (index: number) => {
        if (token !== run.current) return;
        if (index >= sentences.current.length) {
          setState("idle");
          return;
        }
        setPosition(index);
        const utterance = new SpeechSynthesisUtterance(sentences.current[index]);
        utterance.lang = locale === "ru" ? "ru-RU" : "en-US";
        utterance.voice = voice;
        utterance.rate = rateRef.current;
        utterance.onend = () => say(index + 1);
        synth.speak(utterance);
      };
      say(first);
      setState("playing");
    },
    [locale],
  );

  const start = () => {
    const body = document.getElementById(BODY_ID);
    if (!body) return;
    sentences.current = sentencesOf(body, formulaWord);
    setCount(sentences.current.length);
    if (sentences.current.length) speakFrom(0);
  };
  const stop = () => {
    run.current++;
    window.speechSynthesis.cancel();
    setState("idle");
  };
  const pause = () => {
    window.speechSynthesis.pause();
    setState("paused");
  };
  const resume = () => {
    window.speechSynthesis.resume();
    setState("playing");
  };
  const setRate = (r: number) => {
    rateRef.current = r;
    setRateState(r);
    // Rate only applies to new utterances, so restart the current sentence.
    if (state !== "idle") speakFrom(position);
  };

  return { supported, state, rate, position, count, start, stop, pause, resume, setRate };
}

function sentencesOf(body: HTMLElement, formulaWord: string) {
  const clone = body.cloneNode(true) as HTMLElement;
  clone.querySelectorAll(".study-block, pre, .katex-display").forEach((n) => n.remove());
  clone.querySelectorAll(".katex").forEach((n) => n.replaceWith(` ${formulaWord} `));
  return [...clone.querySelectorAll("h2, h3, p, li, td")]
    .filter((el) => !(el.tagName === "LI" && el.querySelector("p")))
    .map((el) => el.textContent?.replace(/\s+/g, " ").trim() ?? "")
    .filter(Boolean)
    .flatMap((block) => block.split(/(?<=[.!?…])\s+/))
    .filter((s) => /[\p{L}\p{N}]/u.test(s));
}
