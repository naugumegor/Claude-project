import type { Locale } from "@/lib/i18n";

// Sections group subjects (topics) on the site: «Механика» holds статика, динамика,
// сопромат and so on. Sections live in code; each subject row stores its section slug,
// and subjects without one fall back to the map below (or to «Другое»).

export type SectionSlug =
  | "math"
  | "mechanics"
  | "materials"
  | "thermo"
  | "machines"
  | "drafting"
  | "programming"
  | "science"
  | "other";

export type Section = {
  slug: SectionSlug;
  name: Record<Locale, string>;
  /** Default subject slugs, in display order. */
  subjects: string[];
};

export const SECTIONS: Section[] = [
  {
    slug: "math",
    name: { ru: "Математика", en: "Mathematics" },
    subjects: ["math", "calculus", "linear-algebra", "differential-equations", "probability"],
  },
  {
    slug: "mechanics",
    name: { ru: "Механика", en: "Mechanics" },
    subjects: ["statics", "dynamics", "strength"],
  },
  {
    slug: "materials",
    name: { ru: "Материаловедение", en: "Materials science" },
    subjects: ["materials"],
  },
  {
    slug: "thermo",
    name: { ru: "Тепло и потоки", en: "Heat & fluids" },
    subjects: ["thermodynamics", "fluids"],
  },
  {
    slug: "machines",
    name: { ru: "Машины и механизмы", en: "Machines & mechanisms" },
    subjects: ["tmm", "machine-design"],
  },
  {
    slug: "drafting",
    name: { ru: "Черчение и САПР", en: "Drafting & CAD" },
    subjects: ["drafting", "cad-cae"],
  },
  {
    slug: "programming",
    name: { ru: "Программирование", en: "Programming" },
    subjects: ["engineering-python", "programming"],
  },
  {
    slug: "science",
    name: { ru: "Естественные науки", en: "Natural sciences" },
    subjects: ["physics", "chemistry"],
  },
  {
    slug: "other",
    name: { ru: "Другое", en: "Other" },
    subjects: [],
  },
];

const bySlug = new Map(SECTIONS.map((s) => [s.slug, s]));

export function isSection(value: unknown): value is SectionSlug {
  return typeof value === "string" && bySlug.has(value as SectionSlug);
}

export function getSection(slug: string): Section {
  return bySlug.get(slug as SectionSlug) ?? bySlug.get("other")!;
}

/** The section a subject belongs to: what the database says, else the default map. */
export function sectionOf(subjectSlug: string, stored?: string | null): SectionSlug {
  if (isSection(stored)) return stored;
  return SECTIONS.find((s) => s.subjects.includes(subjectSlug))?.slug ?? "other";
}

/** Sort key for subjects inside a section: known ones in map order, the rest after. */
export function subjectOrder(subjectSlug: string) {
  for (const s of SECTIONS) {
    const i = s.subjects.indexOf(subjectSlug);
    if (i >= 0) return i;
  }
  return 100;
}
