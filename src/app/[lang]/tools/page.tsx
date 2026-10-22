import type { Metadata } from "next";
import Link from "next/link";
import { BookA, ChartGantt, CircleHelp, Coins, Database, LayoutGrid, Sheet, Workflow } from "lucide-react";
import { getDictionary, getLocale } from "@/dictionaries";
import { alternates } from "@/lib/site";
import {
  EXCEL_FUNCTIONS,
  SAMPLE_CASES,
  SAMPLE_FLOW,
  SAMPLE_FUNNEL,
  SAMPLE_GANTT,
  SAMPLE_SQL_QUERY,
  SAMPLE_SQL_SETUP,
} from "@/lib/tools-samples";
import { Reveal } from "@/components/reveal";
import { BusinessTool } from "@/components/business/tools";
import { TOOL_NAMES } from "@/lib/business-blocks";
import { CanvasPicker } from "@/components/business/canvas-picker";
import { Gantt } from "@/components/business/gantt";
import { ProcessBlock } from "@/components/business/process";
import { CaseTrainer } from "@/components/business/case-trainer";
import { SqlSandbox } from "@/components/business/sql-sandbox";

export async function generateMetadata(): Promise<Metadata> {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  return { title: dict.tools.title, description: dict.tools.lead, alternates: alternates(locale, "/tools") };
}

export default async function ToolsPage() {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  const t = dict.tools;
  const nav = [
    { id: "calcs", label: t.calcs, icon: Coins },
    { id: "canvas", label: t.canvas, icon: LayoutGrid },
    { id: "gantt", label: t.gantt, icon: ChartGantt },
    { id: "process", label: t.process, icon: Workflow },
    { id: "cases", label: t.cases, icon: CircleHelp },
    { id: "sql", label: t.sql, icon: Database },
    { id: "excel", label: t.excel, icon: Sheet },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 pt-14 sm:px-6">
      <Reveal>
        <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">{t.title}</h1>
        <p className="mt-3 max-w-3xl text-muted">{t.lead}</p>
      </Reveal>
      <Reveal delay={0.08} className="mt-6 flex flex-wrap gap-2">
        {nav.map(({ id, label, icon: Icon }) => (
          <a
            key={id}
            href={`#${id}`}
            className="group inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2 text-sm font-medium text-muted transition-all hover:-translate-y-0.5 hover:border-accent hover:text-ink"
          >
            <Icon size={16} className="text-accent transition-transform group-hover:scale-125" />
            {label}
          </a>
        ))}
        <Link
          href={`/${locale}/glossary`}
          className="group inline-flex items-center gap-2 rounded-xl border border-dashed border-plum/60 bg-plum-soft/40 px-3 py-2 text-sm font-medium text-plum transition-all hover:-translate-y-0.5"
        >
          <BookA size={16} className="transition-transform group-hover:scale-125" />
          {t.glossary}
        </Link>
      </Reveal>

      <Section id="calcs" title={t.calcs} lead={t.calcsLead}>
        <div className="grid gap-x-6 lg:grid-cols-2 [&>*]:my-3">
          {TOOL_NAMES.map((name) => (
            <BusinessTool key={name} name={name} locale={locale} />
          ))}
        </div>
      </Section>

      <Section id="canvas" title={t.canvas} lead={t.canvasLead}>
        <CanvasPicker locale={locale} />
      </Section>

      <Section id="gantt" title={t.gantt} lead={t.ganttLead}>
        <Gantt source={SAMPLE_GANTT[locale]} locale={locale} storageKey={`ingenium:gantt:tools:${locale}`} startEditing />
      </Section>

      <Section id="process" title={t.process} lead={t.processLead}>
        <div className="grid gap-x-6 lg:grid-cols-2 [&>*]:my-3">
          {[SAMPLE_FUNNEL[locale], SAMPLE_FLOW[locale]].map((p) => (
            <ProcessBlock key={p.type} type={p.type} title={p.title} steps={p.steps} locale={locale} />
          ))}
        </div>
      </Section>

      <Section id="cases" title={t.cases} lead={t.casesLead}>
        <div className="max-w-3xl">
          <CaseTrainer cases={SAMPLE_CASES[locale]} locale={locale} />
        </div>
      </Section>

      <Section id="sql" title={t.sql} lead={t.sqlLead}>
        <SqlSandbox setup={SAMPLE_SQL_SETUP} query={SAMPLE_SQL_QUERY} locale={locale} />
      </Section>

      <Section id="excel" title={t.excel} lead={t.excelLead}>
        <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
          <table className="w-full min-w-[46rem] text-left text-sm">
            <thead className="bg-surface-2 text-xs text-muted">
              <tr>
                <th className="px-3 py-2 font-semibold">{t.fn}</th>
                <th className="px-3 py-2 font-semibold">{t.what}</th>
                <th className="px-3 py-2 font-semibold">{t.syntax}</th>
                <th className="px-3 py-2 font-semibold">{t.example}</th>
              </tr>
            </thead>
            <tbody>
              {EXCEL_FUNCTIONS.map((f) => (
                <tr key={f.en} className="border-t border-line align-top transition-colors hover:bg-accent-soft/40">
                  <td className="px-3 py-2">
                    <span className="block font-mono font-semibold">{locale === "ru" ? f.ru : f.en}</span>
                    <span className="block font-mono text-xs text-muted">{locale === "ru" ? f.en : f.ru}</span>
                  </td>
                  <td className="px-3 py-2">{f.what[locale]}</td>
                  <td className="px-3 py-2 font-mono text-xs text-muted">{f.syntax}</td>
                  <td className="px-3 py-2 font-mono text-xs">
                    {f.example}
                    {f.result && <span className="ml-1.5 rounded bg-accent-soft px-1 text-accent">→ {f.result}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}

function Section({ id, title, lead, children }: { id: string; title: string; lead: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mt-16 scroll-mt-24">
      <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
      <p className="mb-2 mt-2 max-w-3xl text-sm text-muted">
        {lead.split(/(`[^`]+`)/).map((part, i) =>
          part.startsWith("`") ? (
            <code key={i} className="rounded bg-surface-2 px-1 font-mono text-[0.92em] text-ink">
              {part.slice(1, -1)}
            </code>
          ) : (
            part
          ),
        )}
      </p>
      {children}
    </section>
  );
}
