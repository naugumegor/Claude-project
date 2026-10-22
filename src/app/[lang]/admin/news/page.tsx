import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import { getDictionary, getLocale, type Dictionary } from "@/dictionaries";
import type { Locale } from "@/lib/i18n";
import { db } from "@/db";
import { news } from "@/db/schema";
import { getAdmin, getUser } from "@/lib/session";
import { AdminSkeleton, LoginCard } from "@/components/admin/login-card";
import { NewsForm } from "@/components/admin/news-form";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: dict.admin.news, robots: { index: false } };
}

export default async function NewsEditorPage({ searchParams }: PageProps<"/[lang]/admin/news">) {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  return (
    <section className="mx-auto max-w-4xl px-4 pt-12 sm:px-6">
      <Suspense fallback={<AdminSkeleton />}>
        <Editor dict={dict} locale={locale} searchParams={searchParams} />
      </Suspense>
    </section>
  );
}

async function Editor({
  dict,
  locale,
  searchParams,
}: {
  dict: Dictionary;
  locale: Locale;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [admin, user] = await Promise.all([getAdmin(), getUser()]);
  if (!admin) return <LoginCard dict={dict.admin} next={`/${locale}/admin/news`} denied={Boolean(user)} />;
  const id = Number((await searchParams).id);
  const [row] = Number.isInteger(id) && id > 0 ? await db.select().from(news).where(eq(news.id, id)).limit(1) : [];
  if (id && !row) notFound();

  return (
    <>
      <Link
        href={`/${locale}/admin`}
        className="group mb-6 inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-accent"
      >
        <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
        {dict.admin.newsForm.back}
      </Link>
      <h1 className="mb-6 font-display text-3xl font-extrabold tracking-tight">
        {row ? row.titleRu : dict.admin.newNews}
      </h1>
      <NewsForm
        key={row?.id ?? "new"}
        locale={locale}
        labels={dict.admin.newsForm}
        initial={{
          id: row?.id,
          titleRu: row?.titleRu ?? "",
          titleEn: row?.titleEn ?? "",
          bodyRu: row?.bodyRu ?? "",
          bodyEn: row?.bodyEn ?? "",
          cover: row?.cover ?? "",
          pinned: Boolean(row?.pinned),
          published: row ? row.status === "published" : true,
        }}
      />
    </>
  );
}
