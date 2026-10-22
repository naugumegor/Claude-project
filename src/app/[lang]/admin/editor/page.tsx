import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { getDictionary, getLocale, type Dictionary } from "@/dictionaries";
import type { Locale } from "@/lib/i18n";
import { loadMaterials, loadSubjects } from "@/db/queries";
import { getAdmin } from "@/lib/session";
import { AdminSkeleton, LoginCard } from "@/components/admin/login-card";
import { MaterialForm } from "@/components/admin/material-form";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: dict.admin.edit, robots: { index: false } };
}

export default async function EditorPage({ searchParams }: PageProps<"/[lang]/admin/editor">) {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  return (
    <section className="mx-auto max-w-4xl px-4 pt-10 sm:px-6">
      <Link
        href={`/${locale}/admin`}
        className="group inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-accent"
      >
        <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
        {dict.admin.back}
      </Link>
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
  const id = Number((await searchParams).id) || undefined;
  if (!(await getAdmin())) {
    return <LoginCard dict={dict.admin} next={`/${locale}/admin/editor${id ? `?id=${id}` : ""}`} />;
  }

  const [subjectRows, found] = await Promise.all([
    loadSubjects(),
    id ? loadMaterials({ id }) : Promise.resolve([]),
  ]);
  const material = found[0] ?? null;
  if (id && !material) notFound();

  return (
    <MaterialForm
      key={material?.id ?? "new"}
      locale={locale}
      material={material}
      subjects={subjectRows.map((s) => ({ id: s.id, slug: s.slug, name: locale === "ru" ? s.nameRu : s.nameEn }))}
      dict={dict.admin}
      typeNames={dict.types}
      langNames={dict.langNames}
    />
  );
}
