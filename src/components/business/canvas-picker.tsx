"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n";
import { CANVAS_TYPES, type CanvasType } from "@/lib/business-blocks";
import { StrategyCanvas } from "./canvas";

const NAMES: Record<CanvasType, string> = { swot: "SWOT", pestel: "PESTEL", porter: "Porter 5F", lean: "Lean Canvas" };

/** The /tools page's canvases: one tab per framework, each saved separately in this browser. */
export function CanvasPicker({ locale }: { locale: Locale }) {
  const [type, setType] = useState<CanvasType>("swot");
  return (
    <div>
      <div role="tablist" className="flex max-w-full gap-1 overflow-x-auto rounded-xl border border-line bg-surface p-1 sm:inline-flex">
        {CANVAS_TYPES.map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={type === t}
            onClick={() => setType(t)}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              type === t ? "bg-plum-soft text-plum" : "text-muted hover:text-ink"
            }`}
          >
            {NAMES[t]}
          </button>
        ))}
      </div>
      <StrategyCanvas key={type} source={{ type, title: "", prefill: {} }} locale={locale} storageKey={`ingenium:canvas:tools:${type}`} />
    </div>
  );
}
