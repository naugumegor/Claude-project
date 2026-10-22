"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Search } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { STEEL_GROUPS, type Steel } from "@/lib/reference-data";

const text = {
  ru: { search: "Марка, аналог или применение…", all: "Все", uts: "σв", yield: "σт", mpa: "МПа", none: "Ничего не нашлось." },
  en: { search: "Grade, equivalent or use…", all: "All", uts: "UTS", yield: "Yield", mpa: "MPa", none: "Nothing found." },
};

export function SteelTable({ steels, locale }: { steels: Steel[]; locale: Locale }) {
  const t = text[locale];
  const params = useSearchParams();
  const focus = params.get("steel");
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState<Steel["group"] | null>(null);

  // A tooltip link (?steel=40Х) scrolls to that card once it is on screen.
  useEffect(() => {
    if (focus) document.getElementById(`steel-${focus}`)?.scrollIntoView({ block: "center" });
  }, [focus]);

  const q = query.trim().toLowerCase();
  const visible = steels.filter(
    (s) =>
      (!group || s.group === group) &&
      (!q ||
        [s.grade, ...(s.aliases ?? []), s.analogs, s.use[locale], s.composition[locale]]
          .join(" ")
          .toLowerCase()
          .includes(q)),
  );
  const groups = Object.keys(STEEL_GROUPS) as Steel["group"][];

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="group flex flex-1 items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2 transition-colors focus-within:border-accent">
          <Search size={16} className="text-muted transition-transform group-focus-within:scale-110 group-focus-within:text-accent" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.search}
            className="w-full bg-transparent text-sm outline-none"
          />
        </label>
      </div>
      <div className="-mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        {[null, ...groups].map((g) => (
          <button
            key={g ?? "all"}
            type="button"
            onClick={() => setGroup(g)}
            className={`shrink-0 rounded-full border px-3 py-1 text-sm transition-all ${
              group === g
                ? "border-ochre bg-ochre-soft text-ink"
                : "border-line bg-surface text-muted hover:border-ochre hover:text-ink"
            }`}
          >
            {g ? STEEL_GROUPS[g][locale] : t.all}
          </button>
        ))}
      </div>

      <motion.div layout className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {visible.map((s) => (
            <motion.article
              layout
              key={s.grade}
              id={`steel-${s.grade}`}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className={`scroll-mt-24 rounded-2xl border bg-surface p-4 transition-colors ${
                focus === s.grade ? "border-accent shadow-[0_0_0_3px_var(--accent-soft)]" : "border-line hover:border-accent"
              }`}
            >
              <div className="flex items-baseline gap-2">
                <h3 className="font-mono text-lg font-bold">{s.grade}</h3>
                <span className="text-xs text-muted">{s.standard}</span>
              </div>
              <p className="text-xs text-muted">≈ {s.analogs}</p>
              <p className="mt-2 text-xs">{s.composition[locale]}</p>
              <div className="mt-2 flex flex-wrap gap-1.5 font-mono text-xs">
                {s.uts && (
                  <span className="rounded-lg bg-accent-soft px-2 py-0.5">
                    {t.uts} {s.uts} {t.mpa}
                  </span>
                )}
                {s.yield && (
                  <span className="rounded-lg bg-ochre-soft px-2 py-0.5">
                    {t.yield} {s.yield} {t.mpa}
                  </span>
                )}
                {s.hardness && <span className="rounded-lg bg-surface-2 px-2 py-0.5">{s.hardness}</span>}
              </div>
              <p className="mt-1 text-[11px] text-muted">{s.state[locale]}</p>
              <p className="mt-2 text-sm">{s.use[locale]}</p>
            </motion.article>
          ))}
        </AnimatePresence>
      </motion.div>
      {visible.length === 0 && <p className="py-10 text-center text-muted">{t.none}</p>}
    </div>
  );
}
