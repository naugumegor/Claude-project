import {
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const materialType = pgEnum("material_type", ["note", "link", "photo", "doc"]);
export const materialStatus = pgEnum("material_status", ["draft", "published"]);
export const fileKind = pgEnum("file_kind", ["pdf", "html"]);

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


/** PDF and HTML documents attached to a material, shown in a viewer on its page. */
export const materialFiles = pgTable("material_files", {
  id: serial("id").primaryKey(),
  materialId: integer("material_id")
    .notNull()
    .references(() => materials.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  name: text("name").notNull(),
  kind: fileKind("kind").notNull(),
  size: integer("size").notNull().default(0),
  position: integer("position").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Site visitors with an account: email + password, GitHub, or both. Future shop customers. */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  /** Stored lowercased. */
  email: text("email").unique(),
  name: text("name").notNull().default(""),
  passwordHash: text("password_hash"),
  githubId: text("github_id").unique(),
  githubLogin: text("github_login"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const favorites = pgTable(
  "favorites",
  {
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    materialId: integer("material_id")
      .notNull()
      .references(() => materials.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.materialId] })],
);

/** Failed sign-in attempts, keyed by email and by IP, for simple brute-force throttling. */
export const authFailures = pgTable(
  "auth_failures",
  {
    id: serial("id").primaryKey(),
    key: text("key").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("auth_failures_key_idx").on(t.key, t.createdAt)],
);
