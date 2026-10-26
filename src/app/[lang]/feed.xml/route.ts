import { notFound } from "next/navigation";
import ru from "@/dictionaries/ru.json";
import en from "@/dictionaries/en.json";
import { hasLocale, locales } from "@/lib/i18n";
import { getMaterials } from "@/lib/materials";
import { excerpt, getNews } from "@/lib/community";
import { siteUrl } from "@/lib/site";

// RSS 2.0 of new materials and news, one feed per language: /ru/feed.xml, /en/feed.xml.

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

const esc = (s: string) =>
  s.replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c]!);

export async function GET(_request: Request, ctx: RouteContext<"/[lang]/feed.xml">) {
  const { lang } = await ctx.params;
  if (!hasLocale(lang)) notFound();
  const dict = lang === "en" ? en : ru;
  const [materials, news] = await Promise.all([getMaterials(lang), getNews(lang)]);

  const items = [
    ...materials.map((m) => ({
      title: m.title,
      link: `${siteUrl}/${lang}/materials/${m.slug}`,
      description: m.excerpt,
      category: m.subjectName,
      date: m.createdAt,
    })),
    ...news.map((n) => ({
      title: n.title,
      link: `${siteUrl}/${lang}/news/${n.slug}`,
      description: excerpt(n.body),
      category: dict.nav.news,
      date: n.publishedAt,
    })),
  ]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 50);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>${esc(dict.meta.title)}</title>
<link>${siteUrl}/${lang}</link>
<description>${esc(dict.meta.description)}</description>
<language>${lang}</language>
<atom:link href="${siteUrl}/${lang}/feed.xml" rel="self" type="application/rss+xml"/>
${items
  .map(
    (i) => `<item>
<title>${esc(i.title)}</title>
<link>${i.link}</link>
<guid isPermaLink="true">${i.link}</guid>
<description>${esc(i.description)}</description>
<category>${esc(i.category)}</category>
<pubDate>${new Date(i.date).toUTCString()}</pubDate>
</item>`,
  )
  .join("\n")}
</channel>
</rss>
`;
  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, max-age=0, s-maxage=3600" },
  });
}
