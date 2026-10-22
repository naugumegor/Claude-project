import { Suspense } from "react";
import { getDictionary, getLocale } from "@/dictionaries";
import { AccountButton, AccountButtonSkeleton } from "./account/account-button";
import { HeaderSearchButton } from "./search";
import { LangSwitch, NavLinks } from "./header-nav";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";
import { ProfileSwitch } from "./profile-switch";

export async function Header() {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  const links = [
    { href: "", label: dict.nav.home },
    { href: "/materials", label: dict.nav.materials },
    { href: "/reference", label: dict.nav.reference, for: "engineering" },
    { href: "/tools", label: dict.nav.tools },
    { href: "/news", label: dict.nav.news },
  ];
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-bg/75 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Logo href={`/${locale}`} />
        <div className="hidden min-w-0 xl:block">
          {/* The logo already leads home, so the wide row skips "Главная". */}
          <NavLinks id="desktop" locale={locale} links={links.slice(1)} />
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="hidden xl:block">
            <ProfileSwitch id="desktop" labels={dict.profile} />
          </div>
          <HeaderSearchButton label={dict.search.placeholder} />
          <LangSwitch locale={locale} />
          <ThemeToggle labels={dict.theme} />
          {/* Who is signed in is only known per request; the rest of the header stays static. */}
          <Suspense fallback={<AccountButtonSkeleton />}>
            <AccountButton locale={locale} labels={{ login: dict.nav.login, account: dict.nav.account }} />
          </Suspense>
        </div>
      </div>
      {/* Below 1280px: a second row where links scroll sideways and the profile switch sits next to them. */}
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 pb-2 sm:px-6 xl:hidden">
        <div className="min-w-0 flex-1">
          <NavLinks id="mobile" locale={locale} links={links} />
        </div>
        <ProfileSwitch id="mobile" labels={dict.profile} />
      </div>
    </header>
  );
}
