import Link from "next/link";
import { LogIn } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { getUser } from "@/lib/session";

/** Header entry: the user's initial when signed in, a "Sign in" button otherwise. Reads the cookie, so render it inside <Suspense>. */
export async function AccountButton({
  locale,
  labels,
}: {
  locale: Locale;
  labels: { login: string; account: string };
}) {
  const user = await getUser();
  if (user) {
    return (
      <Link
        href={`/${locale}/account`}
        aria-label={labels.account}
        title={user.name}
        className="group flex size-10 items-center justify-center rounded-xl bg-accent font-display text-base font-extrabold text-accent-ink shadow-[0_6px_16px_-8px_var(--accent)] transition-transform duration-300 hover:-translate-y-0.5 hover:rotate-6"
      >
        {(user.name || "?").charAt(0).toUpperCase()}
      </Link>
    );
  }
  return (
    <Link
      href={`/${locale}/login`}
      className="group flex h-10 items-center gap-2 rounded-xl border border-line bg-surface px-3 text-sm font-medium text-muted transition-[color,border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-accent hover:text-accent hover:shadow-[0_6px_18px_-8px_var(--accent)]"
    >
      <LogIn size={17} className="transition-transform group-hover:translate-x-0.5" />
      <span className="hidden md:inline">{labels.login}</span>
    </Link>
  );
}

export function AccountButtonSkeleton() {
  return <span className="block size-10 animate-pulse rounded-xl bg-surface-2" />;
}
