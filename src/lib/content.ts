import type { Locale } from "@/lib/i18n";
import { sectionOf, type SectionSlug } from "@/lib/taxonomy";
import type { DocumentKind } from "@/lib/documents";

export type MaterialType = "note" | "link" | "photo" | "doc";
export type MaterialStatus = "draft" | "published";

export type MaterialText = {
  title: string;
  excerpt: string;
  body?: string; // Markdown
};

export type MaterialImage = {
  id?: number;
  src: string;
  alt: string;
  width: number | null;
  height: number | null;
};

export type MaterialFile = {
  id?: number;
  url: string;
  name: string;
  kind: DocumentKind;
  size: number;
};

export type Material = {
  id: number;
  slug: string;
  type: MaterialType;
  status: MaterialStatus;
  /** Language the material was originally written in. */
  lang: Locale;
  /** Original text plus optional translations, keyed by locale. */
  text: Partial<Record<Locale, MaterialText>>;
  subject: { slug: string; name: Record<Locale, string>; section?: string | null };
  tags: string[];
  url?: string;
  images: MaterialImage[];
  files: MaterialFile[];
  createdAt: string; // ISO date
};

/** What a page renders: the text in the requested locale, or the original as a fallback. */
export type LocalizedMaterial = Omit<Material, "text" | "subject"> &
  MaterialText & {
    subject: string;
    subjectName: string;
    section: SectionSlug;
    translated: boolean;
  };

export function localize(material: Material, locale: Locale): LocalizedMaterial {
  const { text, subject, ...rest } = material;
  const own = text[locale];
  return {
    ...rest,
    ...(own ?? text[material.lang]!),
    subject: subject.slug,
    subjectName: subject.name[locale],
    section: sectionOf(subject.slug, subject.section),
    translated: Boolean(own) || material.lang === locale,
  };
}
