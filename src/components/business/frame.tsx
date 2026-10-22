import type { LucideIcon } from "lucide-react";

// The shared shell of the business blocks: an icon, a title and buttons on the right.

const tones = {
  accent: "bg-accent-soft text-accent",
  ochre: "bg-ochre-soft text-ochre",
  rose: "bg-rose-soft text-rose",
  plum: "bg-plum-soft text-plum",
};

export function BlockFrame({
  icon: Icon,
  tone = "accent",
  title,
  actions,
  children,
  className = "",
}: {
  icon: LucideIcon;
  tone?: keyof typeof tones;
  title: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`not-prose calc-block my-8 rounded-2xl border border-line bg-surface p-4 sm:p-5 ${className}`}>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${tones[tone]}`}>
          <Icon size={16} />
        </span>
        <span className="min-w-0 font-display font-bold">{title}</span>
        {actions && <div className="no-print ml-auto flex flex-wrap items-center gap-1">{actions}</div>}
      </div>
      {children}
    </div>
  );
}

export function FrameButton({
  onClick,
  children,
  active,
  title,
}: {
  onClick: () => void;
  children: React.ReactNode;
  active?: boolean;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`group inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors ${
        active ? "bg-accent-soft text-accent" : "text-muted hover:bg-accent-soft hover:text-accent"
      }`}
    >
      {children}
    </button>
  );
}

/** Opens the given HTML in a new window and calls print, so the reader can save it as PDF. */
export function printHtml(title: string, body: string) {
  const w = window.open("", "_blank", "width=1000,height=760");
  if (!w) return;
  const esc = title.replace(/[<&]/g, (c) => (c === "<" ? "&lt;" : "&amp;"));
  w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${esc}</title>
<style>
  @page { size: A4 landscape; margin: 12mm; }
  * { box-sizing: border-box; }
  body { font: 13px/1.45 system-ui, -apple-system, "Segoe UI", sans-serif; color: #1d2433; margin: 0; padding: 16px; }
  h1 { font-size: 20px; margin: 0 0 4px; }
  .sub { color: #6b7385; margin: 0 0 14px; font-size: 12px; }
  .grid { display: grid; gap: 8px; }
  .cell { border: 1.5px solid #c9cfdb; border-radius: 10px; padding: 8px 10px; min-height: 90px; break-inside: avoid; }
  .cell h2 { font-size: 12px; text-transform: uppercase; letter-spacing: .04em; margin: 0 0 6px; color: #3a6f62; }
  .cell p { margin: 0; white-space: pre-wrap; }
  table { border-collapse: collapse; width: 100%; }
  td, th { border: 1px solid #c9cfdb; padding: 4px 6px; text-align: left; font-size: 12px; }
  .bar { height: 12px; border-radius: 4px; background: #5b9a8b; }
  .crit { background: #c76b6b; }
</style></head><body>${body}<script>window.onload = () => setTimeout(() => window.print(), 150);</script></body></html>`);
  w.document.close();
}

export const escapeHtml = (s: string) =>
  s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
