import { locales, type Locale } from "@/lib/i18n";

/** Public base URL: the custom/production domain on Vercel, localhost otherwise. */
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

/** canonical + hreflang links for a path that exists in every locale, e.g. "/materials". */
export function alternates(locale: Locale, path = "") {
  return {
    canonical: `/${locale}${path}`,
    languages: {
      ...Object.fromEntries(locales.map((l) => [l, `/${l}${path}`])),
      "x-default": `/ru${path}`,
    },
  };
}
