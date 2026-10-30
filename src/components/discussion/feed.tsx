import Link from "next/link";
import type { Dictionary } from "@/dictionaries";
import type { Locale } from "@/lib/i18n";
import { getRecentComments } from "@/lib/discussion";
import { excerpt } from "@/lib/community";
import { Reveal } from "@/components/reveal";
import { TimeAgo } from "./time-ago";

const AVATAR_TONES = ["bg-ochre", "bg-plum", "bg-rose", "bg-accent"];

/** "Обсуждают сейчас" on the home page: the latest published comments, cached until one changes. */
export async function DiscussionFeed({ locale, dict }: { locale: Locale; dict: Dictionary["discussion"] }) {
  const items = await getRecentComments(locale, 6);
  if (items.length === 0) return null;
  return (
    <section className="mx-auto mt-16 max-w-6xl px-4 sm:px-6">
      <h2 className="flex items-center gap-2.5 font-display text-2xl font-bold tracking-tight">
        <span className="relative flex size-2.5">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-60 motion-reduce:animate-none" />
          <span className="relative inline-flex size-2.5 rounded-full bg-accent" />
        </span>
        {dict.feedTitle}
      </h2>
      <ul className="mt-6 grid gap-3 md:grid-cols-2">
        {items.map((c, i) => (
          <li key={c.id}>
            <Reveal delay={i * 0.04} className="h-full">
              <Link
                href={c.href}
                className="group flex h-full gap-3 rounded-2xl border border-line bg-surface p-4 transition-all duration-300 hover:-translate-y-1 hover:border-accent hover:shadow-[0_14px_34px_-22px_var(--accent)]"
              >
                <span
                  className={`flex size-9 shrink-0 items-center justify-center rounded-xl font-display text-sm font-bold text-white transition-transform duration-300 group-hover:rotate-[-6deg] group-hover:scale-110 ${
                    c.byAdmin ? "bg-accent" : AVATAR_TONES[c.author.length % AVATAR_TONES.length]
                  }`}
                  aria-hidden
                >
                  {(c.author.trim()[0] ?? "?").toUpperCase()}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm">
                    <span className="font-semibold">{c.author}</span>{" "}
                    <span className="text-muted">{dict.feedIn}</span>{" "}
                    <span className="font-medium text-accent">{c.title}</span>
                  </span>
                  <span className="mt-1 line-clamp-2 block text-sm text-muted">{excerpt(c.body.replace(/\$\$[\s\S]*?\$\$|\$[^$\n]+\$/g, "…"))}</span>
                  <span className="mt-1.5 block text-xs text-muted/80">
                    <TimeAgo iso={c.createdAt} locale={locale} />
                  </span>
                </span>
              </Link>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}
