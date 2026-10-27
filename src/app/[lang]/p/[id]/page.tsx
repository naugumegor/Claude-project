import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { ArrowLeft, Download, FileText } from "lucide-react";
import { getDictionary, getLocale, type Dictionary } from "@/dictionaries";
import type { Locale } from "@/lib/i18n";
import { db } from "@/db";
import { pastes, users } from "@/db/schema";
import { getUser } from "@/lib/session";
import { formatDate } from "@/lib/format";
import { CodeView } from "@/components/code-view";
import { CopyButton } from "@/components/share/copy-button";

// A paste: anyone with the link can read it, nobody can list them. Expired ones are gone.

export async function generateStaticParams() {
  // Cache Components needs at least one param; pastes themselves are read per request.
  return [{ id: "0" }];
}

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: dict.share.pasteTitle, robots: { index: false, follow: false } };
}

export default async function PastePage({ params }: PageProps<"/[lang]/p/[id]">) {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  return (
    <section className="mx-auto max-w-5xl px-4 pt-12 sm:px-6">
      <Suspense fallback={<div className="h-96 animate-pulse rounded-3xl bg-surface-2" />}>
        <Paste params={params} dict={dict} locale={locale} />
      </Suspense>
    </section>
  );
}

async function Paste({ params, dict, locale }: { params: Promise<{ id: string }>; dict: Dictionary; locale: Locale }) {
  // Reading the session first makes this part per-request, before the database is touched.
  const user = await getUser();
  const id = (await params).id.toLowerCase();
  const [row] = await db
    .select({ paste: pastes, author: users.name })
    .from(pastes)
    .innerJoin(users, eq(pastes.userId, users.id))
    .where(eq(pastes.id, id))
    .limit(1);
  if (!row || (row.paste.expiresAt && row.paste.expiresAt < new Date())) notFound();
  const { paste, author } = row;
  const t = dict.share;
  const raw = `/api/pastes/${paste.id}/raw`;

  return (
    <>
      {user?.id === paste.userId && (
        <Link
          href={`/${locale}/account?tab=share`}
          className="group mb-6 inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-accent"
        >
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
          {t.back}
        </Link>
      )}
      <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{paste.title || t.untitled}</h1>
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted">
        <span>
          {t.by} {author} · {formatDate(paste.createdAt.toISOString(), locale)}
        </span>
        <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-semibold text-accent">
          {paste.language === "auto" ? t.auto : paste.language}
        </span>
        {paste.expiresAt && (
          <span className="rounded-full bg-ochre-soft px-2.5 py-0.5 text-xs font-semibold text-ochre">
            {t.expires} {paste.expiresAt.toLocaleString(locale, { dateStyle: "short", timeStyle: "short", timeZone: "UTC" })} UTC
          </span>
        )}
        <span className="ml-auto flex items-center gap-1">
          <CopyButton text={paste.body} label={t.copy} done={t.copied} />
          <a href={raw} className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs text-muted transition-colors hover:bg-accent-soft hover:text-accent">
            <FileText size={14} />
            {t.raw}
          </a>
          <a href={`${raw}?download`} className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs text-muted transition-colors hover:bg-accent-soft hover:text-accent">
            <Download size={14} />
            {t.download}
          </a>
        </span>
      </div>
      <div className="mt-6">
        <CodeView code={paste.body} language={paste.language} />
      </div>
    </>
  );
}
