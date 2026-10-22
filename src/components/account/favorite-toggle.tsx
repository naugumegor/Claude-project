"use client";

import { useOptimistic, useTransition } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { toggleFavorite } from "@/app/[lang]/account/actions";

export function FavoriteToggle({
  materialId,
  initial,
  labels,
  loginHref,
}: {
  materialId: number;
  initial: boolean;
  labels: { favorite: string; favorited: string };
  loginHref: string;
}) {
  const router = useRouter();
  const [saved, setSaved] = useOptimistic(initial);
  const [, startTransition] = useTransition();

  const onClick = () =>
    startTransition(async () => {
      setSaved(!saved);
      const result = await toggleFavorite(materialId);
      if (result === null) router.push(loginHref);
      else router.refresh();
    });

  return <FavoriteButton saved={saved} labels={labels} onClick={onClick} />;
}

export function FavoriteButton({
  saved,
  labels,
  onClick,
}: {
  saved: boolean;
  labels: { favorite: string; favorited: string };
  onClick?: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.92 }}
      aria-pressed={saved}
      className={`group relative inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-[background-color,border-color,color,box-shadow] duration-300 ${
        saved
          ? "border-rose bg-rose-soft text-rose shadow-[0_8px_22px_-12px_var(--rose)]"
          : "border-line bg-surface text-muted hover:border-rose hover:text-rose"
      }`}
    >
      <span className="relative flex size-4 items-center justify-center">
        <motion.span
          key={String(saved)}
          initial={{ scale: saved ? 0.4 : 1 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 12 }}
        >
          <Heart size={16} className={saved ? "fill-rose" : "transition-transform group-hover:scale-110"} />
        </motion.span>
        {/* A little burst ring when the heart fills. */}
        <AnimatePresence>
          {saved && (
            <motion.span
              key="burst"
              initial={{ scale: 0.4, opacity: 0.7 }}
              animate={{ scale: 2.4, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 rounded-full border-2 border-rose"
            />
          )}
        </AnimatePresence>
      </span>
      {saved ? labels.favorited : labels.favorite}
    </motion.button>
  );
}
