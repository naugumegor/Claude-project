import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getDictionary, getLocale } from "@/dictionaries";
import { getMaterials } from "@/lib/materials";
import { cardLabels, plural, pluralWord } from "@/lib/format";
import { HeroSearch } from "@/components/search";
import { MaterialCard } from "@/components/material-card";
import { Reveal } from "@/components/reveal";
import { typeMeta } from "@/components/type-meta";
import type { MaterialType } from "@/lib/content";

export default async function HomePage() {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  const materials = await getMaterials(locale);
  const recent = materials.slice(0, 3);
  const labels = cardLabels(recent, dict, locale);

  const bySubject = Object.values(
    materials.reduce<Record<string, { slug: string; name: string; count: number }>>((acc, m) => {
      acc[m.subject] ??= { slug: m.subject, name: m.subjectName, count: 0 };
      acc[m.subject].count++;
      return acc;
    }, {}),
  );
  const byType = (["note", "link", "photo"] as MaterialType[]).map((t) => ({
    type: t,
    count: materials.filter((m) => m.type === t).length,
  }));

  return (
    <>
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-16 sm:px-6 sm:pt-24">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent">
            <span className="size-1.5 animate-pulse rounded-full bg-accent" />
            {dict.home.eyebrow}
          </span>
        </Reveal>
        <Reveal delay={0.08}>
          <h1 className="mt-6 max-w-3xl font-display text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-6xl">
            {dict.home.title}
            <span className="text-accent">.</span>
          </h1>
        </Reveal>
        <Reveal delay={0.16}>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">{dict.home.lead}</p>
        </Reveal>
        <Reveal delay={0.24} className="mt-10">
          <HeroSearch placeholder={dict.search.placeholder} hint={dict.search.hint} />
        </Reveal>
        <Reveal delay={0.32} className="mt-8 flex flex-wrap gap-3">
          {byType.map(({ type, count }) => {
            const meta = typeMeta[type];
            const Icon = meta.icon;
            return (
              <div
                key={type}
                className="group flex items-center gap-2.5 rounded-xl border border-line bg-surface/70 px-3 py-2 transition-all duration-300 hover:-translate-y-0.5 hover:bg-surface"
              >
                <span
                  className={`flex size-8 items-center justify-center rounded-lg transition-all duration-300 group-hover:scale-110 ${meta.soft} ${meta.tone} ${meta.glow}`}
                >
                  <Icon size={16} />
                </span>
                <span className="text-sm text-muted">
                  <span className="font-display text-lg font-bold text-ink">{count}</span>{" "}
                  {pluralWord(count, dict.plurals[type], locale)}
                </span>
              </div>
            );
          })}
        </Reveal>
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-6 flex items-end justify-between gap-4">
          <h2 className="font-display text-2xl font-bold tracking-tight">{dict.home.recent}</h2>
          <Link
            href={`/${locale}/materials`}
            className="group flex items-center gap-1.5 text-sm font-medium text-accent"
          >
            {dict.home.all}
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {recent.map((m, i) => (
            <MaterialCard key={m.slug} material={m} locale={locale} labels={labels[m.slug]} index={i} />
          ))}
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-6xl px-4 sm:px-6">
        <h2 className="mb-6 font-display text-2xl font-bold tracking-tight">{dict.home.subjects}</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {bySubject.map(({ slug: subject, name, count }) => (
            <Link
              key={subject}
              href={`/${locale}/materials?subject=${subject}`}
              className="group relative overflow-hidden rounded-2xl border border-line bg-surface p-5 transition-all duration-300 hover:-translate-y-1 hover:border-accent hover:shadow-[0_14px_34px_-20px_var(--accent)]"
            >
              <span className="absolute -right-6 -top-6 size-20 rounded-full bg-accent-soft transition-transform duration-500 group-hover:scale-[2.4]" />
              <span className="relative block break-words hyphens-auto font-display text-base font-bold sm:text-lg">
                {name}
              </span>
              <span className="relative text-sm text-muted">
                {plural(count, dict.plurals.materials, locale)}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
