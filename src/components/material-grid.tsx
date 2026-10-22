"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { LayoutGrid } from "lucide-react";
import type { LocalizedMaterial, MaterialType } from "@/lib/content";
import type { Locale } from "@/lib/i18n";
import { MaterialCard, type CardLabels } from "./material-card";
import { typeMeta } from "./type-meta";

type Filter = "all" | MaterialType;

const spring = { type: "spring", stiffness: 420, damping: 34 } as const;

export function MaterialGrid({
  materials,
  locale,
  labels,
  typeNames,
  subjectNames,
  emptyText,
}: {
  materials: LocalizedMaterial[];
  locale: Locale;
  labels: Record<string, CardLabels>;
  typeNames: Record<Filter, string>;
  subjectNames: Record<string, string>;
  emptyText: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [type, setType] = useState<Filter>("all");
  const subject = params.get("subject");

  const setSubject = (next: string | null) => {
    const q = new URLSearchParams(params);
    if (next) q.set("subject", next);
    else q.delete("subject");
    const qs = q.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const visible = materials.filter(
    (m) => (type === "all" || m.type === type) && (!subject || m.subject === subject),
  );
  const subjects = [...new Set(materials.map((m) => m.subject))];
  const filters: Filter[] = ["all", "note", "link", "photo"];

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <LayoutGroup id="type-filter">
          <div className="flex w-fit gap-1 rounded-2xl border border-line bg-surface p-1">
            {filters.map((f) => {
              const Icon = f === "all" ? LayoutGrid : typeMeta[f].icon;
              const active = type === f;
              return (
                <button
                  key={f}
                  onClick={() => setType(f)}
                  className={`group relative flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                    active ? "text-accent-ink" : "text-muted hover:text-ink"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="type-pill"
                      transition={spring}
                      className="absolute inset-0 rounded-xl bg-accent shadow-[0_6px_16px_-8px_var(--accent)]"
                    />
                  )}
                  <Icon
                    size={16}
                    className="relative transition-transform duration-300 group-hover:scale-125"
                  />
                  <span className="relative">{typeNames[f]}</span>
                </button>
              );
            })}
          </div>
        </LayoutGroup>

        <div className="flex flex-wrap gap-2">
          {subjects.map((s) => {
            const active = subject === s;
            return (
              <motion.button
                key={s}
                whileTap={{ scale: 0.94 }}
                onClick={() => setSubject(active ? null : s)}
                className={`rounded-full border px-3 py-1 text-sm transition-all duration-300 ${
                  active
                    ? "border-ochre bg-ochre-soft text-ink shadow-[0_4px_14px_-6px_var(--ochre)]"
                    : "border-line bg-surface text-muted hover:border-ochre hover:text-ink"
                }`}
              >
                {subjectNames[s] ?? s}
              </motion.button>
            );
          })}
        </div>
      </div>

      <motion.div layout className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {visible.map((m, i) => (
            <MaterialCard
              key={m.slug}
              material={m}
              locale={locale}
              labels={labels[m.slug]}
              index={i}
            />
          ))}
        </AnimatePresence>
      </motion.div>
      {visible.length === 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-16 text-center text-muted"
        >
          {emptyText}
        </motion.p>
      )}
    </div>
  );
}
