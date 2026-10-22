import { NextResponse, type NextRequest } from "next/server";
import { searchMaterials } from "@/db/search";
import { getMaterials } from "@/lib/materials";
import { hasLocale } from "@/lib/i18n";
import type { SearchItem } from "@/lib/search";

// GET /api/search?q=...&locale=ru → matching materials, best first.
export async function GET(request: NextRequest) {
  const q = (request.nextUrl.searchParams.get("q") ?? "").slice(0, 200);
  const locale = request.nextUrl.searchParams.get("locale") ?? "ru";
  if (!hasLocale(locale)) return NextResponse.json({ error: "Bad locale" }, { status: 400 });

  const [hits, materials] = await Promise.all([searchMaterials(q), getMaterials(locale)]);
  const bySlug = new Map(materials.map((m) => [m.slug, m]));
  const items: SearchItem[] = hits.flatMap((hit) => {
    const m = bySlug.get(hit.slug);
    return m
      ? [{
          slug: m.slug,
          type: m.type,
          title: m.title,
          excerpt: m.excerpt,
          subject: m.subjectName,
          tags: m.tags,
          snippet: hit.snippet || undefined,
        }]
      : [];
  });
  return NextResponse.json({ items });
}
