import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, ArrowUpRight, Languages } from "lucide-react";
import { getDictionary, getLocale } from "@/dictionaries";
import { getMaterial, getSlugs } from "@/lib/materials";
import { formatDate, isOptimizable } from "@/lib/format";
import { Markdown } from "@/components/markdown";
import { Reveal } from "@/components/reveal";
import { typeMeta } from "@/components/type-meta";

export async function generateStaticParams() {
  const slugs = await getSlugs();
  // Cache Components needs at least one param; the placeholder simply 404s.
  return (slugs.length > 0 ? slugs : ["__none__"]).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/materials/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const material = await getMaterial(await getLocale(), slug);
  if (!material) return {};
  return { title: material.title, description: material.excerpt };
}

export default async function MaterialPage({ params }: PageProps<"/[lang]/materials/[slug]">) {
  const { slug } = await params;
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  const material = await getMaterial(locale, slug);
  if (!material) notFound();

  const meta = typeMeta[material.type];
  const Icon = meta.icon;

  return (
    <article className="mx-auto max-w-3xl px-4 pt-10 sm:px-6">
      <Link
        href={`/${locale}/materials`}
        className="group inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-accent"
      >
        <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
        {dict.materials.back}
      </Link>

      <Reveal className="mt-8">
        <div className="flex flex-wrap items-center gap-2.5 text-sm text-muted">
          <span
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 font-semibold ${meta.soft} ${meta.tone}`}
          >
            <Icon size={15} />
            {dict.types[material.type]}
          </span>
          <span>{material.subjectName}</span>
          <span className="text-muted/50">·</span>
          <time dateTime={material.createdAt}>{formatDate(material.createdAt, locale)}</time>
        </div>
        <h1 className="mt-5 font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
          {material.title}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-muted">{material.excerpt}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {material.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-surface-2 px-3 py-1 text-sm text-muted">
              #{tag}
            </span>
          ))}
        </div>
      </Reveal>

      {!material.translated && (
        <Reveal delay={0.1} className="mt-6">
          <p className="flex items-center gap-2 rounded-xl border border-ochre/40 bg-ochre-soft px-4 py-3 text-sm">
            <Languages size={18} className="shrink-0 text-ochre" />
            {dict.materials.onlyIn} {dict.langNames[material.lang]}
          </p>
        </Reveal>
      )}

      {material.url && (
        <Reveal delay={0.12} className="mt-8">
          <a
            href={material.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between gap-4 rounded-2xl border border-line bg-surface p-5 transition-all duration-300 hover:-translate-y-1 hover:border-ochre hover:shadow-[0_16px_40px_-22px_var(--ochre)]"
          >
            <span className="min-w-0">
              <span className="block font-semibold">{dict.materials.visit}</span>
              <span className="block truncate text-sm text-muted">{material.url}</span>
            </span>
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-ochre-soft text-ochre transition-transform duration-300 group-hover:rotate-45">
              <ArrowUpRight size={20} />
            </span>
          </a>
        </Reveal>
      )}

      {material.images?.map((img) => (
        <Reveal key={img.id ?? img.src} delay={0.14} className="mt-8">
          <figure className="overflow-hidden rounded-2xl border border-line bg-surface">
            <Image
              src={img.src}
              alt={img.alt}
              width={img.width ?? 1200}
              height={img.height ?? 800}
              unoptimized={!isOptimizable(img.src)}
              className="h-auto w-full"
              priority
            />
            {img.alt && (
              <figcaption className="border-t border-line px-4 py-2.5 text-sm text-muted">
                {img.alt}
              </figcaption>
            )}
          </figure>
        </Reveal>
      ))}

      {material.body && (
        <Reveal delay={0.18} className="mt-6">
          <Markdown>{material.body}</Markdown>
        </Reveal>
      )}
    </article>
  );
}
