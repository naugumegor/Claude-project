import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { desc, eq, inArray } from "drizzle-orm";
import { ExternalLink, LogOut, Megaphone, Pencil, Pin, Plus } from "lucide-react";
import { getDictionary, getLocale, type Dictionary } from "@/dictionaries";
import type { Locale } from "@/lib/i18n";
import { loadMaterials } from "@/db/queries";
import { db } from "@/db";
import { news, userDocuments, users } from "@/db/schema";
import { DocReview } from "@/components/admin/doc-review";
import { UserList } from "@/components/admin/user-list";
import { localize } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { getAdmin, getUser } from "@/lib/session";
import { typeMeta } from "@/components/type-meta";
import { AdminSkeleton, LoginCard } from "@/components/admin/login-card";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: dict.admin.title, robots: { index: false } };
}

export default async function AdminPage() {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  return (
    <section className="mx-auto max-w-5xl px-4 pt-12 sm:px-6">
      {/* The session cookie is only known per request, so this part streams in. */}
      <Suspense fallback={<AdminSkeleton />}>
        <AdminList dict={dict} locale={locale} />
      </Suspense>
    </section>
  );
}

async function AdminList({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  const [admin, user] = await Promise.all([getAdmin(), getUser()]);
  if (!admin) return <LoginCard dict={dict.admin} next={`/${locale}/admin`} denied={Boolean(user)} />;

  const [materialRows, newsRows, docRows, userRows] = await Promise.all([
    loadMaterials({}),
    db.select().from(news).orderBy(desc(news.pinned), desc(news.createdAt)),
    db
      .select({ doc: userDocuments, author: users.name })
      .from(userDocuments)
      .innerJoin(users, eq(userDocuments.userId, users.id))
      .where(inArray(userDocuments.status, ["pending", "published"]))
      .orderBy(desc(userDocuments.createdAt)),
    db
      .select({ id: users.id, name: users.name, email: users.email, githubLogin: users.githubLogin, createdAt: users.createdAt })
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(200),
  ]);
  const rows = materialRows.map((m) => localize(m, locale));
  const docs = docRows.map(({ doc, author }) => ({
    id: doc.id,
    name: doc.name,
    description: doc.description,
    author,
    kind: doc.kind,
    status: doc.status,
  }));
  const reviewLabels = {
    approve: dict.admin.approve,
    reject: dict.admin.reject,
    unpublish: dict.admin.unpublish,
    view: dict.admin.view,
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">{dict.admin.title}</h1>
          <p className="text-sm text-muted">@{admin}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/${locale}/admin/news`}
            className="group inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-4 py-2.5 font-medium transition-transform hover:-translate-y-0.5 hover:border-ochre"
          >
            <Megaphone size={18} className="text-ochre transition-transform group-hover:-rotate-12" />
            {dict.admin.newNews}
          </Link>
          <Link
            href={`/${locale}/admin/editor`}
            className="group inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 font-medium text-accent-ink shadow-[0_8px_20px_-10px_var(--accent)] transition-transform hover:-translate-y-0.5"
          >
            <Plus size={18} className="transition-transform duration-300 group-hover:rotate-90" />
            {dict.admin.new}
          </Link>
          <form action="/api/auth/logout" method="post">
            <button
              className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-muted transition-colors hover:text-ink"
              aria-label={dict.admin.logout}
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">{dict.admin.logout}</span>
            </button>
          </form>
        </div>
      </div>

      <h2 className="mb-3 mt-10 font-display text-xl font-bold">
        {dict.admin.review}{" "}
        <span className="text-base font-medium text-muted">{docs.filter((d) => d.status === "pending").length}</span>
      </h2>
      {docs.some((d) => d.status === "pending") ? (
        <DocReview rows={docs.filter((d) => d.status === "pending")} locale={locale} labels={reviewLabels} />
      ) : (
        <p className="text-sm text-muted">{dict.admin.reviewEmpty}</p>
      )}
      {docs.some((d) => d.status === "published") && (
        <>
          <h3 className="mb-2 mt-6 text-sm font-semibold text-muted">{dict.admin.published}</h3>
          <DocReview rows={docs.filter((d) => d.status === "published")} locale={locale} labels={reviewLabels} />
        </>
      )}

      <h2 className="mb-3 mt-10 font-display text-xl font-bold">{dict.admin.news}</h2>
      {newsRows.length === 0 ? (
        <p className="text-sm text-muted">{dict.admin.noNews}</p>
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
          {newsRows.map((n) => (
            <li key={n.id} className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-2/60">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-ochre-soft text-ochre transition-transform group-hover:scale-110">
                {n.pinned ? <Pin size={16} /> : <Megaphone size={16} />}
              </span>
              <Link href={`/${locale}/admin/news?id=${n.id}`} className="min-w-0 flex-1">
                <span className="block truncate font-medium">{n.titleRu}</span>
                <span className="block truncate text-xs text-muted">
                  {formatDate((n.publishedAt ?? n.createdAt).toISOString(), locale)}
                </span>
              </Link>
              <span
                className={`hidden rounded-full px-2.5 py-0.5 text-xs font-semibold sm:inline ${
                  n.status === "published" ? "bg-accent-soft text-accent" : "bg-ochre-soft text-ochre"
                }`}
              >
                {dict.admin.status[n.status]}
              </span>
              {n.status === "published" && (
                <Link href={`/${locale}/news/${n.slug}`} aria-label={dict.admin.view} className="rounded-lg p-2 text-muted transition-colors hover:text-accent">
                  <ExternalLink size={16} />
                </Link>
              )}
            </li>
          ))}
        </ul>
      )}

      <h2 className="mb-3 mt-10 font-display text-xl font-bold">
        {dict.admin.users} <span className="text-base font-medium text-muted">{userRows.length}</span>
      </h2>
      {userRows.length === 0 ? (
        <p className="text-sm text-muted">{dict.admin.noUsers}</p>
      ) : (
        <UserList
          locale={locale}
          labels={{ resetLink: dict.admin.resetLink, copied: dict.admin.copied, noPassword: dict.admin.noPassword }}
          rows={userRows.map((u) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            github: u.githubLogin,
            created: formatDate(u.createdAt.toISOString(), locale),
          }))}
        />
      )}

      <h2 className="mb-3 mt-10 font-display text-xl font-bold">{dict.admin.materials}</h2>
      {rows.length === 0 ? (
        <p className="mt-16 text-center text-muted">{dict.admin.empty}</p>
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
          {rows.map((m) => {
            const meta = typeMeta[m.type];
            const Icon = meta.icon;
            return (
              <li key={m.id} className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-2/60">
                <span
                  className={`flex size-9 shrink-0 items-center justify-center rounded-lg transition-transform group-hover:scale-110 ${meta.soft} ${meta.tone}`}
                >
                  <Icon size={17} />
                </span>
                <Link href={`/${locale}/admin/editor?id=${m.id}`} className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{m.title}</span>
                  <span className="block truncate text-xs text-muted">
                    {m.subjectName} · {dict.admin.updated} {formatDate(m.createdAt, locale)}
                  </span>
                </Link>
                <span
                  className={`hidden rounded-full px-2.5 py-0.5 text-xs font-semibold sm:inline ${
                    m.status === "published" ? "bg-accent-soft text-accent" : "bg-ochre-soft text-ochre"
                  }`}
                >
                  {dict.admin.status[m.status]}
                </span>
                {m.status === "published" && (
                  <Link
                    href={`/${locale}/materials/${m.slug}`}
                    aria-label={dict.admin.view}
                    className="rounded-lg p-2 text-muted transition-colors hover:text-accent"
                  >
                    <ExternalLink size={16} />
                  </Link>
                )}
                <Link
                  href={`/${locale}/admin/editor?id=${m.id}`}
                  aria-label={dict.admin.edit}
                  className="rounded-lg p-2 text-muted transition-colors hover:text-accent"
                >
                  <Pencil size={16} />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
