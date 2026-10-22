import data from "../../content/glossary.json";
import { slugify } from "./slug";

// The bilingual glossary (content/glossary.json). In a note, [[NPV]] or [[shown text|key]]
// underlines the text and shows the definition on hover; the key matches the Russian or English
// term or any alias, ignoring case.

export type GlossaryTerm = {
  id: string;
  ru: string;
  en: string;
  def_ru: string;
  def_en: string;
  area: "eng" | "biz";
  aliases: string[];
};

type RawTerm = Omit<GlossaryTerm, "id" | "aliases" | "area"> & { area?: string; aliases?: string[] };

export const GLOSSARY: GlossaryTerm[] = (data as RawTerm[])
  .map((t) => ({ ...t, id: slugify(t.en), area: t.area === "biz" ? ("biz" as const) : ("eng" as const), aliases: t.aliases ?? [] }))
  .sort((a, b) => a.ru.localeCompare(b.ru, "ru"));

const norm = (s: string) => s.trim().toLowerCase().replace(/ё/g, "е").replace(/\s+/g, " ");

const index = new Map<string, GlossaryTerm>();
for (const t of GLOSSARY) for (const k of [t.ru, t.en, ...t.aliases]) if (!index.has(norm(k))) index.set(norm(k), t);

export function findTerm(key: string): GlossaryTerm | undefined {
  return index.get(norm(key));
}

type MdNode = { type: string; value?: string; children?: MdNode[]; data?: Record<string, unknown> };

const LINK = /\[\[([^\]|\n]+?)(?:\|([^\]\n]+?))?\]\]/g;

/**
 * remark plugin: [[term]] and [[shown|key]] in plain text become <dfn data-term="key">.
 * Code and math are separate node types, so `[[1, 2]]` in code is never touched.
 */
export function remarkGlossary() {
  const walk = (node: MdNode) => {
    if (!node.children) return;
    const out: MdNode[] = [];
    for (const child of node.children) {
      if (child.type !== "text" || !child.value?.includes("[[")) {
        walk(child);
        out.push(child);
        continue;
      }
      const text = child.value;
      let last = 0;
      for (const m of text.matchAll(LINK)) {
        if (m.index > last) out.push({ type: "text", value: text.slice(last, m.index) });
        const shown = m[1].trim();
        const key = (m[2] ?? m[1]).trim();
        out.push({
          type: "glossaryTerm",
          data: { hName: "dfn", hProperties: { dataTerm: key } },
          children: [{ type: "text", value: shown }],
        });
        last = m.index + m[0].length;
      }
      if (last < text.length) out.push({ type: "text", value: text.slice(last) });
    }
    node.children = out;
  };
  return (tree: MdNode) => walk(tree);
}
