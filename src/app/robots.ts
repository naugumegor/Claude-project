import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n";
import { siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", ...locales.map((l) => `/${l}/admin`)],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
