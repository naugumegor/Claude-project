// Parsers for the business blocks in notes: ```canvas, ```case, ```process, ```gantt and ```sql.
// They are plain text formats (see /mnt/project-files/specs/business-blocks.md), so they stay
// readable in the raw Markdown and are easy to type in the admin editor.

export type ToolName = "cashflow" | "unit" | "breakeven" | "demand" | "wacc";
export const TOOL_NAMES: ToolName[] = ["cashflow", "unit", "breakeven", "demand", "wacc"];

/** Parses a ```tool block: "name: cashflow" and "key: value" lines. */
export function parseTool(raw: string): { name: ToolName; params: Record<string, string> } | null {
  const params: Record<string, string> = {};
  for (const line of raw.split("\n")) {
    const m = line.match(/^\s*([a-z]+)\s*:\s*(.+?)\s*$/i);
    if (m) params[m[1].toLowerCase()] = m[2];
  }
  const name = params.name as ToolName;
  return TOOL_NAMES.includes(name) ? { name, params } : null;
}


export const CANVAS_TYPES = ["swot", "pestel", "porter", "lean"] as const;
export type CanvasType = (typeof CANVAS_TYPES)[number];

export const CANVAS_KEYS: Record<CanvasType, string[]> = {
  swot: ["strengths", "weaknesses", "opportunities", "threats"],
  pestel: ["political", "economic", "social", "technological", "environmental", "legal"],
  porter: ["entrants", "suppliers", "rivalry", "buyers", "substitutes"],
  lean: ["problem", "solution", "uvp", "advantage", "segments", "metrics", "channels", "costs", "revenue"],
};

export type CanvasSource = { type: CanvasType; title: string; prefill: Record<string, string> };

const keyValue = (line: string) => line.match(/^\s*([a-z]+)\s*:\s*(.*?)\s*$/i);

export function parseCanvas(raw: string): CanvasSource | null {
  let type: CanvasType | null = null;
  let title = "";
  const prefill: Record<string, string> = {};
  let last = "";
  for (const line of raw.split("\n")) {
    const m = keyValue(line);
    const key = m?.[1].toLowerCase();
    if (m && key === "type") type = CANVAS_TYPES.find((t) => t === m[2].toLowerCase()) ?? null;
    else if (m && key === "title") title = m[2];
    else if (m && key) {
      last = key;
      prefill[key] = prefill[key] ? `${prefill[key]}\n${m[2]}` : m[2];
    } else if (line.trim() && last) {
      // A line without "key:" continues the previous field.
      prefill[last] += `\n${line.trim()}`;
    }
  }
  if (!type) return null;
  const keys = CANVAS_KEYS[type];
  return { type, title, prefill: Object.fromEntries(Object.entries(prefill).filter(([k]) => keys.includes(k))) };
}

export type CaseOption = { text: string; verdict: "good" | "partial" | "bad"; why: string };
export type CaseItem = { id: string; situation: string; options: CaseOption[] };

/** ```case: "? situation", then "+ / ~ / -" options with ":: why". Cases are separated by blank lines. */
export function parseCases(raw: string): CaseItem[] {
  const cases: CaseItem[] = [];
  let current: CaseItem | null = null;
  for (const line of raw.split("\n")) {
    const t = line.trim();
    if (!t) {
      current = null;
      continue;
    }
    if (t.startsWith("?")) {
      current = { id: `case-${cases.length}`, situation: t.slice(1).trim(), options: [] };
      cases.push(current);
      continue;
    }
    const m = t.match(/^([+~-])\s*(.*)$/);
    if (m && current) {
      const [text, why = ""] = m[2].split("::").map((s) => s.trim());
      current.options.push({ text, verdict: m[1] === "+" ? "good" : m[1] === "~" ? "partial" : "bad", why });
    } else if (current) {
      // An extra line of the situation.
      if (current.options.length === 0) current.situation += ` ${t}`;
    }
  }
  return cases.filter((c) => c.situation && c.options.length >= 2);
}

export type ProcessStep = { title: string; metric: string; value: number; description: string; link: string };
export type ProcessSource = { type: "flow" | "funnel"; title: string; steps: ProcessStep[] };

/** ```process: "type: flow|funnel", "title:", then "Step | metric | description | link" lines. */
export function parseProcess(raw: string): ProcessSource | null {
  let type: "flow" | "funnel" = "flow";
  let title = "";
  const steps: ProcessStep[] = [];
  for (const line of raw.split("\n")) {
    if (!line.trim()) continue;
    const m = keyValue(line);
    if (m && !line.includes("|") && m[1].toLowerCase() === "type") {
      type = m[2].toLowerCase() === "funnel" ? "funnel" : "flow";
      continue;
    }
    if (m && !line.includes("|") && m[1].toLowerCase() === "title") {
      title = m[2];
      continue;
    }
    const [name, metric = "", description = "", link = ""] = line.split("|").map((s) => s.trim());
    const value = Number(metric.replace(/[\s ]/g, "").replace(",", ".").replace(/[^\d.-].*$/, ""));
    steps.push({ title: name, metric, value: Number.isFinite(value) ? value : NaN, description, link });
  }
  return steps.length ? { type, title, steps } : null;
}

export type GanttTask = { name: string; start: string; days: number; done: number };
export type GanttSource = { title: string; start: string; tasks: GanttTask[] };

/** ```gantt: "title:", "start: YYYY-MM-DD", then "Task | start | days | done%" lines. */
export function parseGantt(raw: string): GanttSource {
  let title = "";
  let start = "";
  const tasks: GanttTask[] = [];
  for (const line of raw.split("\n")) {
    if (!line.trim()) continue;
    if (!line.includes("|")) {
      const m = keyValue(line);
      if (m?.[1].toLowerCase() === "title") title = m[2];
      if (m?.[1].toLowerCase() === "start") start = m[2];
      continue;
    }
    const [name, s = "1", days = "1", done = "0"] = line.split("|").map((x) => x.trim());
    tasks.push({
      name,
      start: s,
      days: Math.max(1, Math.round(Number(days) || 1)),
      done: Math.min(100, Math.max(0, Number(done.replace("%", "")) || 0)),
    });
  }
  return { title, start, tasks };
}

const DAY = 86_400_000;
const AFTER = /^(?:после|after)\s+([\d,\s]+)$/i;

export function parseDate(s: string): number | null {
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? Date.UTC(+m[1], +m[2] - 1, +m[3]) : null;
}

export const isoDate = (t: number) => new Date(t).toISOString().slice(0, 10);

export type ScheduledTask = GanttTask & {
  /** 0-based first day and the day after the last. */
  from: number;
  to: number;
  deps: number[];
  critical: boolean;
};

/**
 * Resolves each task's start ("3", "2026-11-02" or "после 1,2") into day offsets and marks the
 * critical path: the chain of dependencies that ends last, where any delay moves the finish.
 */
export function schedule(source: GanttSource): { tasks: ScheduledTask[]; days: number; origin: number } {
  const dates = source.tasks.map((t) => parseDate(t.start)).filter((d): d is number => d !== null);
  const origin = parseDate(source.start) ?? (dates.length ? Math.min(...dates) : Date.UTC(2026, 0, 1));
  const out: ScheduledTask[] = [];
  const resolve = (i: number, seen: Set<number>): ScheduledTask => {
    if (out[i]) return out[i];
    const t = source.tasks[i];
    let from = 0;
    let deps: number[] = [];
    const after = t.start.match(AFTER);
    const date = parseDate(t.start);
    if (after) {
      deps = after[1]
        .split(",")
        .map((n) => Number(n.trim()) - 1)
        .filter((d) => Number.isInteger(d) && d >= 0 && d < source.tasks.length && d !== i && !seen.has(d));
      seen.add(i);
      from = Math.max(0, ...deps.map((d) => resolve(d, seen).to));
    } else if (date !== null) from = Math.round((date - origin) / DAY);
    else from = Math.max(0, (Number(t.start) || 1) - 1);
    out[i] = { ...t, from, to: from + t.days, deps, critical: false };
    return out[i];
  };
  source.tasks.forEach((_, i) => resolve(i, new Set()));
  const days = Math.max(1, ...out.map((t) => t.to));
  // Walk back from the tasks that finish last through dependencies that end exactly when they start.
  const mark = (i: number) => {
    if (out[i].critical) return;
    out[i].critical = true;
    for (const d of out[i].deps) if (out[d].to === out[i].from) mark(d);
  };
  out.forEach((t, i) => t.to === days && mark(i));
  return { tasks: out, days, origin };
}

export type SqlSource = { setup: string; query: string };

/** ```sql: everything before a "-- query" line is hidden setup; the rest is the editable query. */
export function parseSql(raw: string): SqlSource {
  const lines = raw.split("\n");
  const at = lines.findIndex((l) => /^\s*--\s*(query|запрос)\s*$/i.test(l));
  if (at < 0) return { setup: "", query: raw.trim() };
  return { setup: lines.slice(0, at).join("\n"), query: lines.slice(at + 1).join("\n").trim() };
}
