import { sql } from "drizzle-orm";
import { db } from "./index";

export type SearchHit = { slug: string; rank: number; snippet: string };

/**
 * Full-text search over published materials: titles, descriptions, tags, topics and
 * the whole note body, in both languages. Russian and English stemming means
 * "законы" also finds "закон", and the last word is matched as a prefix while typing.
 */
export async function searchMaterials(query: string, limit = 8): Promise<SearchHit[]> {
  const words = query
    .toLowerCase()
    .replace(/ё/g, "е")
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean)
    .slice(0, 8);
  if (words.length === 0) return [];
  const tsquery = words.map((w) => `${w}:*`).join(" & ");

  const result = await db.execute(sql`
    select m.slug,
           ts_rank(d.doc, q.q) as rank,
           ts_headline('russian', d.body, q.q,
             'MaxWords=22, MinWords=10, MaxFragments=1, StartSel=<<, StopSel=>>') as snippet
    from materials m
    join subjects s on s.id = m.subject_id
    cross join lateral (
      select to_tsquery('russian', ${tsquery}) || to_tsquery('english', ${tsquery}) as q
    ) q
    cross join lateral (
      select
        coalesce(string_agg(t.body, ' '), '') as body,
        setweight(to_tsvector('russian', coalesce(string_agg(t.title, ' '), '')), 'A') ||
        setweight(to_tsvector('english', coalesce(string_agg(t.title, ' '), '')), 'A') ||
        setweight(to_tsvector('russian', concat_ws(' ', string_agg(t.excerpt, ' '), s.name_ru, s.name_en,
          (select string_agg(tg.name, ' ') from material_tags mtg join tags tg on tg.id = mtg.tag_id
           where mtg.material_id = m.id))), 'B') ||
        setweight(to_tsvector('english', concat_ws(' ', string_agg(t.excerpt, ' '), s.name_en)), 'B') ||
        setweight(to_tsvector('russian', coalesce(string_agg(t.body, ' '), '')), 'C') ||
        setweight(to_tsvector('english', coalesce(string_agg(t.body, ' '), '')), 'C') as doc
      from material_texts t
      where t.material_id = m.id
    ) d
    where m.status = 'published' and d.doc @@ q.q
    order by rank desc, m.created_at desc
    limit ${limit}
  `);

  return (result.rows as { slug: string; rank: number; snippet: string }[]).map((r) => ({
    slug: r.slug,
    rank: Number(r.rank),
    // Only keep the snippet when it actually points at a match in the note body.
    snippet: r.snippet.includes("<<") ? cleanSnippet(r.snippet) : "",
  }));
}

/** Strips Markdown/LaTeX noise from a snippet but keeps the << >> match markers. */
function cleanSnippet(s: string) {
  return s
    .replace(/<</g, "\u0001")
    .replace(/>>/g, "\u0002")
    .replace(/[#*_`>|$\\]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\u0001/g, "<<")
    .replace(/\u0002/g, ">>")
    .trim();
}
