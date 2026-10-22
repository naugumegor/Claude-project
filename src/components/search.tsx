"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion } from "motion/react";
import { CornerDownLeft, Search, X } from "lucide-react";
import type { Dictionary } from "@/dictionaries";
import type { Locale } from "@/lib/i18n";
import { highlight, searchItems, type SearchItem } from "@/lib/search";
import { typeMeta } from "./type-meta";

type SearchContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const SearchContext = createContext<SearchContextValue | null>(null);

export function useSearch() {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error("useSearch must be used inside <SearchProvider>");
  return ctx;
}

const spring = { type: "spring", stiffness: 380, damping: 32 } as const;

export function SearchProvider({
  items,
  locale,
  dict,
  children,
}: {
  items: SearchItem[];
  locale: Locale;
  dict: Dictionary["search"];
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  // Ctrl/Cmd+K or "/" opens search from anywhere, Escape closes it.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const typing =
        target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        setOpen(true);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const value = useMemo(() => ({ open, setOpen }), [open]);

  return (
    <SearchContext.Provider value={value}>
      {children}
      <AnimatePresence>
        {open && (
          <SearchDialog
            items={items}
            locale={locale}
            dict={dict}
            onClose={() => setOpen(false)}
          />
        )}
      </AnimatePresence>
    </SearchContext.Provider>
  );
}

/** The big search bar on the home page. Clicking it flies the bar up into the dialog. */
export function HeroSearch({ placeholder, hint }: { placeholder: string; hint: string }) {
  const { open, setOpen } = useSearch();
  return (
    <div className="h-16 w-full max-w-xl">
      {!open && (
        <motion.button
          layoutId="search-box"
          transition={spring}
          onClick={() => setOpen(true)}
          whileHover={{ scale: 1.015 }}
          whileTap={{ scale: 0.99 }}
          className="group flex h-16 w-full items-center gap-3 rounded-2xl border border-line bg-surface px-5 text-left shadow-[0_10px_40px_-20px_rgba(35,38,43,0.35)] transition-[border-color,box-shadow] hover:border-accent hover:shadow-[0_0_0_5px_var(--accent-soft)]"
        >
          <motion.span
            className="text-muted transition-colors group-hover:text-accent"
            animate={{ rotate: [0, -12, 0] }}
            transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 4 }}
          >
            <Search size={22} />
          </motion.span>
          <span className="flex-1 truncate text-muted">{placeholder}</span>
          <kbd className="hidden rounded-md border border-line bg-surface-2 px-2 py-0.5 text-xs text-muted sm:block">
            Ctrl K
          </kbd>
          <span className="sr-only">{hint}</span>
        </motion.button>
      )}
    </div>
  );
}

/** Compact search button for the header. */
export function HeaderSearchButton({ label }: { label: string }) {
  const { setOpen } = useSearch();
  return (
    <motion.button
      onClick={() => setOpen(true)}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.92 }}
      aria-label={label}
      className="group flex h-10 items-center gap-2 rounded-xl border border-line bg-surface px-3 text-muted transition-[color,border-color,box-shadow] hover:border-accent hover:text-accent hover:shadow-[0_6px_18px_-8px_var(--accent)]"
    >
      <Search size={18} className="transition-transform group-hover:scale-110" />
      <kbd className="hidden whitespace-nowrap text-xs md:block">Ctrl K</kbd>
    </motion.button>
  );
}

function SearchDialog({
  items,
  locale,
  dict,
  onClose,
}: {
  items: SearchItem[];
  locale: Locale;
  dict: Dictionary["search"];
  onClose: () => void;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [remote, setRemote] = useState<{ query: string; items: SearchItem[] } | null>(null);
  const local = useMemo(() => searchItems(items, query).slice(0, 8), [items, query]);
  // Instant results from the titles we already have, replaced by the database's
  // full-text results (which also look inside note bodies) once they arrive.
  const results = remote?.query === query.trim() ? remote.items : local;

  useEffect(() => {
    const q = query.trim();
    if (!q) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?locale=${locale}&q=${encodeURIComponent(q)}`, {
          signal: controller.signal,
        });
        if (res.ok) setRemote({ query: q, items: (await res.json()).items });
      } catch {
        // Aborted or offline: the local results stay on screen.
      }
    }, 180);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, locale]);

  useEffect(() => {
    inputRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const go = useCallback(
    (slug: string) => {
      onClose();
      router.push(`/${locale}/materials/${slug}`);
    },
    [locale, onClose, router],
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[active]) {
      go(results[active].slug);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center px-4 pt-[12vh]">
      <motion.div
        className="absolute inset-0 bg-ink/25 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        layoutId="search-box"
        transition={spring}
        initial={{ opacity: 0, y: -16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.98 }}
        role="dialog"
        aria-modal="true"
        className="relative h-fit w-full max-w-2xl overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_30px_80px_-30px_rgba(35,38,43,0.5)]"
      >
        <div className="flex items-center gap-3 border-b border-line px-5">
          <Search size={22} className="shrink-0 text-accent" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
            placeholder={dict.placeholder}
            className="h-16 w-full bg-transparent text-lg outline-none placeholder:text-muted"
          />
          <button
            onClick={onClose}
            aria-label={dict.close}
            className="rounded-lg p-1.5 text-muted transition-colors hover:bg-surface-2 hover:text-ink"
          >
            <X size={20} />
          </button>
        </div>

        <AnimatePresence mode="popLayout" initial={false}>
          {query.trim() !== "" && (
            <motion.ul
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-h-[55vh] overflow-y-auto p-2"
            >
              {results.length === 0 && (
                <li className="px-4 py-8 text-center text-muted">{dict.empty}</li>
              )}
              {results.map((item, i) => {
                const meta = typeMeta[item.type];
                const Icon = meta.icon;
                return (
                  <motion.li
                    key={item.slug}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <Link
                      href={`/${locale}/materials/${item.slug}`}
                      onClick={onClose}
                      onMouseEnter={() => setActive(i)}
                      className="relative flex items-start gap-3 rounded-xl px-3 py-3"
                    >
                      {active === i && (
                        <motion.span
                          layoutId="search-active"
                          transition={spring}
                          className="absolute inset-0 rounded-xl bg-surface-2"
                        />
                      )}
                      <span
                        className={`relative mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg ${meta.soft} ${meta.tone}`}
                      >
                        <Icon size={18} />
                      </span>
                      <span className="relative min-w-0 flex-1">
                        <span className="block font-medium">
                          {highlight(item.title, query).map((part, j) =>
                            part.hit ? (
                              <mark key={j} className="rounded bg-ochre-soft px-0.5 text-ink">
                                {part.text}
                              </mark>
                            ) : (
                              <span key={j}>{part.text}</span>
                            ),
                          )}
                        </span>
                        <span className="line-clamp-2 text-sm text-muted">
                          {item.snippet
                            ? item.snippet.split(/(<<.*?>>)/).map((part, j) =>
                                part.startsWith("<<") ? (
                                  <mark key={j} className="rounded bg-ochre-soft px-0.5 text-ink">
                                    {part.slice(2, -2)}
                                  </mark>
                                ) : (
                                  <span key={j}>{part}</span>
                                ),
                              )
                            : item.excerpt}
                        </span>
                      </span>
                      {active === i && (
                        <CornerDownLeft size={16} className="relative mt-1 text-muted" />
                      )}
                    </Link>
                  </motion.li>
                );
              })}
            </motion.ul>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
