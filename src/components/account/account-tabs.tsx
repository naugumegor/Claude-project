"use client";

import { useState } from "react";
import { LayoutGroup, motion } from "motion/react";
import { Flame, FolderOpen, Heart } from "lucide-react";

const ICONS = { favorites: Heart, docs: FolderOpen, study: Flame };

/** The account's main area: favourites, «Мои документы» and the study tracker as tabs (?tab=docs, ?tab=study). */
export function AccountTabs({
  tabs,
  initial,
}: {
  tabs: { id: keyof typeof ICONS; label: string; count: number; content: React.ReactNode }[];
  initial: string;
}) {
  const [active, setActive] = useState(tabs.some((t) => t.id === initial) ? initial : tabs[0].id);
  return (
    <div className="min-w-0">
      <LayoutGroup id="account-tabs">
        <div role="tablist" className="mb-6 flex gap-1 overflow-x-auto border-b border-line [scrollbar-width:none]">
          {tabs.map((t) => {
            const Icon = ICONS[t.id];
            const on = t.id === active;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => {
                  setActive(t.id);
                  window.history.replaceState(null, "", t.id === tabs[0].id ? "?" : `?tab=${t.id}`);
                }}
                className={`group relative flex shrink-0 items-center gap-2 px-3 pb-3 pt-1 font-display text-lg font-bold tracking-tight transition-colors sm:text-xl ${
                  on ? "text-ink" : "text-muted hover:text-ink"
                }`}
              >
                <Icon
                  size={20}
                  className={`transition-transform group-hover:scale-110 ${t.id === "favorites" ? (on ? "fill-rose text-rose" : "") : t.id === "study" ? (on ? "text-rose" : "") : on ? "text-accent" : ""}`}
                />
                {t.label}
                <span className="text-sm font-medium text-muted">{t.count}</span>
                {on && <motion.span layoutId="account-tab" className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-accent" />}
              </button>
            );
          })}
        </div>
      </LayoutGroup>
      {tabs.map((t) => (
        <div key={t.id} role="tabpanel" hidden={t.id !== active}>
          {t.content}
        </div>
      ))}
    </div>
  );
}
