import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import { getDictionary, getLocale, type Dictionary } from "@/dictionaries";
import type { Locale } from "@/lib/i18n";
import { db } from "@/db";
import { userDocuments, users } from "@/db/schema";
import { getAdmin, getUser } from "@/lib/session";
import { formatDate } from "@/lib/format";
import { DocumentViewer } from "@/components/document-viewer";
import { Discussion } from "@/components/discussion/discussion";

// One reader's document: public once approved for the home page, otherwise only its owner
// (and the admin reviewing it) can open it.

export async function generateStaticParams() {
  // Cache Components needs at least one param; documents themselves are read per request.
  return [{ id: "0" }];
}

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: dict.docs.community, robots: { index: false } };
}

export default async function UserDocPage({ params }: PageProps<"/[lang]/docs/[id]">) {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  return (
    <section className="mx-auto max-w-5xl px-4 pt-12 sm:px-6">
      <Suspense fallback={<div className="h-96 animate-pulse rounded-3xl bg-surface-2" />}>
        <Doc params={params} dict={dict} locale={locale} />
      </Suspense>
    </section>
  );
}

async function Doc({ params, dict, locale }: { params: Promise<{ id: string }>; dict: Dictionary; locale: Locale }) {
  // Reading the session first makes this part per-request, before the database is touched.
  const user = await getUser();
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const [row] = await db
    .select({ doc: userDocuments, author: users.name })
    .from(userDocuments)
    .innerJoin(users, eq(userDocuments.userId, users.id))
    .where(eq(userDocuments.id, id))
    .limit(1);
  if (!row) notFound();
  const { doc, author } = row;
  const own = user?.id === doc.userId;
  if (doc.status !== "published" && !own && !(await getAdmin())) notFound();

  return (
    <>
      <Link
        href={own ? `/${locale}/account?tab=docs` : `/${locale}`}
        className="group mb-6 inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-accent"
      >
        <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
        {own ? dict.docs.title : dict.nav.home}
      </Link>
      <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{doc.name}</h1>
      <p className="mt-2 text-sm text-muted">
        {dict.docs.by} {author} · {formatDate((doc.publishedAt ?? doc.createdAt).toISOString(), locale)}
        {doc.status !== "published" && ` · ${dict.docs.status[doc.status]}`}
      </p>
      {doc.description && <p className="mt-3 max-w-3xl">{doc.description}</p>}
      <div className="mt-8">
        <DocumentViewer
          files={[{ id: doc.id, url: doc.url, name: doc.name, kind: doc.kind, size: doc.size }]}
          labels={{ openFull: dict.materials.openFull, download: dict.materials.download }}
          locale={locale}
          base="/api/user-files/"
        />
      </div>
      {doc.status === "published" && (
        <div className="mx-auto max-w-3xl">
          <Discussion target={{ type: "doc", id: doc.id }} path={`/${locale}/docs/${doc.id}`} locale={locale} dict={dict.discussion} />
        </div>
      )}
    </>
  );
}
