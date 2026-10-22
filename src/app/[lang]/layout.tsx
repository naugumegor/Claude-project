import { Suspense } from "react";
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Inter, Manrope } from "next/font/google";
import "katex/dist/katex.min.css";
import "../globals.css";
import { getDictionary, getLocale } from "@/dictionaries";
import { locales } from "@/lib/i18n";
import { alternates, siteUrl } from "@/lib/site";
import { getMaterials } from "@/lib/materials";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { SearchProvider } from "@/components/search";
import { Pomodoro } from "@/components/pomodoro";
import { profileScript, themeScript } from "@/lib/head-scripts";

const inter = Inter({ variable: "--font-inter", subsets: ["latin", "cyrillic"] });
const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin", "cyrillic"] });

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata(): Promise<Metadata> {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  return {
    metadataBase: new URL(siteUrl),
    title: { default: dict.meta.title, template: `%s · ${dict.meta.title}` },
    description: dict.meta.description,
    alternates: alternates(locale),
    openGraph: { siteName: "Ingenium", locale, type: "website" },
    twitter: { card: "summary_large_image" },
  };
}

export default async function RootLayout({ children }: LayoutProps<"/[lang]">) {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  const materials = await getMaterials(locale);
  const searchItems = materials.map((m) => ({
    slug: m.slug,
    type: m.type,
    title: m.title,
    excerpt: m.excerpt,
    subject: m.subjectName,
    tags: m.tags,
  }));

  return (
    // The theme script sets data-theme on <html> before React hydrates.
    <html lang={locale} className={`${inter.variable} ${manrope.variable} antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript + profileScript }} />
      </head>
      <body className="grain flex min-h-dvh flex-col">
        <SearchProvider items={searchItems} locale={locale} dict={dict.search}>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </SearchProvider>
        <Pomodoro labels={dict.pomodoro} />
        {/* Vercel Web Analytics: page views, no cookies. It reads the URL, so it sits in Suspense. */}
        <Suspense fallback={null}>
          <Analytics />
        </Suspense>
      </body>
    </html>
  );
}
