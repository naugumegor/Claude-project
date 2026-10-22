import { asc, desc, eq, inArray } from "drizzle-orm";
import type { Locale } from "@/lib/i18n";
import type { Material, MaterialStatus } from "@/lib/content";
import { db } from "./index";
import {
  materialMedia,
  materialTags,
  materialTexts,
  materials,
  media,
  subjects,
  tags,
} from "./schema";

/** Loads materials with their texts, subject, tags and images, newest first. */
export async function loadMaterials(filter: {
  status?: MaterialStatus;
  slug?: string;
  id?: number;
}): Promise<Material[]> {
  const where = filter.slug
    ? eq(materials.slug, filter.slug)
    : filter.id
      ? eq(materials.id, filter.id)
      : filter.status
        ? eq(materials.status, filter.status)
        : undefined;

  const rows = await db
    .select({ m: materials, s: subjects })
    .from(materials)
    .innerJoin(subjects, eq(materials.subjectId, subjects.id))
    .where(where)
    .orderBy(desc(materials.createdAt), desc(materials.id));
  if (rows.length === 0) return [];

  const ids = rows.map((r) => r.m.id);
  const [texts, tagRows, mediaRows] = await Promise.all([
    db.select().from(materialTexts).where(inArray(materialTexts.materialId, ids)),
    db
      .select({ materialId: materialTags.materialId, name: tags.name })
      .from(materialTags)
      .innerJoin(tags, eq(materialTags.tagId, tags.id))
      .where(inArray(materialTags.materialId, ids))
      .orderBy(asc(tags.name)),
    db
      .select({ materialId: materialMedia.materialId, position: materialMedia.position, m: media })
      .from(materialMedia)
      .innerJoin(media, eq(materialMedia.mediaId, media.id))
      .where(inArray(materialMedia.materialId, ids))
      .orderBy(asc(materialMedia.position)),
  ]);

  return rows.map(({ m, s }) => ({
    id: m.id,
    slug: m.slug,
    type: m.type,
    status: m.status,
    lang: m.lang as Locale,
    url: m.url ?? undefined,
    createdAt: m.createdAt.toISOString(),
    subject: { slug: s.slug, name: { ru: s.nameRu, en: s.nameEn } },
    text: Object.fromEntries(
      texts
        .filter((t) => t.materialId === m.id)
        .map((t) => [t.locale, { title: t.title, excerpt: t.excerpt, body: t.body || undefined }]),
    ),
    tags: tagRows.filter((t) => t.materialId === m.id).map((t) => t.name),
    images: mediaRows
      .filter((r) => r.materialId === m.id)
      .map(({ m: img }) => ({
        id: img.id,
        src: img.url,
        alt: img.alt,
        width: img.width,
        height: img.height,
      })),
  }));
}

export async function loadSubjects() {
  return db.select().from(subjects).orderBy(asc(subjects.id));
}
