import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n";
import { getMaterials } from "@/lib/materials";
import { siteUrl } from "@/lib/site";
import { getNews } from "@/lib/community";

// Every page in both languages, each pointing at its translation.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [materials, news] = await Promise.all([getMaterials("ru"), getNews("ru")]);
  const entry = (path: string, lastModified?: string, priority = 0.7) =>
    locales.map((l) => ({
      url: `${siteUrl}/${l}${path}`,
      lastModified,
      priority,
      alternates: { languages: Object.fromEntries(locales.map((x) => [x, `${siteUrl}/${x}${path}`])) },
    }));

  return [
    ...entry("", materials[0]?.createdAt, 1),
    ...entry("/materials", materials[0]?.createdAt, 0.9),
    ...entry("/reference", undefined, 0.8),
    ...entry("/tools", undefined, 0.8),
    ...entry("/glossary", undefined, 0.6),
    ...entry("/news", news[0]?.publishedAt, 0.7),
    ...news.map((n) => entry(`/news/${n.slug}`, n.publishedAt, 0.5)).flat(),
    ...materials.flatMap((m) => entry(`/materials/${m.slug}`, m.createdAt)),
  ];
}
