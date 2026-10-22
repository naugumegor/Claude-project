import Link from "next/link";

/** Wordmark with a small "spark" glyph that turns on hover. */
export function Logo({ href }: { href: string }) {
  return (
    <Link href={href} className="group flex items-center gap-2.5">
      <svg
        viewBox="0 0 32 32"
        className="size-8 transition-transform duration-500 group-hover:rotate-90"
        aria-hidden
      >
        <rect width="32" height="32" rx="9" fill="var(--accent)" />
        <path
          d="M16 7v18M7 16h18M10 10l12 12M22 10 10 22"
          stroke="var(--accent-ink)"
          strokeWidth="2.2"
          strokeLinecap="round"
          opacity=".9"
        />
        <circle cx="16" cy="16" r="3.2" fill="var(--ochre)" />
      </svg>
      <span className="font-display text-lg font-extrabold tracking-tight">Ingenium</span>
    </Link>
  );
}
