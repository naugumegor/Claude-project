import { cacheLife, cacheTag } from "next/cache";
import { loadMaterials } from "@/db/queries";
import type { Locale } from "@/lib/i18n";
import { localize, type LocalizedMaterial } from "@/lib/content";

// Public, cached reads. The admin calls updateTag("materials") after every change,
// so new or edited materials show up immediately.

export async function getMaterials(locale: Locale): Promise<LocalizedMaterial[]> {
  "use cache";
  cacheTag("materials");
  cacheLife("max");
  const rows = await loadMaterials({ status: "published" });
  return rows.map((m) => localize(m, locale));
}

export async function getMaterial(
  locale: Locale,
  slug: string,
): Promise<LocalizedMaterial | null> {
  "use cache";
  cacheTag("materials");
  cacheLife("max");
  const [found] = await loadMaterials({ slug });
  return found && found.status === "published" ? localize(found, locale) : null;
}

export async function getSlugs(): Promise<string[]> {
  "use cache";
  cacheTag("materials");
  const rows = await loadMaterials({ status: "published" });
  return rows.map((m) => m.slug);
}
