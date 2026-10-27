import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { ExternalLink, Link2Off, ShieldAlert } from "lucide-react";
import { getDictionary, getLocale, type Dictionary } from "@/dictionaries";
import type { Locale } from "@/lib/i18n";
import { db } from "@/db";
import { shortLinks, users } from "@/db/schema";
import { getUser } from "@/lib/session";
import { checkLinkUrl } from "@/lib/share";

// Where /s/<code> sends readers' links: shows the real address and lets the visitor decide.

export async function generateStaticParams() {
  return [{ code: "0" }];
}

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: dict.share.leaving, robots: { index: false, follow: false } };
}

export default async function LeavingPage({ params }: PageProps<"/[lang]/go/[code]">) {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  return (
    <section className="mx-auto max-w-2xl px-4 pt-20 sm:px-6">
      <Suspense fallback={<div className="h-64 animate-pulse rounded-3xl bg-surface-2" />}>
        <Leaving params={params} dict={dict} locale={locale} />
      </Suspense>
    </section>
  );
}

async function Leaving({ params, dict, locale }: { params: Promise<{ code: string }>; dict: Dictionary; locale: Locale }) {
  await getUser(); // per-request from here on
  const code = (await params).code.toLowerCase();
  const [row] = await db
    .select({ url: shortLinks.url, author: users.name })
    .from(shortLinks)
    .innerJoin(users, eq(shortLinks.userId, users.id))
    .where(eq(shortLinks.code, code))
    .limit(1);
  const checked = row ? checkLinkUrl(row.url) : null;
  const t = dict.share;

  if (!row || !checked || "error" in checked) {
    return (
      <div className="rounded-3xl border border-line bg-surface p-8 text-center">
        <Link2Off size={32} className="mx-auto text-muted" />
        <h1 className="mt-4 font-display text-2xl font-extrabold tracking-tight">{t.missing}</h1>
        <p className="mt-2 text-muted">{t.missingLead}</p>
        <Link href={`/${locale}`} className="mt-6 inline-block rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-accent-ink transition-transform hover:-translate-y-0.5">
          {t.home}
        </Link>
      </div>
    );
  }

  const url = new URL(checked.url);
  return (
    <div className="rounded-3xl border border-line bg-surface p-8">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-ochre-soft text-ochre">
        <ShieldAlert size={24} />
      </span>
      <h1 className="mt-4 font-display text-2xl font-extrabold tracking-tight">{t.leaving}</h1>
      <p className="mt-2 text-muted">{t.leavingLead}</p>
      <p className="mt-4 break-all rounded-xl bg-surface-2 px-4 py-3 font-mono text-sm">
        <span className="font-bold text-ink">{url.host}</span>
        <span className="text-muted">{url.href.slice(url.origin.length)}</span>
      </p>
      <p className="mt-3 text-xs text-muted">
        {t.by}: {row.author}
      </p>
      <div className="mt-6 flex flex-wrap gap-2">
        <a
          href={checked.url}
          rel="noopener noreferrer nofollow"
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-accent-ink transition-transform hover:-translate-y-0.5"
        >
          <ExternalLink size={16} />
          {t.go}
        </a>
        <Link href={`/${locale}`} className="rounded-xl border border-line px-4 py-2.5 text-sm text-muted transition-colors hover:text-ink">
          {t.home}
        </Link>
      </div>
    </div>
  );
}
