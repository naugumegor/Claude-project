"use client";

import { useState } from "react";
import { Database, Loader2, Play, RotateCcw } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { runSql, type SqlResult } from "@/lib/sqljs";
import { BlockFrame, FrameButton } from "./frame";

// The SQL sandbox: an editable query against tables the note sets up out of sight.
// SQLite runs in the browser, so nothing is sent to a server and a bad query breaks nothing.

const UI = {
  ru: {
    run: "Выполнить",
    reset: "Вернуть",
    boot: "Загружаю SQLite в браузер…",
    empty: "Запрос выполнен, строк нет.",
    rows: (n: number) => `${n} ${n % 10 === 1 && n % 100 !== 11 ? "строка" : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? "строки" : "строк"}`,
    tables: "Таблицы",
    hint: "Ctrl+Enter — выполнить. SQLite работает прямо в браузере.",
  },
  en: {
    run: "Run",
    reset: "Reset",
    boot: "Loading SQLite into the browser…",
    empty: "Done, no rows.",
    rows: (n: number) => `${n} row${n === 1 ? "" : "s"}`,
    tables: "Tables",
    hint: "Ctrl+Enter runs the query. SQLite runs right in your browser.",
  },
};

const MAX_ROWS = 200;

export function SqlSandbox({ setup, query: original, locale }: { setup: string; query: string; locale: Locale }) {
  const ui = UI[locale];
  const [query, setQuery] = useState(original);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ ok: true; sets: SqlResult[] } | { ok: false; error: string } | null>(null);
  const tables = [...setup.matchAll(/create\s+table\s+(?:if\s+not\s+exists\s+)?["`]?(\w+)/gi)].map((m) => m[1]);

  const run = async () => {
    setBusy(true);
    try {
      setResult({ ok: true, sets: await runSql(setup, query) });
    } catch (e) {
      setResult({ ok: false, error: (e as Error).message });
    }
    setBusy(false);
  };

  return (
    <BlockFrame
      icon={Database}
      tone="accent"
      title="SQL"
      actions={
        <>
          {query !== original && (
            <FrameButton onClick={() => setQuery(original)}>
              <RotateCcw size={14} className="transition-transform group-hover:-rotate-90" />
              {ui.reset}
            </FrameButton>
          )}
          <button
            type="button"
            onClick={run}
            disabled={busy}
            className="group inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-sm font-semibold text-accent-ink shadow-[0_6px_14px_-8px_var(--accent)] disabled:opacity-60"
          >
            {busy ? <Loader2 size={13} className="animate-spin" /> : <Play size={12} fill="currentColor" className="transition-transform group-hover:scale-125" />}
            {ui.run}
          </button>
        </>
      }
    >
      {tables.length > 0 && (
        <p className="mb-2 flex flex-wrap items-center gap-1.5 text-xs text-muted">
          {ui.tables}:
          {tables.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setQuery(`SELECT * FROM ${t} LIMIT 10;`)}
              className="rounded-md bg-surface-2 px-1.5 py-0.5 font-mono text-ink transition-colors hover:bg-accent-soft hover:text-accent"
            >
              {t}
            </button>
          ))}
        </p>
      )}
      <textarea
        value={query}
        spellCheck={false}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            if (!busy) run();
          }
        }}
        rows={Math.min(16, query.split("\n").length + 1)}
        className="block w-full resize-y rounded-xl border border-line bg-surface-2 px-3 py-2.5 font-mono text-[13px] leading-relaxed outline-none focus:border-accent"
      />
      {busy && !result && (
        <p className="mt-3 flex items-center gap-2 text-sm text-muted">
          <Loader2 size={13} className="animate-spin" />
          {ui.boot}
        </p>
      )}
      {result && !result.ok && <pre className="mt-3 whitespace-pre-wrap rounded-xl bg-rose-soft px-3 py-2 font-mono text-[13px] text-rose">{result.error}</pre>}
      {result?.ok && result.sets.length === 0 && <p className="mt-3 text-sm text-muted">{ui.empty}</p>}
      {result?.ok &&
        result.sets.map((set, i) => (
          <div key={i} className="mt-3">
            <div className="max-h-96 overflow-auto rounded-xl border border-line">
              <table className="w-full border-collapse text-left text-[13px]">
                <thead className="sticky top-0 bg-surface-2">
                  <tr>
                    {set.columns.map((c, j) => (
                      <th key={j} className="border-b border-line px-3 py-1.5 font-mono font-semibold">
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {set.values.slice(0, MAX_ROWS).map((row, r) => (
                    <tr key={r} className="odd:bg-surface even:bg-surface-2/40">
                      {row.map((v, j) => (
                        <td
                          key={j}
                          className={`border-b border-line/60 px-3 py-1 font-mono tabular-nums ${typeof v === "number" ? "text-right" : ""} ${v === null ? "text-muted" : ""}`}
                        >
                          {v === null ? "NULL" : v instanceof Uint8Array ? `<blob ${v.length}>` : String(v)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-1 text-[11px] text-muted">
              {ui.rows(set.values.length)}
              {set.values.length > MAX_ROWS && ` (${MAX_ROWS})`}
            </p>
          </div>
        ))}
      <p className="no-print mt-2 text-[11px] text-muted">{ui.hint}</p>
    </BlockFrame>
  );
}
