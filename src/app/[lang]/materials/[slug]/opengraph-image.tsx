import { hasLocale } from "@/lib/i18n";
import { getMaterial } from "@/lib/materials";
import { ogSize, renderOg } from "@/lib/og";
import ru from "@/dictionaries/ru.json";
import en from "@/dictionaries/en.json";

export const size = ogSize;
export const contentType = "image/png";
export const alt = "Ingenium";

export default async function Image({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params;
  const locale = hasLocale(lang) ? lang : "ru";
  const dict = locale === "en" ? en : ru;
  const material = await getMaterial(locale, slug);
  if (!material) return renderOg({ title: "Ingenium", subtitle: dict.meta.description });
  return renderOg({
    title: material.title,
    subtitle: material.excerpt,
    badge: `${dict.types[material.type]} · ${material.subjectName}`,
    type: material.type,
  });
}
