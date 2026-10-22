import type { LocalizedMaterial } from "@/lib/content";
import type { Dictionary, PluralForms } from "@/dictionaries";
import type { Locale } from "@/lib/i18n";
import type { CardLabels } from "@/components/material-card";

export function formatDate(iso: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric" }).format(
    new Date(iso),
  );
}

/** Pre-translated labels for each card, so client components don't need the dictionary. */
export function cardLabels(
  materials: LocalizedMaterial[],
  dict: Dictionary,
  locale: Locale,
): Record<string, CardLabels> {
  return Object.fromEntries(
    materials.map((m) => [
      m.slug,
      {
        type: dict.types[m.type],
        subject: m.subjectName,
        date: formatDate(m.createdAt, locale),
      },
    ]),
  );
}

/** Picks the word form that fits the count: материал / материала / материалов. */
export function pluralWord(count: number, forms: PluralForms, locale: Locale) {
  return forms[new Intl.PluralRules(locale).select(count)] ?? forms.other;
}

export function plural(count: number, forms: PluralForms, locale: Locale) {
  return `${count} ${pluralWord(count, forms, locale)}`;
}

/** next/image can only optimise local files and our Blob store; other hosts are shown as-is. */
export function isOptimizable(src: string) {
  return src.startsWith("/") || /\.public\.blob\.vercel-storage\.com\//.test(src);
}
