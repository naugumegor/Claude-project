import { Suspense } from "react";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getDictionary, getLocale, type Dictionary } from "@/dictionaries";
import type { Locale } from "@/lib/i18n";
import { getUser, safeNext } from "@/lib/session";
import { AuthForm } from "@/components/account/auth-form";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: dict.auth.signIn, robots: { index: false } };
}

export default async function LoginPage({ searchParams }: PageProps<"/[lang]/login">) {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  return (
    <section className="mx-auto max-w-md px-4 pt-14 sm:pt-20">
      {/* ?next= and the session cookie are request-time, so the form streams in. */}
      <Suspense fallback={<div className="h-[30rem] animate-pulse rounded-3xl bg-surface-2" />}>
        <Login dict={dict} locale={locale} searchParams={searchParams} />
      </Suspense>
    </section>
  );
}

async function Login({
  dict,
  locale,
  searchParams,
}: {
  dict: Dictionary;
  locale: Locale;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const next = safeNext(typeof params.next === "string" ? params.next : null, `/${locale}/account`);
  if (await getUser()) redirect(next);

  return (
    <AuthForm
      dict={dict.auth}
      locale={locale}
      next={next}
      initialMode={params.mode === "signup" ? "signup" : "signin"}
      initialError={params.error === "github" ? "github" : undefined}
    />
  );
}
