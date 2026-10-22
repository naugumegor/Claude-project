import Link from "next/link";
import type { Metadata } from "next";
import { ShieldX } from "lucide-react";
import { getDictionary, getLocale } from "@/dictionaries";

export const metadata: Metadata = { robots: { index: false } };

export default async function DeniedPage() {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  return (
    <section className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <ShieldX size={48} className="text-rose" />
      <h1 className="mt-4 font-display text-2xl font-bold">{dict.admin.denied}</h1>
      <p className="mt-2 text-muted">{dict.admin.deniedText}</p>
      <Link
        href={`/${locale}`}
        className="mt-8 rounded-xl bg-accent px-5 py-2.5 font-medium text-accent-ink transition-transform hover:-translate-y-0.5"
      >
        {dict.notFound.home}
      </Link>
    </section>
  );
}
