"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Calculator, Plus, RotateCcw, X } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { formatNumber, irr, niceStep, npv } from "@/lib/calc";
import { MiniChart, type ChartSeries } from "./chart";
import type { ToolName } from "@/lib/business-blocks";

// Business calculators. Each one works on the /tools page and inside notes as
//   ```tool
//   name: cashflow
//   rate: 12
//   flows: -1000, 300, 400, 500, 200
//   ```
// Percentages are plain numbers (12 means 12 %).

type Params = Record<string, string>;
type Tone = "good" | "warn" | "bad" | "plain";

const T = {
  ru: {
    reset: "Сбросить",
    cashflow: {
      title: "NPV, IRR и окупаемость",
      rate: "Ставка дисконтирования",
      year: "Год",
      add: "Год",
      npv: "NPV",
      irr: "IRR",
      pi: "Индекс доходности",
      dpp: "Дисконтированная окупаемость",
      never: "не окупается",
      years: "лет",
      flows: "Денежный поток",
      cumulative: "Накопленный дисконтированный",
      verdict: (ok: boolean) => (ok ? "Проект создаёт стоимость" : "Проект уничтожает стоимость"),
    },
    unit: {
      title: "Юнит-экономика",
      arpu: "Выручка с клиента в месяц (ARPU)",
      margin: "Маржинальность",
      churn: "Отток в месяц",
      cac: "Стоимость привлечения (CAC)",
      ltv: "LTV",
      ratio: "LTV / CAC",
      payback: "Окупаемость CAC",
      months: "мес.",
      profit: "Прибыль с клиента нарастающим итогом",
      verdict: (r: number) =>
        r >= 3 ? "Экономика сходится" : r >= 1 ? "На грани: мало запаса" : "Каждый клиент в минус",
      x: "месяц",
    },
    breakeven: {
      title: "Точка безубыточности",
      fixed: "Постоянные затраты за период",
      price: "Цена единицы",
      variable: "Переменные затраты на единицу",
      volume: "Плановый объём",
      bep: "Безубыточный объём",
      bepRevenue: "Выручка в точке",
      safety: "Запас прочности",
      leverage: "Операционный рычаг",
      units: "шт.",
      revenue: "Выручка",
      costs: "Полные затраты",
      verdict: (ok: boolean) => (ok ? "План выше точки безубыточности" : "План ниже точки: убыток"),
      x: "объём, шт.",
      noMargin: "Цена не покрывает переменные затраты",
    },
    demand: {
      title: "Спрос и предложение",
      a: "Спрос: цена при Q = 0 (a)",
      b: "Спрос: наклон (b)",
      c: "Предложение: цена при Q = 0 (c)",
      d: "Предложение: наклон (d)",
      q: "Равновесный объём",
      p: "Равновесная цена",
      e: "Эластичность спроса в точке",
      cs: "Излишек потребителя",
      ps: "Излишек производителя",
      demand: "Спрос",
      supply: "Предложение",
      none: "Кривые не пересекаются при Q > 0",
      x: "Q",
      y: "P",
    },
    wacc: {
      title: "WACC",
      equity: "Собственный капитал (E)",
      debt: "Заёмный капитал (D)",
      re: "Стоимость собственного капитала",
      rd: "Ставка по долгу",
      tax: "Налог на прибыль",
      wacc: "WACC",
      we: "Доля E",
      wd: "Доля D",
      shield: "Налоговый щит долга",
    },
  },
  en: {
    reset: "Reset",
    cashflow: {
      title: "NPV, IRR and payback",
      rate: "Discount rate",
      year: "Year",
      add: "Year",
      npv: "NPV",
      irr: "IRR",
      pi: "Profitability index",
      dpp: "Discounted payback",
      never: "never",
      years: "yrs",
      flows: "Cash flow",
      cumulative: "Cumulative discounted",
      verdict: (ok: boolean) => (ok ? "The project creates value" : "The project destroys value"),
    },
    unit: {
      title: "Unit economics",
      arpu: "Monthly revenue per customer (ARPU)",
      margin: "Gross margin",
      churn: "Monthly churn",
      cac: "Customer acquisition cost (CAC)",
      ltv: "LTV",
      ratio: "LTV / CAC",
      payback: "CAC payback",
      months: "mo",
      profit: "Cumulative profit per customer",
      verdict: (r: number) => (r >= 3 ? "The economics work" : r >= 1 ? "Borderline: thin margin" : "Every customer loses money"),
      x: "month",
    },
    breakeven: {
      title: "Break-even point",
      fixed: "Fixed costs per period",
      price: "Unit price",
      variable: "Variable cost per unit",
      volume: "Planned volume",
      bep: "Break-even volume",
      bepRevenue: "Break-even revenue",
      safety: "Margin of safety",
      leverage: "Operating leverage",
      units: "units",
      revenue: "Revenue",
      costs: "Total costs",
      verdict: (ok: boolean) => (ok ? "Plan is above break-even" : "Plan is below break-even: a loss"),
      x: "volume, units",
      noMargin: "Price doesn't cover variable cost",
    },
    demand: {
      title: "Supply and demand",
      a: "Demand: price at Q = 0 (a)",
      b: "Demand: slope (b)",
      c: "Supply: price at Q = 0 (c)",
      d: "Supply: slope (d)",
      q: "Equilibrium quantity",
      p: "Equilibrium price",
      e: "Point price elasticity",
      cs: "Consumer surplus",
      ps: "Producer surplus",
      demand: "Demand",
      supply: "Supply",
      none: "Curves don't cross at Q > 0",
      x: "Q",
      y: "P",
    },
    wacc: {
      title: "WACC",
      equity: "Equity (E)",
      debt: "Debt (D)",
      re: "Cost of equity",
      rd: "Cost of debt",
      tax: "Tax rate",
      wacc: "WACC",
      we: "E weight",
      wd: "D weight",
      shield: "Debt tax shield",
    },
  },
};

const num = (v: string | undefined, fallback: number) => {
  const n = Number(String(v ?? "").replace(",", ".").replace(/\s/g, ""));
  return v !== undefined && Number.isFinite(n) ? n : fallback;
};

export function BusinessTool({ name, params = {}, locale }: { name: ToolName; params?: Params; locale: Locale }) {
  const Tool = { cashflow: Cashflow, unit: UnitEconomics, breakeven: BreakEven, demand: Demand, wacc: Wacc }[name];
  return <Tool params={params} locale={locale} />;
}

function Card({
  title,
  onReset,
  resetLabel,
  children,
}: {
  title: string;
  onReset: () => void;
  resetLabel: string;
  children: React.ReactNode;
}) {
  return (
    <div className="not-prose calc-block my-8 rounded-2xl border border-line bg-surface p-4 sm:p-5">
      <div className="mb-4 flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-lg bg-ochre-soft text-ochre">
          <Calculator size={16} />
        </span>
        <span className="font-display font-bold">{title}</span>
        <button
          type="button"
          onClick={onReset}
          className="no-print group ml-auto inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-muted transition-colors hover:bg-accent-soft hover:text-accent"
        >
          <RotateCcw size={14} className="transition-transform group-hover:-rotate-90" />
          {resetLabel}
        </button>
      </div>
      {children}
    </div>
  );
}

/** A labelled slider with a typed-in number next to it. */
function Field({
  label,
  value,
  onChange,
  min,
  max,
  unit,
  locale,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  unit?: string;
  locale: Locale;
}) {
  const hi = Math.max(max, value);
  return (
    <label className="block">
      <span className="flex items-baseline gap-2 text-sm">
        <span className="min-w-0 truncate text-muted">{label}</span>
        <span className="ml-auto flex shrink-0 items-baseline gap-1">
          <input
            type="number"
            value={Number.isFinite(value) ? value : ""}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-24 rounded-md border border-transparent bg-transparent px-1 text-right font-mono font-semibold tabular-nums outline-none hover:border-line focus:border-accent"
            aria-label={label}
          />
          {unit && <span className="text-muted">{unit}</span>}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={hi}
        step={niceStep(hi - min)}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="calc-range mt-1.5 w-full"
        aria-hidden
        tabIndex={-1}
      />
      <span className="sr-only">{formatNumber(value, locale)}</span>
    </label>
  );
}

function Stats({ items }: { items: { label: string; value: string; tone?: Tone }[] }) {
  const tones: Record<Tone, string> = {
    good: "border-accent bg-accent-soft",
    warn: "border-ochre bg-ochre-soft",
    bad: "border-rose bg-rose-soft",
    plain: "border-line bg-surface-2",
  };
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {items.map((s) => (
        <div key={s.label} className={`rounded-xl border px-3 py-2 transition-colors ${tones[s.tone ?? "plain"]}`}>
          <div className="text-xs text-muted">{s.label}</div>
          <motion.div
            key={s.value}
            initial={{ opacity: 0.4, y: -2 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-mono text-sm font-semibold tabular-nums"
          >
            {s.value}
          </motion.div>
        </div>
      ))}
    </div>
  );
}

function Verdict({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  const dot = { good: "bg-accent", warn: "bg-ochre", bad: "bg-rose", plain: "bg-muted" }[tone];
  return (
    <p className="mt-3 flex items-center gap-2 text-sm font-medium">
      <motion.span
        key={tone}
        initial={{ scale: 0.4 }}
        animate={{ scale: [1.4, 1] }}
        className={`size-3 rounded-full ${dot} shadow-[0_0_0_4px_color-mix(in_oklab,currentColor_8%,transparent)]`}
      />
      {children}
    </p>
  );
}

/** useState for a group of numbers that can snap back to the block's defaults. */
function useNumbers<K extends string>(defaults: Record<K, number>) {
  const [v, setV] = useState(defaults);
  const set = (k: K) => (x: number) => setV((p) => ({ ...p, [k]: x }));
  return [v, set, () => setV(defaults)] as const;
}

const pct = (x: number, locale: Locale) => (Number.isFinite(x) ? `${formatNumber(x * 100, locale)} %` : "—");

// Discounted cumulative cash flow, the present value of all outflows and the discounted payback period.
function discounted(flows: number[], r: number) {
  const cumulative: [number, number][] = [];
  let cum = 0;
  let invest = 0;
  let dpp = NaN;
  flows.forEach((f, t) => {
    const pv = f / (1 + r) ** t;
    if (f < 0) invest -= pv;
    const prev = cum;
    cum += pv;
    if (Number.isNaN(dpp) && prev < 0 && cum >= 0) dpp = t - 1 + -prev / (cum - prev);
    cumulative.push([t, cum]);
  });
  return { invest, cumulative, dpp };
}

function Cashflow({ params, locale }: { params: Params; locale: Locale }) {
  const t = T[locale].cashflow;
  const initialFlows = (params.flows ?? "-1000, 300, 400, 500, 200")
    .split(/[,;]\s*/)
    .map((x) => num(x, 0));
  const initialRate = num(params.rate, 12);
  const [rate, setRate] = useState(initialRate);
  const [flows, setFlows] = useState(initialFlows);
  const r = rate / 100;

  const value = npv(r, flows);
  const rr = irr(flows);
  const { invest, cumulative, dpp } = discounted(flows, r);
  const pi = invest > 0 ? (value + invest) / invest : NaN;
  const tone: Tone = value >= 0 ? "good" : "bad";

  return (
    <Card
      title={t.title}
      resetLabel={T[locale].reset}
      onReset={() => {
        setRate(initialRate);
        setFlows(initialFlows);
      }}
    >
      <Field label={t.rate} value={rate} onChange={setRate} min={0} max={40} unit="%" locale={locale} />
      <div className="mt-4 flex flex-wrap gap-2">
        <AnimatePresence initial={false}>
          {flows.map((f, i) => (
            <motion.label
              key={i}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`group relative flex w-24 flex-col rounded-xl border px-2 py-1.5 ${
                f < 0 ? "border-rose/50 bg-rose-soft/50" : "border-line bg-surface-2"
              }`}
            >
              <span className="text-[10px] text-muted">
                {t.year} {i}
              </span>
              <input
                type="number"
                value={f}
                onChange={(e) => setFlows((fl) => fl.map((x, j) => (j === i ? Number(e.target.value) : x)))}
                className="w-full bg-transparent font-mono text-sm font-semibold tabular-nums outline-none"
              />
              {flows.length > 2 && i === flows.length - 1 && (
                <button
                  type="button"
                  aria-label="×"
                  onClick={() => setFlows((fl) => fl.slice(0, -1))}
                  className="absolute -right-1.5 -top-1.5 hidden size-5 items-center justify-center rounded-full bg-surface text-muted shadow group-hover:flex hover:text-rose"
                >
                  <X size={12} />
                </button>
              )}
            </motion.label>
          ))}
        </AnimatePresence>
        <button
          type="button"
          onClick={() => setFlows((fl) => [...fl, fl[fl.length - 1] ?? 0])}
          className="no-print flex w-16 items-center justify-center gap-1 rounded-xl border border-dashed border-line text-xs text-muted transition-colors hover:border-accent hover:text-accent"
        >
          <Plus size={13} />
          {t.add}
        </button>
      </div>
      <Stats
        items={[
          { label: t.npv, value: formatNumber(value, locale), tone },
          { label: t.irr, value: pct(rr, locale), tone: Number.isFinite(rr) ? (rr >= r ? "good" : "bad") : "plain" },
          { label: t.pi, value: Number.isFinite(pi) ? formatNumber(pi, locale) : "—" },
          { label: t.dpp, value: Number.isFinite(dpp) ? `${formatNumber(dpp, locale)} ${t.years}` : t.never },
        ]}
      />
      <Verdict tone={tone}>{t.verdict(value >= 0)}</Verdict>
      <MiniChart
        locale={locale}
        series={[
          { kind: "bars", label: t.flows, color: "var(--accent)", points: flows.map((f, i) => [i, f]) },
          { kind: "line", label: t.cumulative, color: "var(--ochre)", points: cumulative },
        ]}
        markers={Number.isFinite(dpp) ? [{ x: dpp, label: t.dpp }] : []}
        xFormat={(x) => String(Math.round(x))}
        axes={[t.year, ""]}
      />
    </Card>
  );
}

function UnitEconomics({ params, locale }: { params: Params; locale: Locale }) {
  const t = T[locale].unit;
  const [v, set, reset] = useNumbers({
    arpu: num(params.arpu, 1000),
    margin: num(params.margin, 60),
    churn: num(params.churn, 8),
    cac: num(params.cac, 3000),
  });
  const contribution = (v.arpu * v.margin) / 100;
  const churn = v.churn / 100;
  const ltv = churn > 0 ? contribution / churn : Infinity;
  const ratio = ltv / v.cac;
  const payback = contribution > 0 ? v.cac / contribution : Infinity;
  const tone: Tone = ratio >= 3 ? "good" : ratio >= 1 ? "warn" : "bad";
  // Expected profit from one customer: each month earns the margin while they stay.
  const horizon = Math.min(60, Math.max(12, Math.ceil(Math.min(payback * 1.6, 60))));
  let acc = -v.cac;
  const curve: [number, number][] = [[0, acc]];
  for (let m = 1; m <= horizon; m++) {
    acc += contribution * (1 - churn) ** (m - 1);
    curve.push([m, acc]);
  }
  const cross = curve.findIndex(([, y]) => y >= 0);

  return (
    <Card title={t.title} resetLabel={T[locale].reset} onReset={reset}>
      <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
        <Field label={t.arpu} value={v.arpu} onChange={set("arpu")} min={0} max={10000} locale={locale} />
        <Field label={t.margin} value={v.margin} onChange={set("margin")} min={0} max={100} unit="%" locale={locale} />
        <Field label={t.churn} value={v.churn} onChange={set("churn")} min={0.5} max={30} unit="%" locale={locale} />
        <Field label={t.cac} value={v.cac} onChange={set("cac")} min={0} max={30000} locale={locale} />
      </div>
      <Stats
        items={[
          { label: t.ltv, value: formatNumber(ltv, locale) },
          { label: t.ratio, value: Number.isFinite(ratio) ? `${formatNumber(ratio, locale)}×` : "∞", tone },
          { label: t.payback, value: Number.isFinite(payback) ? `${formatNumber(payback, locale)} ${t.months}` : "∞" },
        ]}
      />
      <Verdict tone={tone}>{t.verdict(ratio)}</Verdict>
      <MiniChart
        locale={locale}
        series={[{ kind: "line", label: t.profit, color: "var(--accent)", points: curve }]}
        markers={cross > 0 ? [{ x: cross, label: t.payback }] : []}
        xFormat={(x) => String(Math.round(x))}
        axes={[t.x, ""]}
      />
    </Card>
  );
}

function BreakEven({ params, locale }: { params: Params; locale: Locale }) {
  const t = T[locale].breakeven;
  const [v, set, reset] = useNumbers({
    fixed: num(params.fixed, 500000),
    price: num(params.price, 1500),
    variable: num(params.variable, 900),
    volume: num(params.volume, 1200),
  });
  const unitMargin = v.price - v.variable;
  const bep = unitMargin > 0 ? v.fixed / unitMargin : NaN;
  const safety = Number.isFinite(bep) && v.volume > 0 ? (v.volume - bep) / v.volume : NaN;
  const profit = unitMargin * v.volume - v.fixed;
  const leverage = profit !== 0 ? (unitMargin * v.volume) / profit : NaN;
  const ok = Number.isFinite(bep) && v.volume >= bep;
  const qMax = Math.max(v.volume, Number.isFinite(bep) ? bep : 0) * 1.5 || 100;
  const qs = Array.from({ length: 41 }, (_, i) => (qMax * i) / 40);

  return (
    <Card title={t.title} resetLabel={T[locale].reset} onReset={reset}>
      <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
        <Field label={t.fixed} value={v.fixed} onChange={set("fixed")} min={0} max={2000000} locale={locale} />
        <Field label={t.volume} value={v.volume} onChange={set("volume")} min={0} max={5000} unit={t.units} locale={locale} />
        <Field label={t.price} value={v.price} onChange={set("price")} min={0} max={5000} locale={locale} />
        <Field label={t.variable} value={v.variable} onChange={set("variable")} min={0} max={5000} locale={locale} />
      </div>
      {unitMargin > 0 ? (
        <>
          <Stats
            items={[
              { label: t.bep, value: `${formatNumber(Math.ceil(bep), locale)} ${t.units}`, tone: ok ? "good" : "bad" },
              { label: t.bepRevenue, value: formatNumber(bep * v.price, locale) },
              { label: t.safety, value: pct(safety, locale), tone: ok ? "good" : "bad" },
              { label: t.leverage, value: Number.isFinite(leverage) ? formatNumber(leverage, locale) : "—" },
            ]}
          />
          <Verdict tone={ok ? "good" : "bad"}>{t.verdict(ok)}</Verdict>
        </>
      ) : (
        <Verdict tone="bad">{t.noMargin}</Verdict>
      )}
      <MiniChart
        locale={locale}
        series={[
          { kind: "line", label: t.revenue, color: "var(--accent)", points: qs.map((q) => [q, q * v.price]) },
          { kind: "line", label: t.costs, color: "var(--rose)", points: qs.map((q) => [q, v.fixed + q * v.variable]) },
        ]}
        markers={[
          ...(Number.isFinite(bep) ? [{ x: bep, label: t.bep }] : []),
          { x: v.volume, label: t.volume, color: "var(--plum)" },
        ]}
        axes={[t.x, ""]}
      />
    </Card>
  );
}

function Demand({ params, locale }: { params: Params; locale: Locale }) {
  const t = T[locale].demand;
  const [v, set, reset] = useNumbers({
    a: num(params.a, 100),
    b: num(params.b, 2),
    c: num(params.c, 10),
    d: num(params.d, 1),
  });
  const q = (v.a - v.c) / (v.b + v.d);
  const p = v.a - v.b * q;
  const ok = q > 0 && v.b > 0 && v.d >= 0;
  const elasticity = ok ? -(1 / v.b) * (p / q) : NaN;
  const qMax = ok ? q * 2 : Math.max(1, v.a / Math.max(v.b, 0.01));
  const qs = Array.from({ length: 41 }, (_, i) => (qMax * i) / 40);

  return (
    <Card title={t.title} resetLabel={T[locale].reset} onReset={reset}>
      <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
        <Field label={t.a} value={v.a} onChange={set("a")} min={0} max={500} locale={locale} />
        <Field label={t.c} value={v.c} onChange={set("c")} min={0} max={500} locale={locale} />
        <Field label={t.b} value={v.b} onChange={set("b")} min={0.1} max={10} locale={locale} />
        <Field label={t.d} value={v.d} onChange={set("d")} min={0} max={10} locale={locale} />
      </div>
      {ok ? (
        <Stats
          items={[
            { label: t.q, value: formatNumber(q, locale), tone: "good" },
            { label: t.p, value: formatNumber(p, locale), tone: "good" },
            { label: t.e, value: formatNumber(elasticity, locale), tone: Math.abs(elasticity) > 1 ? "warn" : "plain" },
            { label: t.cs, value: formatNumber(((v.a - p) * q) / 2, locale) },
            { label: t.ps, value: formatNumber(((p - v.c) * q) / 2, locale) },
          ]}
        />
      ) : (
        <Verdict tone="bad">{t.none}</Verdict>
      )}
      <MiniChart
        locale={locale}
        series={[
          ...(ok
            ? ([
                { kind: "area", label: t.cs, color: "var(--accent)", points: [[0, v.a], [q, p], [0, p]] },
                { kind: "area", label: t.ps, color: "var(--ochre)", points: [[0, p], [q, p], [0, v.c]] },
              ] satisfies ChartSeries[])
            : []),
          { kind: "line", label: t.demand, color: "var(--accent)", points: qs.map((x) => [x, v.a - v.b * x]) },
          { kind: "line", label: t.supply, color: "var(--ochre)", points: qs.map((x) => [x, v.c + v.d * x]) },
        ]}
        markers={ok ? [{ x: q, label: `Q* = ${formatNumber(q, locale)}` }] : []}
        axes={[t.x, t.y]}
      />
    </Card>
  );
}

function Wacc({ params, locale }: { params: Params; locale: Locale }) {
  const t = T[locale].wacc;
  const [v, set, reset] = useNumbers({
    equity: num(params.equity, 600),
    debt: num(params.debt, 400),
    re: num(params.re, 18),
    rd: num(params.rd, 12),
    tax: num(params.tax, 25),
  });
  const total = v.equity + v.debt || 1;
  const we = v.equity / total;
  const wd = v.debt / total;
  const wacc = we * v.re + wd * v.rd * (1 - v.tax / 100);
  const shield = wd * v.rd * (v.tax / 100);

  return (
    <Card title={t.title} resetLabel={T[locale].reset} onReset={reset}>
      <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
        <Field label={t.equity} value={v.equity} onChange={set("equity")} min={0} max={5000} locale={locale} />
        <Field label={t.debt} value={v.debt} onChange={set("debt")} min={0} max={5000} locale={locale} />
        <Field label={t.re} value={v.re} onChange={set("re")} min={0} max={50} unit="%" locale={locale} />
        <Field label={t.rd} value={v.rd} onChange={set("rd")} min={0} max={40} unit="%" locale={locale} />
        <Field label={t.tax} value={v.tax} onChange={set("tax")} min={0} max={50} unit="%" locale={locale} />
      </div>
      <Stats
        items={[
          { label: t.wacc, value: `${formatNumber(wacc, locale)} %`, tone: "good" },
          { label: t.we, value: pct(we, locale) },
          { label: t.wd, value: pct(wd, locale) },
          { label: t.shield, value: `${formatNumber(shield, locale)} п.п.`.replace(" п.п.", locale === "ru" ? " п.п." : " pp") },
        ]}
      />
      {/* Capital structure as one bar: equity and debt shares with their after-tax costs. */}
      <div className="mt-5 flex h-9 overflow-hidden rounded-xl text-xs font-semibold">
        <motion.div
          animate={{ width: `${we * 100}%` }}
          className="flex items-center justify-center overflow-hidden whitespace-nowrap bg-accent text-accent-ink"
        >
          E · {formatNumber(v.re, locale)} %
        </motion.div>
        <motion.div
          animate={{ width: `${wd * 100}%` }}
          className="flex items-center justify-center overflow-hidden whitespace-nowrap bg-ochre text-white"
        >
          D · {formatNumber(v.rd * (1 - v.tax / 100), locale)} %
        </motion.div>
      </div>
    </Card>
  );
}
