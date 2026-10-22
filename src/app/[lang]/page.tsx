import Link from "next/link";
import { ArrowRight, Box, FileCode, FileText, Megaphone, Pin } from "lucide-react";
import { getDictionary, getLocale } from "@/dictionaries";
import { getMaterials } from "@/lib/materials";
import { cardLabels, plural, pluralWord } from "@/lib/format";
import { HeroSearch } from "@/components/search";
import { MaterialCard } from "@/components/material-card";
import { Reveal } from "@/components/reveal";
import { typeMeta } from "@/components/type-meta";
import type { MaterialType } from "@/lib/content";
import { SECTIONS, subjectOrder } from "@/lib/taxonomy";
import { sectionMeta } from "@/components/section-icon";
import { excerpt, getNews, getPublishedUserDocs } from "@/lib/community";
import { formatDate } from "@/lib/format";

export default async function HomePage() {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  const [materials, userDocs, news] = await Promise.all([
    getMaterials(locale),
    getPublishedUserDocs(6),
    getNews(locale),
  ]);
  const latestNews = news.slice(0, 3);
  const recent = materials.slice(0, 3);
  const labels = cardLabels(recent, dict, locale);

  const bySubject = Object.values(
    materials.reduce<
      Record<string, { slug: string; name: string; section: string; count: number }>
    >((acc, m) => {
      acc[m.subject] ??= {
        slug: m.subject,
        name: m.subjectName,
        section: m.section,
        count: 0,
      };
      acc[m.subject].count++;
      return acc;
    }, {}),
  ).sort((a, b) => subjectOrder(a.slug) - subjectOrder(b.slug));
  const bySection = SECTIONS.map((s) => ({
    ...s,
    topics: bySubject.filter((t) => t.section === s.slug),
    count: materials.filter((m) => m.section === s.slug).length,
  })).filter((s) => s.count > 0);
  const byType = (["note", "doc", "link", "photo"] as MaterialType[]).map((t) => ({
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
            <MaterialCard
              key={m.slug}
              material={m}
              locale={locale}
              labels={labels[m.slug]}
              index={i}
            />
          ))}
        </div>
      </section>

      {latestNews.length > 0 && (
        <section className="mx-auto mt-16 max-w-6xl px-4 sm:px-6">
          <div className="mb-6 flex items-end justify-between gap-4">
            <h2 className="flex items-center gap-2 font-display text-2xl font-bold tracking-tight">
              <Megaphone size={22} className="text-ochre" />
              {dict.news.title}
            </h2>
            <Link href={`/${locale}/news`} className="group flex items-center gap-1.5 text-sm font-medium text-accent">
              {dict.news.back}
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {latestNews.map((n, i) => (
              <Reveal key={n.id} delay={i * 0.05}>
                <Link
                  href={`/${locale}/news/${n.slug}`}
                  className="group block h-full rounded-2xl border border-line bg-surface p-5 transition-all duration-300 hover:-translate-y-1 hover:border-ochre hover:shadow-[0_14px_34px_-20px_var(--ochre)]"
                >
                  <span className="flex items-center gap-2 text-xs text-muted">
                    {n.pinned && <Pin size={12} className="text-ochre" />}
                    {formatDate(n.publishedAt, locale)}
                  </span>
                  <span className="mt-2 block font-display text-lg font-bold leading-snug transition-colors group-hover:text-ochre">
                    {n.title}
                  </span>
                  <span className="mt-2 line-clamp-3 block text-sm text-muted">{excerpt(n.body)}</span>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {userDocs.length > 0 && (
        <section className="mx-auto mt-16 max-w-6xl px-4 sm:px-6">
          <h2 className="font-display text-2xl font-bold tracking-tight">{dict.docs.community}</h2>
          <p className="mb-6 mt-1 text-sm text-muted">{dict.docs.communityLead}</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {userDocs.map((d, i) => {
              const Icon = d.kind === "pdf" ? FileText : d.kind === "model" ? Box : FileCode;
              const tone = d.kind === "pdf" ? "bg-rose-soft text-rose" : d.kind === "model" ? "bg-accent-soft text-accent" : "bg-plum-soft text-plum";
              return (
                <Reveal key={d.id} delay={i * 0.05}>
                  <Link
                    href={`/${locale}/docs/${d.id}`}
                    className="group flex h-full gap-3 rounded-2xl border border-line bg-surface p-4 transition-all duration-300 hover:-translate-y-1 hover:border-accent"
                  >
                    <span className={`flex size-11 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:rotate-[-6deg] group-hover:scale-110 ${tone}`}>
                      <Icon size={20} />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">{d.name}</span>
                      {d.description && <span className="line-clamp-2 block text-sm text-muted">{d.description}</span>}
                      <span className="mt-1 block text-xs text-muted">
                        {dict.docs.by} {d.author} · {formatDate(d.publishedAt, locale)}
                      </span>
                    </span>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </section>
      )}

      <section className="mx-auto mt-16 max-w-6xl px-4 sm:px-6">
        <h2 className="font-display text-2xl font-bold tracking-tight">{dict.home.subjects}</h2>
        <p className="mb-6 mt-1 text-sm text-muted">{dict.home.subjectsLead}</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {bySection.map((section, i) => {
            const meta = sectionMeta[section.slug];
            const Icon = meta.icon;
            return (
              <Reveal key={section.slug} delay={Math.min(i, 5) * 0.05} for={section.profiles.join(" ")}>
                <div className="group relative h-full overflow-hidden rounded-2xl border border-line bg-surface p-5 transition-all duration-300 hover:-translate-y-1 hover:border-accent hover:shadow-[0_14px_34px_-20px_var(--accent)]">
                  <span
                    className={`absolute -right-8 -top-8 size-24 rounded-full opacity-60 transition-transform duration-500 group-hover:scale-[2.2] ${meta.soft}`}
                  />
                  <Link
                    href={`/${locale}/materials?section=${section.slug}`}
                    className="relative flex items-center gap-3"
                  >
                    <span
                      className={`flex size-10 items-center justify-center rounded-xl transition-transform duration-300 group-hover:rotate-[-8deg] group-hover:scale-110 ${meta.soft} ${meta.tone}`}
                    >
                      <Icon size={20} />
                    </span>
                    <span>
                      <span className="block font-display text-lg font-bold leading-tight">
                        {section.name[locale]}
                      </span>
                      <span className="text-sm text-muted">
                        {plural(section.topics.length, dict.plurals.topics, locale)} ·{" "}
                        {plural(section.count, dict.plurals.materials, locale)}
                      </span>
                    </span>
                  </Link>
                  <div className="relative mt-4 flex flex-wrap gap-1.5">
                    {section.topics.map((t) => (
                      <Link
                        key={t.slug}
                        href={`/${locale}/materials?subject=${t.slug}`}
                        className="rounded-full border border-line bg-surface px-2.5 py-0.5 text-xs text-muted transition-colors hover:border-ochre hover:bg-ochre-soft hover:text-ink"
                      >
                        {t.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>
    </>
  );
}
