"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ListTree } from "lucide-react";

type Heading = { id: string; text: string; level: 2 | 3 };

/**
 * Contents of the note, built from its h2/h3 headings. Sticks to the side on wide
 * screens and highlights the section being read; folds into a card on narrow ones.
 */
export function Toc({ title }: { title: string }) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const els = [...document.querySelectorAll<HTMLElement>("#note-body h2[id], #note-body h3[id]")].filter(
      (el) => !el.closest(".study-block"),
    );
    // eslint-disable-next-line react-hooks/set-state-in-effect -- headings exist only in the rendered DOM
    setHeadings(els.map((el) => ({ id: el.id, text: el.textContent ?? "", level: el.tagName === "H2" ? 2 : 3 })));

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-80px 0px -65% 0px" },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  if (headings.length < 2) return null;

  const list = (
    <ul className="relative grid gap-0.5 text-sm">
      {headings.map((h) => (
        <li key={h.id} className={h.level === 3 ? "pl-4" : ""}>
          <a
            href={`#${h.id}`}
            onClick={() => setActive(h.id)}
            className={`relative block rounded-lg px-3 py-1.5 transition-colors ${
              active === h.id ? "text-accent" : "text-muted hover:text-ink"
            }`}
          >
            {active === h.id && (
              <motion.span
                layoutId="toc-active"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
                className="absolute inset-0 rounded-lg bg-accent-soft"
              />
            )}
            <span className="relative">{h.text}</span>
          </a>
        </li>
      ))}
    </ul>
  );

  return (
    <>
      <details className="focus-hide no-print group mt-6 rounded-2xl border border-line bg-surface xl:hidden">
        <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 font-medium">
          <ListTree size={17} className="text-accent transition-transform group-open:rotate-90" />
          {title}
        </summary>
        <div className="border-t border-line p-2">{list}</div>
      </details>
      <nav
        aria-label={title}
        className="no-print fixed top-28 hidden max-h-[calc(100vh-9rem)] w-60 overflow-y-auto xl:block"
        style={{ left: "calc(50% + 26rem)" }}
      >
        <p className="mb-2 flex items-center gap-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted">
          <ListTree size={14} /> {title}
        </p>
        {list}
      </nav>
    </>
  );
}
