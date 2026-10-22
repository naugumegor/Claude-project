import type { MaterialType } from "@/lib/content";

export type SearchItem = {
  slug: string;
  type: MaterialType;
  title: string;
  excerpt: string;
  subject: string;
  tags: string[];
};

const normalize = (s: string) => s.toLowerCase().replace(/ё/g, "е");

/** Every word of the query must appear somewhere in the item. Title hits rank first. */
export function searchItems(items: SearchItem[], query: string): SearchItem[] {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  return items
    .map((item) => {
      const title = normalize(item.title);
      const haystack = normalize(
        [item.title, item.excerpt, item.subject, ...item.tags].join(" "),
      );
      if (!words.every((w) => haystack.includes(w))) return null;
      const score = words.filter((w) => title.includes(w)).length;
      return { item, score };
    })
    .filter((r) => r !== null)
    .sort((a, b) => b.score - a.score)
    .map((r) => r.item);
}

/** Splits text into chunks, flagging the parts that match a query word. */
export function highlight(text: string, query: string) {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) return [{ text, hit: false }];
  const escaped = words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const re = new RegExp(`(${escaped.join("|")})`, "gi");
  return text
    .split(re)
    .filter(Boolean)
    .map((part) => ({ text: part, hit: words.includes(normalize(part)) }));
}
