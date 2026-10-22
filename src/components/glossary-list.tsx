"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Search } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import type { GlossaryTerm } from "@/lib/glossary";

type Area = "all" | "eng" | "biz";

/** The glossary page: search in both languages and a filter by area. */
export function GlossaryList({
  terms,
  locale,
  labels,
}: {
  terms: GlossaryTerm[];
  locale: Locale;
  labels: { search: string; all: string; eng: string; biz: string; empty: string };
}) {
  const [query, setQuery] = useState("");
  const [area, setArea] = useState<Area>("all");
  const q = query.trim().toLowerCase();
  const sorted = [...terms].sort((a, b) => (locale === "ru" ? a.ru.localeCompare(b.ru, "ru") : a.en.localeCompare(b.en, "en")));
  const shown = sorted.filter(
    (t) =>
      (area === "all" || t.area === area) &&
      (!q || [t.ru, t.en, ...t.aliases, t.def_ru, t.def_en].some((s) => s.toLowerCase().includes(q))),
  );

  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-center gap-2">
        <label className="group flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2 transition-colors focus-within:border-accent sm:max-w-sm">
          <Search size={16} className="shrink-0 text-muted transition-transform group-focus-within:scale-110 group-focus-within:text-accent" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={labels.search}
            className="min-w-0 flex-1 bg-transparent text-sm outline-none"
          />
        </label>
        <div className="flex gap-1 rounded-xl border border-line bg-surface p-1">
          {(["all", "eng", "biz"] as const).map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => setArea(a)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                area === a ? "bg-accent-soft text-accent" : "text-muted hover:text-ink"
              }`}
            >
              {labels[a]}
            </button>
          ))}
        </div>
      </div>
      <dl className="mt-6 grid gap-3">
        <AnimatePresence initial={false}>
          {shown.map((t) => (
            <motion.div
              key={t.id}
              id={t.id}
              layout
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              data-for={t.area === "biz" ? "business" : "engineering"}
              className="scroll-mt-24 rounded-2xl border border-line bg-surface p-4 transition-colors target:border-plum target:bg-plum-soft/40"
            >
              <dt className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="font-display text-lg font-bold">{locale === "ru" ? t.ru : t.en}</span>
                <span className="text-sm text-muted">{locale === "ru" ? t.en : t.ru}</span>
                {t.aliases.length > 0 && (
                  <span className="flex flex-wrap gap-1">
                    {t.aliases.map((a) => (
                      <span key={a} className="rounded-md bg-surface-2 px-1.5 py-0.5 font-mono text-xs">
                        {a}
                      </span>
                    ))}
                  </span>
                )}
                <span
                  className={`ml-auto rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                    t.area === "biz" ? "bg-ochre-soft text-ochre" : "bg-accent-soft text-accent"
                  }`}
                >
                  {labels[t.area]}
                </span>
              </dt>
              <dd className="mt-1.5 text-sm leading-relaxed">{locale === "ru" ? t.def_ru : t.def_en}</dd>
            </motion.div>
          ))}
        </AnimatePresence>
      </dl>
      {shown.length === 0 && <p className="mt-6 text-sm text-muted">{labels.empty}</p>}
    </div>
  );
}
