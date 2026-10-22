"use client";

import { LayoutGrid, Printer, RotateCcw } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { CANVAS_KEYS, type CanvasSource, type CanvasType } from "@/lib/business-blocks";
import { hashKey, useStored } from "@/lib/use-stored";
import { BlockFrame, FrameButton, escapeHtml, printHtml } from "./frame";

// A fillable strategy canvas (SWOT, PESTEL, Porter's five forces, Lean Canvas). What the reader
// types is kept in this browser, and "PDF" prints a clean A4 sheet of it.

type Cell = { label: string; hint: string };

const NAMES: Record<Locale, Record<CanvasType, string>> = {
  ru: { swot: "SWOT-анализ", pestel: "PESTEL-анализ", porter: "Пять сил Портера", lean: "Lean Canvas" },
  en: { swot: "SWOT analysis", pestel: "PESTEL analysis", porter: "Porter's five forces", lean: "Lean Canvas" },
};

const CELLS: Record<Locale, Record<string, Cell>> = {
  ru: {
    strengths: { label: "Сильные стороны", hint: "Что у нас получается лучше, чем у других?" },
    weaknesses: { label: "Слабые стороны", hint: "Где мы проигрываем, чего не хватает?" },
    opportunities: { label: "Возможности", hint: "Какие тренды и окна снаружи можно использовать?" },
    threats: { label: "Угрозы", hint: "Что снаружи может навредить?" },
    political: { label: "Политика", hint: "Регулирование, госполитика, стабильность" },
    economic: { label: "Экономика", hint: "Курс, ставки, инфляция, спрос" },
    social: { label: "Общество", hint: "Демография, привычки, ценности" },
    technological: { label: "Технологии", hint: "Новые решения, автоматизация, R&D" },
    environmental: { label: "Экология", hint: "Климат, ресурсы, ESG-требования" },
    legal: { label: "Право", hint: "Законы, стандарты, лицензии" },
    entrants: { label: "Угроза новых игроков", hint: "Насколько легко войти на рынок?" },
    suppliers: { label: "Сила поставщиков", hint: "Можем ли мы сменить поставщика?" },
    rivalry: { label: "Конкуренция в отрасли", hint: "Сколько игроков, как жёстко бьются?" },
    buyers: { label: "Сила покупателей", hint: "Могут ли клиенты диктовать цену?" },
    substitutes: { label: "Угроза заменителей", hint: "Чем ещё можно закрыть ту же потребность?" },
    problem: { label: "Проблема", hint: "Три главные боли клиента" },
    solution: { label: "Решение", hint: "Как закрываем каждую боль" },
    uvp: { label: "Уникальное ценностное предложение", hint: "Одна фраза: почему мы" },
    advantage: { label: "Скрытое преимущество", hint: "То, что нельзя просто скопировать" },
    segments: { label: "Сегменты клиентов", hint: "Кто платит, кто первые пользователи" },
    metrics: { label: "Ключевые метрики", hint: "По каким цифрам видно рост" },
    channels: { label: "Каналы", hint: "Как клиент о нас узнаёт и покупает" },
    costs: { label: "Структура затрат", hint: "Постоянные и переменные расходы" },
    revenue: { label: "Потоки доходов", hint: "За что и как платят" },
  },
  en: {
    strengths: { label: "Strengths", hint: "What do we do better than others?" },
    weaknesses: { label: "Weaknesses", hint: "Where do we lose, what is missing?" },
    opportunities: { label: "Opportunities", hint: "Which outside trends can we use?" },
    threats: { label: "Threats", hint: "What outside could hurt us?" },
    political: { label: "Political", hint: "Regulation, government policy, stability" },
    economic: { label: "Economic", hint: "Exchange rates, interest, inflation, demand" },
    social: { label: "Social", hint: "Demographics, habits, values" },
    technological: { label: "Technological", hint: "New solutions, automation, R&D" },
    environmental: { label: "Environmental", hint: "Climate, resources, ESG rules" },
    legal: { label: "Legal", hint: "Laws, standards, licences" },
    entrants: { label: "Threat of new entrants", hint: "How easy is it to enter the market?" },
    suppliers: { label: "Supplier power", hint: "Can we switch suppliers?" },
    rivalry: { label: "Industry rivalry", hint: "How many players, how hard do they fight?" },
    buyers: { label: "Buyer power", hint: "Can customers dictate the price?" },
    substitutes: { label: "Threat of substitutes", hint: "What else meets the same need?" },
    problem: { label: "Problem", hint: "Top three customer pains" },
    solution: { label: "Solution", hint: "How we solve each pain" },
    uvp: { label: "Unique value proposition", hint: "One line: why us" },
    advantage: { label: "Unfair advantage", hint: "What can't simply be copied" },
    segments: { label: "Customer segments", hint: "Who pays, who are the early adopters" },
    metrics: { label: "Key metrics", hint: "Which numbers show growth" },
    channels: { label: "Channels", hint: "How customers find us and buy" },
    costs: { label: "Cost structure", hint: "Fixed and variable costs" },
    revenue: { label: "Revenue streams", hint: "What they pay for and how" },
  },
};

const UI = {
  ru: { reset: "Очистить", pdf: "PDF", saved: "Сохраняется в этом браузере", confirm: "Стереть всё, что вы написали?" },
  en: { reset: "Clear", pdf: "PDF", saved: "Saved in this browser", confirm: "Erase everything you wrote?" },
};

// Grid placement per cell on wide screens; on phones the cells simply stack.
const LAYOUT: Record<CanvasType, { grid: string; cells: Record<string, string> }> = {
  swot: {
    grid: "sm:grid-cols-2",
    cells: { strengths: "", weaknesses: "", opportunities: "", threats: "" },
  },
  pestel: {
    grid: "sm:grid-cols-2 lg:grid-cols-3",
    cells: { political: "", economic: "", social: "", technological: "", environmental: "", legal: "" },
  },
  porter: {
    grid: "md:grid-cols-3",
    cells: {
      entrants: "md:col-start-2",
      suppliers: "md:col-start-1 md:row-start-2",
      rivalry: "md:col-start-2 md:row-start-2",
      buyers: "md:col-start-3 md:row-start-2",
      substitutes: "md:col-start-2 md:row-start-3",
    },
  },
  lean: {
    grid: "md:grid-cols-10",
    cells: {
      problem: "md:col-span-2 md:row-span-2",
      solution: "md:col-span-2",
      uvp: "md:col-span-2 md:row-span-2",
      advantage: "md:col-span-2",
      segments: "md:col-span-2 md:row-span-2 md:col-start-9 md:row-start-1",
      metrics: "md:col-span-2 md:col-start-3 md:row-start-2",
      channels: "md:col-span-2 md:col-start-7 md:row-start-2",
      costs: "md:col-span-5",
      revenue: "md:col-span-5",
    },
  },
};

const TONES = ["border-accent/40", "border-rose/40", "border-plum/40", "border-ochre/40"];
const SWOT_TONES: Record<string, string> = {
  strengths: "border-accent/50 bg-accent-soft/40",
  weaknesses: "border-rose/50 bg-rose-soft/40",
  opportunities: "border-plum/50 bg-plum-soft/40",
  threats: "border-ochre/50 bg-ochre-soft/40",
};

export function StrategyCanvas({
  source,
  locale,
  storageKey,
}: {
  source: CanvasSource;
  locale: Locale;
  /** Overrides the storage key; by default it is derived from the block's contents. */
  storageKey?: string;
}) {
  const keys = CANVAS_KEYS[source.type];
  const key = storageKey ?? `ingenium:canvas:${source.type}:${hashKey(source.title + JSON.stringify(source.prefill))}`;
  const [values, setValues, clear] = useStored<Record<string, string>>(key, source.prefill);
  const cells = CELLS[locale];
  const ui = UI[locale];
  const title = source.title || NAMES[locale][source.type];
  const layout = LAYOUT[source.type];

  const print = () => {
    const cols = { swot: 2, pestel: 3, porter: 3, lean: 5 }[source.type];
    const body = keys
      .map(
        (k) =>
          `<div class="cell"><h2>${escapeHtml(cells[k].label)}</h2><p>${escapeHtml(values[k] ?? "")}</p></div>`,
      )
      .join("");
    printHtml(
      title,
      `<h1>${escapeHtml(title)}</h1><p class="sub">${escapeHtml(NAMES[locale][source.type])} · Ingenium</p>` +
        `<div class="grid" style="grid-template-columns:repeat(${cols},1fr)">${body}</div>`,
    );
  };

  return (
    <BlockFrame
      icon={LayoutGrid}
      tone="plum"
      title={title}
      actions={
        <>
          <FrameButton
            onClick={() => {
              if (window.confirm(ui.confirm)) clear();
            }}
          >
            <RotateCcw size={14} className="transition-transform group-hover:-rotate-90" />
            {ui.reset}
          </FrameButton>
          <FrameButton onClick={print}>
            <Printer size={14} />
            {ui.pdf}
          </FrameButton>
        </>
      }
    >
      <div className={`grid gap-2.5 ${layout.grid}`}>
        {keys.map((k, i) => (
          <label
            key={k}
            className={`group flex min-h-36 flex-col rounded-xl border-2 p-3 transition-colors focus-within:border-accent ${
              source.type === "swot" ? SWOT_TONES[k] : `${TONES[i % TONES.length]} bg-surface-2/50`
            } ${layout.cells[k] ?? ""}`}
          >
            <span className="flex items-baseline gap-2">
              {source.type === "swot" && (
                <span className="font-display text-lg font-extrabold leading-none opacity-60">{k[0].toUpperCase()}</span>
              )}
              <span className="text-xs font-bold uppercase tracking-wide">{cells[k].label}</span>
            </span>
            <textarea
              value={values[k] ?? ""}
              onChange={(e) => setValues((v) => ({ ...v, [k]: e.target.value }))}
              placeholder={cells[k].hint}
              className="mt-1.5 w-full flex-1 resize-none bg-transparent text-sm leading-relaxed outline-none placeholder:text-muted/70 [field-sizing:content]"
              rows={3}
            />
          </label>
        ))}
      </div>
      <p className="no-print mt-2 text-[11px] text-muted">{ui.saved}</p>
    </BlockFrame>
  );
}
