import Link from "next/link";
import { getDictionary, getLocale } from "@/dictionaries";

export default async function NotFound() {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  return (
    <section className="mx-auto flex max-w-xl flex-col items-center px-4 py-32 text-center">
      <p className="font-display text-7xl font-extrabold text-accent">404</p>
      <h1 className="mt-4 font-display text-2xl font-bold">{dict.notFound.title}</h1>
      <p className="mt-2 text-muted">{dict.notFound.text}</p>
      <Link
        href={`/${locale}`}
        className="mt-8 rounded-xl bg-accent px-5 py-2.5 font-medium text-accent-ink transition-transform hover:-translate-y-0.5"
      >
        {dict.notFound.home}
      </Link>
    </section>
  );
}
