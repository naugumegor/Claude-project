// Loads the engineering notes from ./content/notes into the database.
// Layout: content/notes/<subject-slug>/<material-slug>.<locale>.md, subjects listed in content/notes/subjects.json.
// Each file starts with a front matter block (title, excerpt; tags and date go in the Russian file). Idempotent: subjects and materials
// that already exist (matched by slug) are left alone, so edits made in the admin are never overwritten.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { eq } from "drizzle-orm";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import * as schema from "../src/db/schema";

const ROOT = "content/notes";

type Subject = { slug: string; nameRu: string; nameEn: string };
type Note = {
  slug: string;
  subject: string;
  date: string;
  tags: string[];
  text: Partial<Record<"ru" | "en", { title: string; excerpt: string; body: string }>>;
};

function parse(file: string) {
  const src = readFileSync(file, "utf8").replace(/\r\n/g, "\n");
  const match = src.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) throw new Error(`${file}: missing front matter`);
  const meta: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const i = line.indexOf(":");
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^"(.*)"$/, "$1");
  }
  if (!meta.title) throw new Error(`${file}: missing title`);
  return { meta, body: src.slice(match[0].length).trim() };
}

export function readLibrary(): { subjects: Subject[]; notes: Note[] } {
  const subjects: Subject[] = JSON.parse(readFileSync(join(ROOT, "subjects.json"), "utf8"));
  const notes = new Map<string, Note>();
  for (const subject of subjects) {
    let files: string[];
    try {
      files = readdirSync(join(ROOT, subject.slug));
    } catch {
      continue;
    }
    for (const name of files.sort()) {
      const m = name.match(/^(.+)\.(ru|en)\.md$/);
      if (!m) continue;
      const [, slug, locale] = m as unknown as [string, string, "ru" | "en"];
      const { meta, body } = parse(join(ROOT, subject.slug, name));
      const note = notes.get(slug) ?? { slug, subject: subject.slug, date: "", tags: [], text: {} };
      if (note.subject !== subject.slug) throw new Error(`${slug}: slug used in two subjects`);
      note.text[locale] = { title: meta.title, excerpt: meta.excerpt ?? "", body };
      if (meta.date) note.date = meta.date;
      if (meta.tags) note.tags.push(...meta.tags.split(",").map((t) => t.trim()).filter(Boolean));
      notes.set(slug, note);
    }
  }
  return { subjects, notes: [...notes.values()] };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function seedLibrary(db: PgDatabase<PgQueryResultHKT, typeof schema, any>) {
  const { subjects, notes } = readLibrary();
  let added = 0;
  await db.transaction(async (tx) => {
    const subjectIds = new Map<string, number>();
    for (const s of subjects) {
      const [row] = await tx
        .insert(schema.subjects)
        .values(s)
        .onConflictDoUpdate({ target: schema.subjects.slug, set: { slug: s.slug } })
        .returning({ id: schema.subjects.id });
      subjectIds.set(s.slug, row.id);
    }

    for (const note of notes) {
      const exists = await tx
        .select({ id: schema.materials.id })
        .from(schema.materials)
        .where(eq(schema.materials.slug, note.slug))
        .limit(1);
      if (exists.length) continue;

      const lang = note.text.ru ? "ru" : "en";
      const date = new Date(note.date || "2026-10-22");
      const [m] = await tx
        .insert(schema.materials)
        .values({
          slug: note.slug,
          type: "note",
          lang,
          subjectId: subjectIds.get(note.subject)!,
          status: "published",
          createdAt: date,
          updatedAt: date,
        })
        .returning({ id: schema.materials.id });

      await tx.insert(schema.materialTexts).values(
        Object.entries(note.text).map(([locale, t]) => ({ materialId: m.id, locale, ...t })),
      );

      for (const name of new Set(note.tags)) {
        const [tag] = await tx
          .insert(schema.tags)
          .values({ name })
          .onConflictDoUpdate({ target: schema.tags.name, set: { name } })
          .returning();
        await tx.insert(schema.materialTags).values({ materialId: m.id, tagId: tag.id });
      }
      added++;
    }
  });
  console.log(`Library: ${notes.length} notes on disk, ${added} added.`);
  await seedDocs(db);
}

type BundledDoc = {
  slug: string;
  subject: string;
  date: string;
  tags: string[];
  file: { path: string; name: string };
  text: Partial<Record<"ru" | "en", { title: string; excerpt: string; body: string }>>;
};

// HTML documents that ship with the code: content/docs/docs.json lists them, the files sit next to it and are
// served by /api/files/[id] from disk ("bundle:<file>"). Same rule as the notes: added once, never overwritten.
// Preview builds share the production database, so they leave it alone: a new document appears only once it is on main.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function seedDocs(db: PgDatabase<PgQueryResultHKT, typeof schema, any>) {
  if (process.env.VERCEL_ENV === "preview") return;
  const docs: BundledDoc[] = JSON.parse(readFileSync("content/docs/docs.json", "utf8"));
  const subjectRows = await db.select({ id: schema.subjects.id, slug: schema.subjects.slug }).from(schema.subjects);
  const subjectIds = new Map(subjectRows.map((r) => [r.slug, r.id]));
  let added = 0;
  await db.transaction(async (tx) => {
    for (const doc of docs) {
      const exists = await tx
        .select({ id: schema.materials.id })
        .from(schema.materials)
        .where(eq(schema.materials.slug, doc.slug))
        .limit(1);
      if (exists.length) continue;

      const subjectId = subjectIds.get(doc.subject);
      if (!subjectId) throw new Error(`${doc.slug}: unknown subject ${doc.subject}`);
      const date = new Date(doc.date);
      const [m] = await tx
        .insert(schema.materials)
        .values({
          slug: doc.slug,
          type: "doc",
          lang: doc.text.ru ? "ru" : "en",
          subjectId,
          status: "published",
          createdAt: date,
          updatedAt: date,
        })
        .returning({ id: schema.materials.id });

      await tx.insert(schema.materialTexts).values(
        Object.entries(doc.text).map(([locale, t]) => ({ materialId: m.id, locale, ...t })),
      );
      await tx.insert(schema.materialFiles).values({
        materialId: m.id,
        url: `bundle:${doc.file.path}`,
        name: doc.file.name,
        kind: "html",
        size: statSync(join("content/docs", doc.file.path)).size,
      });

      for (const name of new Set(doc.tags.map((t) => t.toLowerCase()))) {
        const [tag] = await tx
          .insert(schema.tags)
          .values({ name })
          .onConflictDoUpdate({ target: schema.tags.name, set: { name } })
          .returning();
        await tx.insert(schema.materialTags).values({ materialId: m.id, tagId: tag.id });
      }
      added++;
    }
  });
  console.log(`Documents: ${docs.length} on disk, ${added} added.`);
}
