import type { Locale } from "@/lib/i18n";

export type MaterialType = "note" | "link" | "photo";

export type MaterialText = {
  title: string;
  excerpt: string;
  body?: string; // Markdown
};

export type Material = {
  id: string;
  slug: string;
  type: MaterialType;
  /** Language the material was originally written in. */
  lang: Locale;
  /** Original text plus optional translations, keyed by locale. */
  text: Partial<Record<Locale, MaterialText>>;
  subject: string;
  tags: string[];
  url?: string;
  images?: { src: string; alt: string }[];
  createdAt: string; // ISO date
};

/** What a page renders: the text in the requested locale, or the original as a fallback. */
export type LocalizedMaterial = Omit<Material, "text"> &
  MaterialText & { translated: boolean };

export function localize(material: Material, locale: Locale): LocalizedMaterial {
  const { text, ...rest } = material;
  const own = text[locale];
  return {
    ...rest,
    ...(own ?? text[material.lang]!),
    translated: Boolean(own) || material.lang === locale,
  };
}
