import {
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const materialType = pgEnum("material_type", ["note", "link", "photo"]);
export const materialStatus = pgEnum("material_status", ["draft", "published"]);

export const subjects = pgTable("subjects", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  nameRu: text("name_ru").notNull(),
  nameEn: text("name_en").notNull(),
});

export const materials = pgTable("materials", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  type: materialType("type").notNull(),
  /** Language the material was originally written in. */
  lang: text("lang").notNull(),
  subjectId: integer("subject_id")
    .notNull()
    .references(() => subjects.id),
  url: text("url"),
  status: materialStatus("status").notNull().default("draft"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Title/excerpt/body per locale: the original plus an optional translation. */
export const materialTexts = pgTable(
  "material_texts",
  {
    materialId: integer("material_id")
      .notNull()
      .references(() => materials.id, { onDelete: "cascade" }),
    locale: text("locale").notNull(),
    title: text("title").notNull(),
    excerpt: text("excerpt").notNull().default(""),
    body: text("body").notNull().default(""),
  },
  (t) => [primaryKey({ columns: [t.materialId, t.locale] })],
);

export const tags = pgTable("tags", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
});

export const materialTags = pgTable(
  "material_tags",
  {
    materialId: integer("material_id")
      .notNull()
      .references(() => materials.id, { onDelete: "cascade" }),
    tagId: integer("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.materialId, t.tagId] })],
);

/** Uploaded or linked images. Shared with products once the shop exists. */
export const media = pgTable("media", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  width: integer("width"),
  height: integer("height"),
  alt: text("alt").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const materialMedia = pgTable(
  "material_media",
  {
    materialId: integer("material_id")
      .notNull()
      .references(() => materials.id, { onDelete: "cascade" }),
    mediaId: integer("media_id")
      .notNull()
      .references(() => media.id, { onDelete: "cascade" }),
    position: integer("position").notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.materialId, t.mediaId] })],
);
