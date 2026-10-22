import {
  Code,
  Cog,
  DraftingCompass,
  Flame,
  FlaskConical,
  Gem,
  Shapes,
  Sigma,
  Weight,
  type LucideIcon,
} from "lucide-react";
import type { SectionSlug } from "@/lib/taxonomy";

/** Icon and colour pair per section, shared by the home grid, filters and breadcrumbs. */
export const sectionMeta: Record<SectionSlug, { icon: LucideIcon; tone: string; soft: string }> = {
  math: { icon: Sigma, tone: "text-accent", soft: "bg-accent-soft" },
  mechanics: { icon: Weight, tone: "text-ochre", soft: "bg-ochre-soft" },
  materials: { icon: Gem, tone: "text-plum", soft: "bg-plum-soft" },
  thermo: { icon: Flame, tone: "text-rose", soft: "bg-rose-soft" },
  machines: { icon: Cog, tone: "text-ochre", soft: "bg-ochre-soft" },
  drafting: { icon: DraftingCompass, tone: "text-accent", soft: "bg-accent-soft" },
  programming: { icon: Code, tone: "text-plum", soft: "bg-plum-soft" },
  science: { icon: FlaskConical, tone: "text-rose", soft: "bg-rose-soft" },
  other: { icon: Shapes, tone: "text-muted", soft: "bg-surface-2" },
};
