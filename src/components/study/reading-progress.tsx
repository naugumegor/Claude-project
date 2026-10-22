"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useScroll, useSpring } from "motion/react";
import { BookmarkCheck, X } from "lucide-react";

/** A thin progress line at the top, plus "continue where you stopped" on the next visit. */
export function ReadingProgress({
  slug,
  labels,
}: {
  slug: string;
  labels: { resumeAt: string; resume: string };
}) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30, restDelta: 0.001 });
  const [saved, setSaved] = useState<{ y: number; pct: number } | null>(null);
  const key = `ingenium:pos:${slug}`;

  useEffect(() => {
    try {
      const prev = JSON.parse(localStorage.getItem(key) ?? "null") as { y: number; pct: number } | null;
      // Only offer to jump when the reader got somewhere but didn't finish.
      if (prev && prev.pct > 0.05 && prev.pct < 0.95 && window.scrollY < 200) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage is only readable after mount
        setSaved(prev);
      }
    } catch {
      // No storage: nothing to resume.
    }

    let timer: ReturnType<typeof setTimeout> | undefined;
    const onScroll = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        if (max <= 0) return;
        try {
          localStorage.setItem(key, JSON.stringify({ y: window.scrollY, pct: window.scrollY / max }));
        } catch {}
        if (window.scrollY > 400) setSaved(null);
      }, 300);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, [key]);

  return (
    <>
      <motion.div
        style={{ scaleX }}
        className="no-print fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-gradient-to-r from-accent via-ochre to-rose"
      />
      <AnimatePresence>
        {saved && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24 }}
            className="no-print fixed bottom-20 left-1/2 z-50 flex w-max max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center gap-3 rounded-2xl border border-line bg-surface/95 p-2 pl-4 text-sm shadow-[0_20px_50px_-20px_rgba(35,38,43,0.5)] backdrop-blur"
          >
            <BookmarkCheck size={18} className="shrink-0 text-accent" />
            <span>
              {labels.resumeAt} <b>{Math.round(saved.pct * 100)}%</b>
            </span>
            <button
              type="button"
              onClick={() => {
                window.scrollTo({ top: saved.y, behavior: "smooth" });
                setSaved(null);
              }}
              className="rounded-xl bg-accent px-3 py-1.5 font-medium text-accent-ink"
            >
              {labels.resume}
            </button>
            <button
              type="button"
              onClick={() => setSaved(null)}
              aria-label="×"
              className="rounded-lg p-1.5 text-muted hover:text-ink"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
