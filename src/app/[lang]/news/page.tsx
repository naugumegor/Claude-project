import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Pin } from "lucide-react";
import { getDictionary, getLocale } from "@/dictionaries";
import { alternates } from "@/lib/site";
import { excerpt, getNews } from "@/lib/community";
import { formatDate } from "@/lib/format";
import { Reveal } from "@/components/reveal";

export async function generateMetadata(): Promise<Metadata> {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  return { title: dict.news.title, description: dict.news.lead, alternates: alternates(locale, "/news") };
}

export default async function NewsPage() {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  const posts = await getNews(locale);
  return (
    <div className="mx-auto max-w-4xl px-4 pt-14 sm:px-6">
      <Reveal>
        <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">{dict.news.title}</h1>
        <p className="mt-3 max-w-3xl text-muted">{dict.news.lead}</p>
      </Reveal>
      {posts.length === 0 ? (
        <p className="mt-16 rounded-2xl border border-dashed border-line px-6 py-12 text-center text-muted">{dict.news.empty}</p>
      ) : (
        <div className="mt-10 grid gap-5">
          {posts.map((p, i) => (
            <Reveal key={p.id} delay={Math.min(i, 5) * 0.05}>
              <Link
                href={`/${locale}/news/${p.slug}`}
                className="group grid overflow-hidden rounded-2xl border border-line bg-surface transition-all duration-300 hover:-translate-y-1 hover:border-ochre hover:shadow-[0_18px_40px_-24px_var(--ochre)] sm:grid-cols-[14rem_1fr]"
              >
                {p.cover ? (
                  // eslint-disable-next-line @next/next/no-img-element -- an external cover image of any size
                  <img src={p.cover} alt="" className="h-44 w-full object-cover transition-transform duration-500 group-hover:scale-105 sm:h-full" />
                ) : (
                  <span className="hidden bg-[radial-gradient(circle_at_30%_30%,var(--ochre-soft),transparent_60%),radial-gradient(circle_at_80%_70%,var(--accent-soft),transparent_55%)] sm:block" />
                )}
                <span className="block p-5">
                  <span className="flex items-center gap-2 text-xs text-muted">
                    {p.pinned && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-ochre-soft px-2 py-0.5 font-semibold text-ochre">
                        <Pin size={11} />
                        {dict.news.pinned}
                      </span>
                    )}
                    {formatDate(p.publishedAt, locale)}
                  </span>
                  <span className="mt-2 block font-display text-xl font-bold leading-snug transition-colors group-hover:text-ochre">
                    {p.title}
                  </span>
                  <span className="mt-2 line-clamp-3 block text-sm text-muted">{excerpt(p.body)}</span>
                  <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-accent">
                    {dict.news.read}
                    <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                  </span>
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
