import type { Metadata } from "next";
import { getDictionary, getLocale } from "@/dictionaries";
import { alternates } from "@/lib/site";
import { GLOSSARY } from "@/lib/glossary";
import { Reveal } from "@/components/reveal";
import { GlossaryList } from "@/components/glossary-list";

export async function generateMetadata(): Promise<Metadata> {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  return { title: dict.glossary.title, description: dict.glossary.lead, alternates: alternates(locale, "/glossary") };
}

export default async function GlossaryPage() {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  return (
    <div className="mx-auto max-w-4xl px-4 pt-14 sm:px-6">
      <Reveal>
        <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">{dict.glossary.title}</h1>
        <p className="mt-3 max-w-3xl text-muted">{dict.glossary.lead}</p>
      </Reveal>
      <GlossaryList terms={GLOSSARY} locale={locale} labels={dict.glossary} />
    </div>
  );
}
