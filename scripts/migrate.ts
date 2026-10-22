// Runs before `next build`: applies SQL migrations from ./drizzle and seeds an empty database.
import { migrate as migrateNeon } from "drizzle-orm/neon-serverless/migrator";
import { migrate as migratePglite } from "drizzle-orm/pglite/migrator";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-serverless";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { mkdirSync } from "node:fs";
import * as schema from "../src/db/schema";
import { seedMaterials, seedSubjects } from "../src/db/seed-data";
import { seedLibrary } from "./seed-library";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url && process.env.VERCEL) {
    throw new Error("DATABASE_URL is not set. Connect the Neon database to this Vercel project.");
  }

  let db;
  if (url) {
    db = drizzleNeon(url, { schema });
    await migrateNeon(db, { migrationsFolder: "drizzle" });
  } else {
    const dir = process.env.PGLITE_DIR ?? ".data/pglite";
    mkdirSync(dir, { recursive: true });
    db = drizzlePglite(dir, { schema });
    await migratePglite(db, { migrationsFolder: "drizzle" });
  }
  console.log(`Migrations applied (${url ? "Neon" : "local PGlite"}).`);

  const existing = await db.select({ id: schema.subjects.id }).from(schema.subjects).limit(1);
  if (existing.length > 0) return seedLibrary(db);

  await db.transaction(async (tx) => {
    const subjectRows = await tx.insert(schema.subjects).values(seedSubjects).returning();
    const subjectId = (slug: string) => subjectRows.find((s) => s.slug === slug)!.id;

    for (const item of [...seedMaterials].reverse()) {
      const [m] = await tx
        .insert(schema.materials)
        .values({
          slug: item.slug,
          type: item.type,
          lang: item.lang,
          subjectId: subjectId(item.subject),
          url: item.url,
          status: "published",
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.createdAt),
        })
        .returning();

      await tx.insert(schema.materialTexts).values(
        Object.entries(item.text).map(([locale, t]) => ({
          materialId: m.id,
          locale,
          title: t.title,
          excerpt: t.excerpt,
          body: t.body ?? "",
        })),
      );

      for (const name of item.tags) {
        const [tag] = await tx
          .insert(schema.tags)
          .values({ name })
          .onConflictDoUpdate({ target: schema.tags.name, set: { name } })
          .returning();
        await tx.insert(schema.materialTags).values({ materialId: m.id, tagId: tag.id });
      }

      for (const [position, img] of (item.images ?? []).entries()) {
        const [row] = await tx
          .insert(schema.media)
          .values({ url: img.src, alt: img.alt, width: img.width, height: img.height })
          .returning();
        await tx.insert(schema.materialMedia).values({ materialId: m.id, mediaId: row.id, position });
      }
    }
  });
  console.log(`Seeded ${seedMaterials.length} demo materials.`);
  await seedLibrary(db);
}

main().then(
  () => process.exit(0),
  (err) => {
    console.error(err);
    process.exit(1);
  },
);
