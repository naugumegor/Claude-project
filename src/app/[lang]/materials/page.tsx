import { Suspense } from "react";
import type { Metadata } from "next";
import { getDictionary, getLocale } from "@/dictionaries";
import { getMaterials } from "@/lib/materials";
import { cardLabels, plural } from "@/lib/format";
import { MaterialGrid } from "@/components/material-grid";
import { alternates } from "@/lib/site";
import { Reveal } from "@/components/reveal";

export async function generateMetadata(): Promise<Metadata> {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  return {
    title: dict.materials.title,
    description: dict.materials.lead,
    alternates: alternates(locale, "/materials"),
  };
}

export default async function MaterialsPage() {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  const materials = await getMaterials(locale);

  return (
    <section className="mx-auto max-w-6xl px-4 pt-14 sm:px-6">
      <Reveal>
        <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
          {dict.materials.title}
        </h1>
        <p className="mt-3 max-w-2xl text-muted">
          {dict.materials.lead}{" "}
          <span className="text-ink">
            {plural(materials.length, dict.plurals.materials, locale)}.
          </span>
        </p>
      </Reveal>
      <div className="mt-10">
        {/* The grid reads ?subject= from the URL, which is only known at request time. */}
        <Suspense>
          <MaterialGrid
            materials={materials}
            locale={locale}
            labels={cardLabels(materials, dict, locale)}
            typeNames={dict.types}
            subjectNames={Object.fromEntries(materials.map((m) => [m.subject, m.subjectName]))}
            emptyText={dict.materials.empty}
          />
        </Suspense>
      </div>
    </section>
  );
}
