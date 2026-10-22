import type { NextRequest } from "next/server";
import { hasLocale } from "@/lib/i18n";
import { getMaterial } from "@/lib/materials";
import { siteUrl } from "@/lib/site";

// A note as a Markdown file with YAML front matter: opens as-is in Obsidian and imports into Notion.
export async function GET(request: NextRequest, ctx: RouteContext<"/api/md/[slug]">) {
  const { slug } = await ctx.params;
  const param = request.nextUrl.searchParams.get("locale");
  const locale = param && hasLocale(param) ? param : "ru";
  const m = await getMaterial(locale, slug);
  if (!m) return new Response("Not found", { status: 404 });

  const yaml = (v: string) => JSON.stringify(v); // JSON strings are valid YAML scalars
  const lines = [
    "---",
    `title: ${yaml(m.title)}`,
    `subject: ${yaml(m.subjectName)}`,
    `tags: [${m.tags.map(yaml).join(", ")}]`,
    `date: ${m.createdAt.slice(0, 10)}`,
    `source: ${yaml(`${siteUrl}/${locale}/materials/${m.slug}`)}`,
    ...(m.url ? [`link: ${yaml(m.url)}`] : []),
    "---",
    "",
    `# ${m.title}`,
    "",
    ...(m.excerpt ? [`> ${m.excerpt}`, ""] : []),
    m.body ?? "",
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="${m.slug}.md"`,
    },
  });
}
