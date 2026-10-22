import { Suspense } from "react";
import type { Metadata } from "next";
import { Flame, Gauge, Ruler, Shapes, Waves } from "lucide-react";
import { getDictionary, getLocale } from "@/dictionaries";
import { alternates } from "@/lib/site";
import {
  GDT,
  GDT_GROUPS,
  ROUGHNESS,
  ROUGHNESS_SIGNS,
  STEELS,
  WELD_JOINTS,
  WELD_SIGNS,
} from "@/lib/reference-data";
import { Reveal } from "@/components/reveal";
import { FitCalculator } from "@/components/reference/fit-calculator";
import { SteelTable } from "@/components/reference/steel-table";
import { ControlFrame, GdtGlyph, RoughnessSign } from "@/components/reference/glyphs";

export async function generateMetadata(): Promise<Metadata> {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  return {
    title: dict.reference.title,
    description: dict.reference.lead,
    alternates: alternates(locale, "/reference"),
  };
}

export default async function ReferencePage() {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  const r = dict.reference;
  const nav = [
    { id: "fits", label: r.fits, icon: Ruler },
    { id: "steels", label: r.steels, icon: Flame },
    { id: "gdt", label: r.gdt, icon: Shapes },
    { id: "roughness", label: r.roughness, icon: Waves },
    { id: "welds", label: r.welds, icon: Gauge },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 pt-14 sm:px-6">
      <Reveal>
        <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">{r.title}</h1>
        <p className="mt-3 max-w-3xl text-muted">{r.lead}</p>
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
      </Reveal>

      <Section id="fits" title={r.fits} lead={r.fitsLead}>
        {/* Reads ?fit= and ?d= from tooltip links, only known at request time. */}
        <Suspense>
          <FitCalculator locale={locale} />
        </Suspense>
      </Section>

      <Section id="steels" title={r.steels} lead={r.steelsLead}>
        <Suspense>
          <SteelTable steels={STEELS} locale={locale} />
        </Suspense>
      </Section>

      <Section id="gdt" title={r.gdt} lead={r.gdtLead}>
        <div className="grid gap-4 md:grid-cols-2">
          {(Object.keys(GDT_GROUPS) as (keyof typeof GDT_GROUPS)[]).map((g) => (
            <div key={g} className="rounded-2xl border border-line bg-surface p-4">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
                {GDT_GROUPS[g][locale]}
              </h3>
              <ul className="grid gap-1">
                {GDT.filter((s) => s.group === g).map((s) => (
                  <li
                    key={s.id}
                    className="group flex items-center gap-3 rounded-xl px-2 py-1.5 transition-colors hover:bg-surface-2"
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-line bg-surface text-ink transition-transform group-hover:scale-110 group-hover:text-accent">
                      <GdtGlyph id={s.id} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-medium">{s.name[locale]}</span>
                      <span className="block text-xs text-muted">{s.note[locale]}</span>
                    </span>
                    <span
                      className={`ml-auto shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        s.datum ? "bg-ochre-soft text-ochre" : "bg-surface-2 text-muted"
                      }`}
                    >
                      {s.datum ? r.datum : r.noDatum}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-4 rounded-2xl border border-dashed border-line px-4 py-3">
          <ControlFrame id="perpendicularity" value="0,02" datums={["А"]} />
          <ControlFrame id="position" value="⌀0,1" datums={["А", "Б"]} />
          <p className="text-xs text-muted">{r.frameExample}</p>
        </div>
      </Section>

      <Section id="roughness" title={r.roughness} lead={r.roughnessLead}>
        <div className="mb-4 grid gap-3 sm:grid-cols-3">
          {ROUGHNESS_SIGNS.map((s) => (
            <div key={s.id} className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-3">
              <span className="text-ink">
                <RoughnessSign kind={s.id} value={s.id === "removal" ? "Ra 1,6" : undefined} />
              </span>
              <span className="text-xs text-muted">{s[locale]}</span>
            </div>
          ))}
        </div>
        <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="bg-surface-2 text-xs text-muted">
              <tr>
                <th className="px-3 py-2 font-semibold">{r.ra}</th>
                <th className="px-3 py-2 font-semibold">{r.rz}</th>
                <th className="px-3 py-2 font-semibold">{r.oldClass}</th>
                <th className="px-3 py-2 font-semibold">{r.method}</th>
                <th className="px-3 py-2 font-semibold">{r.use}</th>
              </tr>
            </thead>
            <tbody>
              {ROUGHNESS.map((row) => (
                <tr key={row.ra} className="border-t border-line transition-colors hover:bg-accent-soft/40">
                  <td className="px-3 py-2 font-mono font-semibold">{row.ra.toLocaleString(locale)}</td>
                  <td className="px-3 py-2 font-mono text-muted">{row.rz.toLocaleString(locale)}</td>
                  <td className="px-3 py-2 font-mono text-muted">∇{row.oldClass}</td>
                  <td className="px-3 py-2">{row.method[locale]}</td>
                  <td className="px-3 py-2 text-muted">{row.use[locale]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section id="welds" title={r.welds} lead={r.weldsLead}>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-line bg-surface p-4">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">{r.joints}</h3>
            <ul className="grid gap-2">
              {WELD_JOINTS.map((j) => (
                <li key={j.code} className="flex gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-ochre-soft font-mono font-bold text-ochre">
                    {j.code}
                  </span>
                  <span>
                    <span className="block text-sm font-medium">{j[locale]}</span>
                    <span className="block text-xs text-muted">{j.examples[locale]}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-line bg-surface p-4">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">{r.signs}</h3>
            <ul className="grid gap-1.5">
              {WELD_SIGNS.map((s) => (
                <li key={s.sign} className="flex items-baseline gap-3 text-sm">
                  <span className="w-14 shrink-0 font-mono font-semibold">{s.sign}</span>
                  <span className="text-muted">{s[locale]}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>
    </div>
  );
}

function Section({
  id,
  title,
  lead,
  children,
}: {
  id: string;
  title: string;
  lead: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mt-16 scroll-mt-24">
      <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
      <p className="mb-6 mt-2 max-w-3xl text-sm text-muted">
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
