import { hasLocale } from "@/lib/i18n";
import { ogSize, renderOg } from "@/lib/og";
import ru from "@/dictionaries/ru.json";
import en from "@/dictionaries/en.json";

export const size = ogSize;
export const contentType = "image/png";
export const alt = "Ingenium";

export default async function Image({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dict = hasLocale(lang) && lang === "en" ? en : ru;
  return renderOg({ title: dict.home.title, subtitle: dict.home.lead, badge: dict.home.eyebrow });
}
