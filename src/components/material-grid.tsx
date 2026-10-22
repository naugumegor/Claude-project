"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { LayoutGrid, X } from "lucide-react";
import type { LocalizedMaterial, MaterialType } from "@/lib/content";
import type { Locale } from "@/lib/i18n";
import { getSection, SECTIONS, subjectOrder } from "@/lib/taxonomy";
import { useProfile } from "@/lib/profile";
import { MaterialCard, type CardLabels } from "./material-card";
import { typeMeta } from "./type-meta";
import { sectionMeta } from "./section-icon";

type Filter = "all" | MaterialType;

const spring = { type: "spring", stiffness: 420, damping: 34 } as const;

export function MaterialGrid({
  materials,
  locale,
  labels,
  typeNames,
  subjectNames,
  allSectionsText,
  emptyText,
}: {
  materials: LocalizedMaterial[];
  locale: Locale;
  labels: Record<string, CardLabels>;
  typeNames: Record<Filter, string>;
  subjectNames: Record<string, string>;
  allSectionsText: string;
  emptyText: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [type, setType] = useState<Filter>("all");
  const profile = useProfile();
  // The profile switch narrows everything to sections meant for that field.
  const inProfile = (m: LocalizedMaterial) =>
    profile === "general" || getSection(m.section).profiles.includes(profile);
  const pool = materials.filter(inProfile);
  const subject = params.get("subject");
  const tag = params.get("tag");
  // A ?subject= link (from the home page or a breadcrumb) implies its section.
  const section =
    params.get("section") ?? materials.find((m) => m.subject === subject)?.section ?? null;

  const setParams = (next: Partial<Record<"section" | "subject" | "tag", string | null>>) => {
    const q = new URLSearchParams(params);
    for (const [key, value] of Object.entries(next)) {
      if (value) q.set(key, value);
      else q.delete(key);
    }
    const qs = q.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const visible = pool.filter(
    (m) =>
      (type === "all" || m.type === type) &&
      (!section || m.section === section) &&
      (!subject || m.subject === subject) &&
      (!tag || m.tags.includes(tag)),
  );
  const sections = SECTIONS.map((s) => ({
    ...s,
    count: pool.filter((m) => m.section === s.slug).length,
  })).filter((s) => s.count > 0);
  const subjects = [
    ...new Set(materials.filter((m) => m.section === section).map((m) => m.subject)),
  ].sort((a, b) => subjectOrder(a) - subjectOrder(b));
  const filters: Filter[] = ["all", "note", "doc", "link", "photo"];

  return (
    <div>
      <LayoutGroup id="section-filter">
        <div className="-mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
          {[{ slug: null, name: null, count: pool.length }, ...sections].map((s) => {
            const active = section === s.slug;
            const meta = s.slug ? sectionMeta[s.slug] : null;
            const Icon = meta?.icon ?? LayoutGrid;
            return (
              <button
                key={s.slug ?? "all"}
                onClick={() => setParams({ section: s.slug, subject: null })}
                className={`group relative flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "border-transparent text-ink"
                    : "border-line bg-surface text-muted hover:text-ink"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="section-pill"
                    transition={spring}
                    className="absolute inset-0 rounded-xl border border-ochre bg-ochre-soft shadow-[0_6px_16px_-10px_var(--ochre)]"
                  />
                )}
                <span
                  className={`relative flex size-6 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-110 ${
                    meta ? `${meta.soft} ${meta.tone}` : "bg-surface-2 text-muted"
                  }`}
                >
                  <Icon size={14} />
                </span>
                <span className="relative">{s.name ? s.name[locale] : allSectionsText}</span>
                <span className="relative text-xs text-muted">{s.count}</span>
              </button>
            );
          })}
        </div>
      </LayoutGroup>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <LayoutGroup id="type-filter">
          <div className="flex w-fit max-w-full gap-1 overflow-x-auto rounded-2xl border border-line bg-surface p-1">
            {filters.map((f) => {
              const Icon = f === "all" ? LayoutGrid : typeMeta[f].icon;
              const active = type === f;
              return (
                <button
                  key={f}
                  onClick={() => setType(f)}
                  className={`group relative flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
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
                onClick={() => setParams({ subject: active ? null : s })}
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
          <AnimatePresence>
            {tag && (
              <motion.button
                key={tag}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => setParams({ tag: null })}
                className="group flex items-center gap-1 rounded-full border border-accent bg-accent-soft px-3 py-1 text-sm text-ink"
              >
                #{tag}
                <X size={14} className="text-muted transition-transform group-hover:rotate-90" />
              </motion.button>
            )}
          </AnimatePresence>
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
