import Link from "next/link";
import { getDictionary, getLocale } from "@/dictionaries";

export async function Footer() {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-muted sm:flex-row sm:justify-between sm:px-6">
        <p>
          <span className="font-display font-bold text-ink">Ingenium</span> · {dict.footer.made}
        </p>
        <p className="flex gap-4">
          <span>{dict.footer.shop}</span>
          <Link href={`/${locale}/admin`} className="transition-colors hover:text-accent">
            {dict.footer.admin}
          </Link>
        </p>
      </div>
    </footer>
  );
}
