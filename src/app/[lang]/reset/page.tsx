import { Suspense } from "react";
import type { Metadata } from "next";
import { getDictionary, getLocale, type Dictionary } from "@/dictionaries";
import type { Locale } from "@/lib/i18n";
import { peekResetToken } from "@/lib/password-reset";
import { DeadLink, ForgotForm, NewPasswordForm } from "@/components/account/reset-forms";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  // The token is in the URL: keep the page out of search engines and out of Referer headers.
  return { title: dict.auth.reset.title, robots: { index: false }, referrer: "no-referrer" };
}

export default async function ResetPage({ searchParams }: PageProps<"/[lang]/reset">) {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  return (
    <section className="mx-auto max-w-md px-4 pt-14 sm:pt-20">
      <Suspense fallback={<div className="h-80 animate-pulse rounded-3xl bg-surface-2" />}>
        <Reset dict={dict} locale={locale} searchParams={searchParams} />
      </Suspense>
    </section>
  );
}

async function Reset({
  dict,
  locale,
  searchParams,
}: {
  dict: Dictionary;
  locale: Locale;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token.slice(0, 100) : "";
  if (!token) return <ForgotForm dict={dict.auth} locale={locale} />;
  if (!(await peekResetToken(token))) return <DeadLink dict={dict.auth} locale={locale} />;
  return <NewPasswordForm dict={dict.auth} locale={locale} token={token} />;
}
