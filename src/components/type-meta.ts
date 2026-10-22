import { FileText, Image as ImageIcon, Link2, type LucideIcon } from "lucide-react";
import type { MaterialType } from "@/lib/content";

// Icon and colour per material type, shared by cards, filters and search.
export const typeMeta: Record<
  MaterialType,
  { icon: LucideIcon; tone: string; soft: string; glow: string }
> = {
  note: {
    icon: FileText,
    tone: "text-accent",
    soft: "bg-accent-soft",
    glow: "group-hover:shadow-[0_8px_24px_-8px_var(--accent)]",
  },
  link: {
    icon: Link2,
    tone: "text-ochre",
    soft: "bg-ochre-soft",
    glow: "group-hover:shadow-[0_8px_24px_-8px_var(--ochre)]",
  },
  photo: {
    icon: ImageIcon,
    tone: "text-rose",
    soft: "bg-rose-soft",
    glow: "group-hover:shadow-[0_8px_24px_-8px_var(--rose)]",
  },
};
