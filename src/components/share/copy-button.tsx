"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

/** Copies `text` (or, when it starts with "/", this site's absolute URL for that path). */
export function CopyButton({ text, label, done, className = "" }: { text: string; label: string; done: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(text.startsWith("/") ? location.origin + text : text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className={`inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs text-muted transition-colors hover:bg-accent-soft hover:text-accent ${className}`}
    >
      {copied ? <Check size={14} className="text-accent" /> : <Copy size={14} />}
      {copied ? done : label}
    </button>
  );
}
