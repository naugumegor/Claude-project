import {
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const materialType = pgEnum("material_type", ["note", "link", "photo", "doc"]);
export const materialStatus = pgEnum("material_status", ["draft", "published"]);
export const fileKind = pgEnum("file_kind", ["pdf", "html", "model"]);

export const subjects = pgTable("subjects", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  nameRu: text("name_ru").notNull(),
  nameEn: text("name_en").notNull(),
  /** Section slug from lib/taxonomy.ts; null falls back to the default map there. */
  section: text("section"),
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


/** PDF and HTML documents and .glb 3D models attached to a material, shown in a viewer on its page. */
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

export const userDocStatus = pgEnum("user_doc_status", ["private", "pending", "published", "rejected"]);

/**
 * "Мои документы": files a signed-in reader uploads to their account. Private by default;
 * the owner can suggest one for the home page, and it shows there once the admin approves.
 */
export const userDocuments = pgTable(
  "user_documents",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description").notNull().default(""),
    url: text("url").notNull(),
    kind: fileKind("kind").notNull(),
    size: integer("size").notNull().default(0),
    status: userDocStatus("status").notNull().default("private"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    publishedAt: timestamp("published_at", { withTimezone: true }),
  },
  (t) => [index("user_documents_user_idx").on(t.userId), index("user_documents_status_idx").on(t.status)],
);

/** News posts, written by the admin in Markdown; drafts are visible only to the admin. */
export const news = pgTable("news", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  titleRu: text("title_ru").notNull(),
  titleEn: text("title_en").notNull().default(""),
  bodyRu: text("body_ru").notNull().default(""),
  bodyEn: text("body_en").notNull().default(""),
  cover: text("cover"),
  pinned: integer("pinned").notNull().default(0),
  status: materialStatus("status").notNull().default("draft"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  publishedAt: timestamp("published_at", { withTimezone: true }),
});

/**
 * One-time password reset links. Only a SHA-256 of the token is stored, so a database leak
 * gives nobody a working link; a link dies after an hour, after use, or when a newer one is issued.
 */
export const passwordResets = pgTable(
  "password_resets",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("password_resets_user_idx").on(t.userId)],
);

// ---------- The owner's personal dashboard (home page, visible only to the admin) ----------

/** The owner's deadlines: homework, exams, anything with a due date. */
export const deadlines = pgTable(
  "deadlines",
  {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    note: text("note").notNull().default(""),
    dueAt: timestamp("due_at", { withTimezone: true }).notNull(),
    doneAt: timestamp("done_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("deadlines_due_idx").on(t.dueAt)],
);

export const classKind = pgEnum("class_kind", ["lecture", "practice", "lab", "other"]);
/** "Числитель / знаменатель": classes that happen every week, or only on odd or even weeks. */
export const weekParity = pgEnum("week_parity", ["every", "odd", "even"]);

/** The owner's weekly class timetable. Times are local wall-clock "HH:MM" in the owner's time zone. */
export const timetable = pgTable(
  "timetable",
  {
    id: serial("id").primaryKey(),
    /** ISO weekday: 1 = Monday … 7 = Sunday. */
    weekday: integer("weekday").notNull(),
    starts: text("starts").notNull(),
    ends: text("ends").notNull(),
    title: text("title").notNull(),
    room: text("room").notNull().default(""),
    teacher: text("teacher").notNull().default(""),
    kind: classKind("kind").notNull().default("lecture"),
    parity: weekParity("parity").notNull().default("every"),
  },
  (t) => [index("timetable_day_idx").on(t.weekday, t.starts)],
);

/** Small key → JSON settings of the owner (weather city, semester start, …). */
export const ownerSettings = pgTable("owner_settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
