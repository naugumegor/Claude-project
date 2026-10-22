import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getDictionary, getLocale } from "@/dictionaries";
import { alternates } from "@/lib/site";
import { excerpt, getNews, getNewsPost } from "@/lib/community";
import { formatDate } from "@/lib/format";
import { Markdown } from "@/components/markdown";
import { Reveal } from "@/components/reveal";

export async function generateStaticParams() {
  const posts = await getNews("ru");
  // Cache Components needs at least one param; the placeholder simply 404s.
  return (posts.length > 0 ? posts.map((p) => p.slug) : ["__none__"]).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/news/[slug]">): Promise<Metadata> {
  const [{ slug }, locale] = await Promise.all([params, getLocale()]);
  const post = await getNewsPost(locale, slug);
  if (!post) return {};
  return { title: post.title, description: excerpt(post.body), alternates: alternates(locale, `/news/${slug}`) };
}

export default async function NewsPostPage({ params }: PageProps<"/[lang]/news/[slug]">) {
  const [{ slug }, dict, locale] = await Promise.all([params, getDictionary(), getLocale()]);
  const post = await getNewsPost(locale, slug);
  if (!post) notFound();
  return (
    <article className="mx-auto max-w-3xl px-4 pt-12 sm:px-6">
      <Link
        href={`/${locale}/news`}
        className="group mb-6 inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-accent"
      >
        <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
        {dict.news.back}
      </Link>
      <Reveal>
        <p className="text-sm text-muted">{formatDate(post.publishedAt, locale)}</p>
        <h1 className="mt-2 font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">{post.title}</h1>
        {post.fallback && <p className="mt-2 text-xs text-muted">{dict.materials.onlyIn} {dict.langNames.ru}</p>}
      </Reveal>
      {post.cover && (
        // eslint-disable-next-line @next/next/no-img-element -- an external cover image of any size
        <img src={post.cover} alt="" className="mt-8 max-h-[28rem] w-full rounded-2xl border border-line object-cover" />
      )}
      <div className="mt-8">
        <Markdown locale={post.fallback ? "ru" : locale}>{post.body}</Markdown>
      </div>
    </article>
  );
}
