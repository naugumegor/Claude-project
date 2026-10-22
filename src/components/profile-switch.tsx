"use client";

import { LayoutGroup, motion } from "motion/react";
import { Briefcase, Cog, Layers } from "lucide-react";
import { setProfile, useProfile } from "@/lib/profile";
import type { ProfileChoice } from "@/lib/taxonomy";

const spring = { type: "spring", stiffness: 420, damping: 34 } as const;
const icons = { general: Layers, engineering: Cog, business: Briefcase };

/** Общий / Инженерия / Бизнес: narrows sections, materials and tools to one field. */
export function ProfileSwitch({
  id,
  labels,
  compact = false,
}: {
  id: string;
  labels: Record<ProfileChoice, string> & { title: string };
  compact?: boolean;
}) {
  const profile = useProfile();
  return (
    <LayoutGroup id={`profile-${id}`}>
      <div role="radiogroup" aria-label={labels.title} className="flex rounded-xl border border-line bg-surface p-1">
        {(["general", "engineering", "business"] as const).map((p) => {
          const Icon = icons[p];
          const on = profile === p;
          return (
            <button
              key={p}
              type="button"
              role="radio"
              aria-checked={on}
              title={labels[p]}
              onClick={() => setProfile(p)}
              className={`group relative flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold transition-colors ${
                on ? "text-accent-ink" : "text-muted hover:text-ink"
              }`}
            >
              {on && (
                <motion.span layoutId="profile-pill" transition={spring} className="absolute inset-0 rounded-lg bg-accent" />
              )}
              <Icon size={14} className="relative transition-transform duration-300 group-hover:rotate-12" />
              <span className={`relative ${compact ? "" : "sr-only"}`}>{labels[p]}</span>
            </button>
          );
        })}
      </div>
    </LayoutGroup>
  );
}
