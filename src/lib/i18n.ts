export const locales = ["ru", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "ru";

export const hasLocale = (value: string): value is Locale =>
  (locales as readonly string[]).includes(value);

// Picks the best supported locale from an Accept-Language header.
export function matchLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return defaultLocale;
  const ranked = acceptLanguage
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { lang: tag.toLowerCase().split("-")[0], q: q ? Number(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);
  return ranked.find((r) => hasLocale(r.lang))?.lang as Locale ?? defaultLocale;
}
