"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Loader2, Pencil, Play, RotateCcw, Square, Terminal } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { runPython, stopPython, type RunEvent } from "@/lib/pyodide";

const text = {
  ru: {
    run: "Запустить",
    stop: "Стоп",
    edit: "Править",
    reset: "Вернуть",
    boot: "Загружаю Python в браузер (один раз, ~10 МБ)…",
    loading: "Загружаю",
    empty: "Код выполнен, вывода нет.",
    stopped: "Остановлено.",
    hint: "Код выполняется прямо в браузере, на сервер ничего не уходит.",
  },
  en: {
    run: "Run",
    stop: "Stop",
    edit: "Edit",
    reset: "Reset",
    boot: "Loading Python into the browser (once, ~10 MB)…",
    loading: "Loading",
    empty: "Done, no output.",
    stopped: "Stopped.",
    hint: "The code runs right in your browser; nothing is sent to a server.",
  },
};

type Line = { kind: "out" | "err" | "result" | "status"; text: string } | { kind: "image"; png: string };

export function PythonRunner({
  code: original,
  locale,
  children,
}: {
  code: string;
  locale: Locale;
  /** The server-highlighted <pre>, shown until the reader starts editing. */
  children: React.ReactNode;
}) {
  const t = text[locale];
  const [code, setCode] = useState(original);
  const [editing, setEditing] = useState(false);
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState<Line[] | null>(null);
  const [status, setStatus] = useState("");
  const area = useRef<HTMLTextAreaElement>(null);

  const run = () => {
    setRunning(true);
    setOutput([]);
    setStatus("");
    runPython(code, (e: RunEvent) => {
      if (e.kind === "status") setStatus(e.text === "boot" ? t.boot : e.text.replace(/^Loading/, t.loading));
      else if (e.kind === "done") {
        setRunning(false);
        setStatus("");
      } else setOutput((o) => [...(o ?? []), e]);
    });
  };

  const stop = () => {
    stopPython();
    setOutput((o) => [...(o ?? []), { kind: "status", text: t.stopped }]);
  };

  const lines = output ?? [];

  return (
    // The highlighted <pre> keeps the note's code styling; only the output opts out of it.
    <div className="my-6 overflow-hidden rounded-2xl border border-line bg-surface">
      <div className="no-print flex items-center gap-1 border-b border-line bg-surface-2 px-3 py-1.5">
        <span className="mr-auto inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-muted">
          <Terminal size={14} className="text-accent" />
          python
        </span>
        {code !== original && (
          <ToolButton onClick={() => setCode(original)} label={t.reset}>
            <RotateCcw size={13} />
          </ToolButton>
        )}
        <ToolButton
          onClick={() => {
            setEditing((v) => !v);
            requestAnimationFrame(() => area.current?.focus());
          }}
          label={t.edit}
          active={editing}
        >
          <Pencil size={13} />
        </ToolButton>
        {running ? (
          <motion.button
            type="button"
            whileTap={{ scale: 0.94 }}
            onClick={stop}
            className="inline-flex items-center gap-1.5 rounded-lg bg-rose px-3 py-1 text-xs font-semibold text-white"
          >
            <Square size={12} fill="currentColor" />
            {t.stop}
          </motion.button>
        ) : (
          <motion.button
            type="button"
            whileTap={{ scale: 0.94 }}
            onClick={run}
            className="group inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1 text-xs font-semibold text-accent-ink shadow-[0_6px_14px_-8px_var(--accent)]"
          >
            <Play size={12} fill="currentColor" className="transition-transform group-hover:scale-125" />
            {t.run}
          </motion.button>
        )}
      </div>

      {editing ? (
        <textarea
          ref={area}
          value={code}
          spellCheck={false}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
              e.preventDefault();
              if (!running) run();
            } else if (e.key === "Tab" && !e.shiftKey) {
              // Indent with four spaces instead of leaving the editor.
              e.preventDefault();
              const el = e.currentTarget;
              const { selectionStart: a, selectionEnd: b } = el;
              setCode(code.slice(0, a) + "    " + code.slice(b));
              requestAnimationFrame(() => el.setSelectionRange(a + 4, a + 4));
            }
          }}
          rows={Math.min(30, code.split("\n").length + 1)}
          className="block w-full resize-y bg-surface px-4 py-3 font-mono text-[13px] leading-relaxed text-ink outline-none"
        />
      ) : (
        <div className="python-code [&>pre]:!m-0 [&>pre]:!rounded-none [&>pre]:!border-0">{children}</div>
      )}

      <AnimatePresence initial={false}>
        {output !== null && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="not-prose overflow-hidden border-t border-line"
          >
            <div className="max-h-[28rem] overflow-auto bg-surface-2 px-4 py-3 font-mono text-[13px] leading-relaxed">
              {status && (
                <p className="flex items-center gap-2 text-muted">
                  <Loader2 size={13} className="animate-spin" />
                  {status}
                </p>
              )}
              {lines.map((l, i) =>
                l.kind === "image" ? (
                  // eslint-disable-next-line @next/next/no-img-element -- a data: URL from matplotlib
                  <img
                    key={i}
                    src={`data:image/png;base64,${l.png}`}
                    alt="matplotlib"
                    className="my-2 max-w-full rounded-lg bg-white"
                  />
                ) : (
                  <pre
                    key={i}
                    className={`whitespace-pre-wrap break-words ${
                      l.kind === "err" ? "text-rose" : l.kind === "result" ? "text-accent" : l.kind === "status" ? "text-muted" : ""
                    }`}
                  >
                    {l.kind === "result" ? `→ ${l.text}` : l.text}
                  </pre>
                ),
              )}
              {!running && !status && lines.length === 0 && <p className="text-muted">{t.empty}</p>}
            </div>
            <p className="no-print border-t border-line px-4 py-1.5 text-[11px] text-muted">{t.hint}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ToolButton({
  onClick,
  label,
  active,
  children,
}: {
  onClick: () => void;
  label: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs transition-colors ${
        active ? "bg-accent-soft text-accent" : "text-muted hover:bg-surface hover:text-ink"
      }`}
    >
      {children}
      {label}
    </button>
  );
}
