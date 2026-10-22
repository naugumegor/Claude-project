"use client";

import { useState } from "react";
import { LayoutGroup, motion } from "motion/react";
import { FolderOpen, Heart } from "lucide-react";

const ICONS = { favorites: Heart, docs: FolderOpen };

/** The account's main area: favourites and «Мои документы» as two tabs (?tab=docs opens the second). */
export function AccountTabs({
  tabs,
  initial,
}: {
  tabs: { id: keyof typeof ICONS; label: string; count: number; content: React.ReactNode }[];
  initial: string;
}) {
  const [active, setActive] = useState(tabs.some((t) => t.id === initial) ? initial : tabs[0].id);
  return (
    <div>
      <LayoutGroup id="account-tabs">
        <div role="tablist" className="mb-6 flex gap-1 border-b border-line">
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
                className={`group relative -mb-px flex items-center gap-2 px-3 pb-3 pt-1 font-display text-lg font-bold tracking-tight transition-colors sm:text-xl ${
                  on ? "text-ink" : "text-muted hover:text-ink"
                }`}
              >
                <Icon
                  size={20}
                  className={`transition-transform group-hover:scale-110 ${t.id === "favorites" ? (on ? "fill-rose text-rose" : "") : on ? "text-accent" : ""}`}
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
