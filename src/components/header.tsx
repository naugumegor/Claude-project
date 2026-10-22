import { Suspense } from "react";
import { getDictionary, getLocale } from "@/dictionaries";
import { AccountButton, AccountButtonSkeleton } from "./account/account-button";
import { HeaderSearchButton } from "./search";
import { LangSwitch, NavLinks } from "./header-nav";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";

export async function Header() {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-bg/75 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Logo href={`/${locale}`} />
        <div className="hidden sm:block">
          <NavLinks
            id="desktop"
            locale={locale}
            links={[
              { href: "", label: dict.nav.home },
              { href: "/materials", label: dict.nav.materials },
            ]}
          />
        </div>
        <span
          className="hidden items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-muted/70 md:flex"
          title={dict.footer.shop}
        >
          {dict.nav.shop}
          <span className="rounded-full bg-ochre-soft px-1.5 py-px text-[10px] font-semibold uppercase text-ochre">
            {dict.nav.soon}
          </span>
        </span>
        <div className="ml-auto flex items-center gap-2">
          <HeaderSearchButton label={dict.search.placeholder} />
          <LangSwitch locale={locale} />
          <ThemeToggle labels={dict.theme} />
          {/* Who is signed in is only known per request; the rest of the header stays static. */}
          <Suspense fallback={<AccountButtonSkeleton />}>
            <AccountButton locale={locale} labels={{ login: dict.nav.login, account: dict.nav.account }} />
          </Suspense>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 pb-2 sm:hidden">
        <NavLinks
          id="mobile"
          locale={locale}
          links={[
            { href: "", label: dict.nav.home },
            { href: "/materials", label: dict.nav.materials },
          ]}
        />
      </div>
    </header>
  );
}
