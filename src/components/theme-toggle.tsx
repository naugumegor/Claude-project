"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Moon, Sun } from "lucide-react";
import { THEME_KEY } from "@/lib/head-scripts";

export function ThemeToggle({ labels }: { labels: { light: string; dark: string } }) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the theme was applied by the head script
    setDark(document.documentElement.dataset.theme === "dark");
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    if (next) document.documentElement.dataset.theme = "dark";
    else delete document.documentElement.dataset.theme;
    try {
      localStorage.setItem(THEME_KEY, next ? "dark" : "light");
    } catch {}
  };

  return (
    <motion.button
      type="button"
      onClick={toggle}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.9 }}
      aria-label={dark ? labels.light : labels.dark}
      title={dark ? labels.light : labels.dark}
      className="group flex size-10 items-center justify-center overflow-hidden rounded-xl border border-line bg-surface text-muted transition-[color,border-color] hover:border-ochre hover:text-ochre"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={dark ? "moon" : "sun"}
          initial={{ y: 18, rotate: -90, opacity: 0 }}
          animate={{ y: 0, rotate: 0, opacity: 1 }}
          exit={{ y: -18, rotate: 90, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 22 }}
        >
          {dark ? <Moon size={18} /> : <Sun size={18} />}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}
