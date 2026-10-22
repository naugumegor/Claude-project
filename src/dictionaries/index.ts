import { lang } from "next/root-params";
import { notFound } from "next/navigation";
import { hasLocale, type Locale } from "@/lib/i18n";
import ru from "./ru.json";

const dictionaries = {
  ru: () => import("./ru.json").then((m) => m.default),
  en: () => import("./en.json").then((m) => m.default),
};

export type PluralForms = Partial<Record<Intl.LDMLPluralRule, string>> & { other: string };

// English only needs "one"/"other" plural forms, Russian also needs "few"/"many".
export type Dictionary = Omit<typeof ru, "plurals"> & {
  plurals: Record<keyof typeof ru.plurals, PluralForms>;
};

export async function getLocale(): Promise<Locale> {
  const value = await lang();
  if (!hasLocale(value)) notFound();
  return value;
}

export async function getDictionary(): Promise<Dictionary> {
  return dictionaries[await getLocale()]();
}
