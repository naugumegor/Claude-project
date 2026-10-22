import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { desc, eq } from "drizzle-orm";
import { LogOut, Settings2 } from "lucide-react";
import { getDictionary, getLocale, type Dictionary } from "@/dictionaries";
import type { Locale } from "@/lib/i18n";
import { db } from "@/db";
import { favorites, userDocuments, users } from "@/db/schema";
import { getMaterials } from "@/lib/materials";
import { cardLabels, formatDate } from "@/lib/format";
import { getAdmin, getUser } from "@/lib/session";
import { MaterialCard } from "@/components/material-card";
import { Reveal } from "@/components/reveal";
import { ProfileForms } from "@/components/account/profile-forms";
import { GithubMark } from "@/components/account/auth-form";
import { AccountTabs } from "@/components/account/account-tabs";
import { MyDocuments } from "@/components/account/my-documents";
import { signOut } from "./actions";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: dict.account.title, robots: { index: false } };
}

export default async function AccountPage({ searchParams }: PageProps<"/[lang]/account">) {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  return (
    <section className="mx-auto max-w-6xl px-4 pt-12 sm:px-6">
      <Suspense fallback={<div className="h-64 animate-pulse rounded-3xl bg-surface-2" />}>
        <Account dict={dict} locale={locale} searchParams={searchParams} />
      </Suspense>
    </section>
  );
}

async function Account({
  dict,
  locale,
  searchParams,
}: {
  dict: Dictionary;
  locale: Locale;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const tab = String((await searchParams).tab ?? "");
  const session = await getUser();
  if (!session) redirect(`/${locale}/login?next=/${locale}/account`);

  const [[user], favRows, admin, docRows] = await Promise.all([
    db.select().from(users).where(eq(users.id, session.id)).limit(1),
    db
      .select({ materialId: favorites.materialId })
      .from(favorites)
      .where(eq(favorites.userId, session.id))
      .orderBy(desc(favorites.createdAt)),
    getAdmin(),
    db.select().from(userDocuments).where(eq(userDocuments.userId, session.id)).orderBy(desc(userDocuments.createdAt)),
  ]);

  const logout = (
    <form action={signOut}>
      <input type="hidden" name="next" value={`/${locale}`} />
      <button className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-muted transition-colors hover:border-rose hover:text-rose">
        <LogOut size={16} />
        {dict.account.logout}
      </button>
    </form>
  );
  // The cookie outlived its account (e.g. deleted by hand): only offer to sign out.
  if (!user) return <div className="flex justify-center py-20">{logout}</div>;

  const all = await getMaterials(locale);
  const saved = favRows
    .map((f) => all.find((m) => m.id === f.materialId))
    .filter((m) => m !== undefined);
  const labels = cardLabels(saved, dict, locale);

  return (
    <>
      <Reveal>
        <div className="flex flex-wrap items-center gap-5">
          <span className="flex size-16 items-center justify-center rounded-2xl bg-accent font-display text-3xl font-extrabold text-accent-ink shadow-[0_14px_30px_-14px_var(--accent)]">
            {(user.name || user.email || "?").charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              {dict.account.hello}, {user.name}
            </h1>
            <p className="mt-1 flex flex-wrap items-center gap-x-3 text-sm text-muted">
              {user.email && <span>{user.email}</span>}
              {user.githubLogin && (
                <span className="inline-flex items-center gap-1">
                  <GithubMark className="size-3.5" /> @{user.githubLogin}
                </span>
              )}
              <span>
                {dict.account.since} {formatDate(user.createdAt.toISOString(), locale)}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            {admin && (
              <Link
                href={`/${locale}/admin`}
                className="inline-flex items-center gap-2 rounded-xl bg-ink px-3 py-2.5 text-sm font-medium text-bg transition-transform hover:-translate-y-0.5"
              >
                <Settings2 size={16} />
                {dict.account.admin}
              </Link>
            )}
            {logout}
          </div>
        </div>
      </Reveal>

      <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_20rem]">
        <AccountTabs
          initial={tab}
          tabs={[
            {
              id: "favorites",
              label: dict.account.favorites,
              count: saved.length,
              content:
                saved.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-line px-6 py-12 text-center">
                    <p className="text-muted">{dict.account.noFavorites}</p>
                    <Link
                      href={`/${locale}/materials`}
                      className="mt-5 inline-block rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-accent-ink transition-transform hover:-translate-y-0.5"
                    >
                      {dict.account.browse}
                    </Link>
                  </div>
                ) : (
                  <div className="grid gap-5 sm:grid-cols-2">
                    {saved.map((m, i) => (
                      <MaterialCard key={m.slug} material={m} locale={locale} labels={labels[m.slug]} index={i} />
                    ))}
                  </div>
                ),
            },
            {
              id: "docs",
              label: dict.docs.title,
              count: docRows.length,
              content: (
                <MyDocuments
                  docs={docRows.map((d) => ({
                    id: d.id,
                    name: d.name,
                    description: d.description,
                    kind: d.kind,
                    size: d.size,
                    status: d.status,
                    createdAt: d.createdAt.toISOString(),
                  }))}
                  labels={dict.docs}
                  locale={locale}
                  userId={user.id}
                  directUpload={Boolean(process.env.BLOB_READ_WRITE_TOKEN)}
                />
              ),
            },
          ]}
        />

        <aside>
          <ProfileForms
            dict={dict.account}
            errors={dict.auth.errors}
            labels={{ name: dict.auth.name, email: dict.auth.email }}
            name={user.name}
            hasPassword={Boolean(user.passwordHash)}
            viaGithub={Boolean(user.githubLogin)}
          />
        </aside>
      </div>
    </>
  );
}
