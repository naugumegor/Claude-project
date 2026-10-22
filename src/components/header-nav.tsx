"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import type { Locale } from "@/lib/i18n";
import { locales } from "@/lib/i18n";

const spring = { type: "spring", stiffness: 420, damping: 34 } as const;

export function NavLinks({
  id,
  locale,
  links,
}: {
  id: string;
  locale: Locale;
  links: { href: string; label: string; for?: string }[];
}) {
  const pathname = usePathname();
  return (
    <nav className="flex items-center gap-1 overflow-x-auto">
      {links.map((link) => {
        const href = `/${locale}${link.href}`;
        const active =
          link.href === "" ? pathname === `/${locale}` : pathname.startsWith(href);
        return (
          <Link
            key={link.href}
            href={href}
            data-for={link.for}
            className={`relative shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              active ? "text-ink" : "text-muted hover:text-ink"
            }`}
          >
            {active && (
              <motion.span
                layoutId={`nav-pill-${id}`}
                transition={spring}
                className="absolute inset-0 rounded-lg bg-surface-2"
              />
            )}
            <span className="relative">{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

/** RU / EN toggle that keeps you on the same page. */
export function LangSwitch({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const rest = pathname.split("/").slice(2).join("/");
  return (
    <div className="flex rounded-xl border border-line bg-surface p-1">
      {locales.map((l) => (
        <Link
          key={l}
          href={`/${l}${rest ? `/${rest}` : ""}`}
          hrefLang={l}
          className={`relative rounded-lg px-2.5 py-1 text-xs font-semibold uppercase tracking-wide transition-colors ${
            l === locale ? "text-accent-ink" : "text-muted hover:text-ink"
          }`}
        >
          {l === locale && (
            <motion.span
              layoutId="lang-pill"
              transition={spring}
              className="absolute inset-0 rounded-lg bg-accent"
            />
          )}
          <span className="relative">{l}</span>
        </Link>
      ))}
    </div>
  );
}
