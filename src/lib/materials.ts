import { materials } from "@/content/mock";
import type { Locale } from "@/lib/i18n";
import { localize, type LocalizedMaterial } from "@/lib/content";

// Data access layer. Stage 2 swaps the mock array for database queries;
// pages only talk to these functions, so they won't need to change.

export async function getMaterials(locale: Locale): Promise<LocalizedMaterial[]> {
  return [...materials]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((m) => localize(m, locale));
}

export async function getMaterial(
  locale: Locale,
  slug: string,
): Promise<LocalizedMaterial | null> {
  const found = materials.find((m) => m.slug === slug);
  return found ? localize(found, locale) : null;
}

export async function getSlugs(): Promise<string[]> {
  return materials.map((m) => m.slug);
}
