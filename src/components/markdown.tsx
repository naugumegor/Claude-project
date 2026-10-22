import { Children, isValidElement, type ReactElement, type ReactNode } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import type { Locale } from "@/lib/i18n";
import { slugify } from "@/lib/slug";
import { parseCards, parseQuiz } from "@/lib/study";
import { parseCalc } from "@/lib/calc";
import { parseFit } from "@/lib/fits";
import { findSteel } from "@/lib/reference-data";
import { Calc } from "./study/calc";
import { PythonRunner } from "./study/python-runner";
import { ModelViewer } from "./model-viewer";
import { embedUrl, parseModelBlock } from "@/lib/embed";
import { FitTip, SteelTip } from "./study/ref-tip";
import { Flashcards } from "./study/flashcards";
import { Quiz } from "./study/quiz";
import { GlossaryTip } from "./study/ref-tip";
import { findTerm, remarkGlossary } from "@/lib/glossary";
import { parseCanvas, parseCases, parseGantt, parseProcess, parseSql, parseTool } from "@/lib/business-blocks";
import { BusinessTool } from "./business/tools";
import { StrategyCanvas } from "./business/canvas";
import { CaseTrainer } from "./business/case-trainer";
import { ProcessBlock } from "./business/process";
import { SqlSandbox } from "./business/sql-sandbox";
import { Gantt } from "./business/gantt";

/**
 * Renders a note's Markdown body: tables, $math$, highlighted code, and the study blocks
 * ```cards (flip cards), ```quiz (mini test) and ```calc (live formula with sliders), plus the
 * business blocks ```tool, ```canvas, ```case, ```process, ```gantt and ```sql, and [[glossary]] terms.
 * h2/h3 get ids for the table of contents.
 */
export function Markdown({ children, locale = "ru" }: { children: string; locale?: Locale }) {
  // Per-render counter, so two headings with the same text still get unique ids.
  const seen = new Map<string, number>();
  const headingId = (node: ReactNode) => {
    const base = slugify(textOf(node)) || "section";
    const n = seen.get(base) ?? 0;
    seen.set(base, n + 1);
    return n ? `${base}-${n + 1}` : base;
  };

  const components: Components = {
    h2: ({ children }) => <h2 id={headingId(children)}>{children}</h2>,
    h3: ({ children }) => <h3 id={headingId(children)}>{children}</h3>,
    // Inline `H7/p6`, `Ø25 H7/p6` or a steel grade like `40Х` gets a reference tooltip.
    code: ({ children, className, ...props }) => {
      const value = typeof children === "string" ? children : null;
      if (!className && value && !value.includes("\n")) {
        if (parseFit(value)) return <FitTip code={value} locale={locale} />;
        const steel = findSteel(value);
        if (steel) return <SteelTip code={value} steel={steel} locale={locale} />;
      }
      return (
        <code className={className} {...domProps(props)}>
          {children}
        </code>
      );
    },
    dfn: ({ children, node, ...props }) => {
      const key = String((node?.properties as { dataTerm?: string } | undefined)?.dataTerm ?? textOf(children));
      const term = findTerm(key);
      if (!term) return <span {...domProps({ node, ...props })}>{children}</span>;
      return (
        <GlossaryTip term={term} locale={locale}>
          {children}
        </GlossaryTip>
      );
    },
    pre: ({ children, ...props }) => {
      const code = Children.toArray(children).find(isValidElement) as
        | ReactElement<{ className?: string; children?: ReactNode }>
        | undefined;
      const lang = code?.props.className?.match(/language-(\w+)/)?.[1];
      const raw = textOf(code?.props.children);
      if (lang === "cards") {
        const cards = parseCards(raw).map((c) => ({
          id: c.id,
          front: <Inline>{c.front}</Inline>,
          back: <Inline>{c.back}</Inline>,
          raw: { front: c.front, back: c.back },
        }));
        if (cards.length) return <Flashcards cards={cards} locale={locale} />;
      }
      if (lang === "quiz") {
        const questions = parseQuiz(raw).map((q) => ({
          id: q.id,
          question: <Inline>{q.question}</Inline>,
          options: q.options.map((o) => ({ text: <Inline>{o.text}</Inline>, correct: o.correct })),
          explanation: q.explanation ? <Inline>{q.explanation}</Inline> : undefined,
        }));
        if (questions.length) return <Quiz questions={questions} locale={locale} />;
      }
      if (lang === "calc") {
        const source = parseCalc(raw);
        const labels = {
          title: source.title ? <Inline>{source.title}</Inline> : undefined,
          values: Object.fromEntries(
            source.values.filter((v) => v.label).map((v) => [v.name, <Inline key={v.name}>{v.label}</Inline>]),
          ),
          plots: source.plots.map((p, i) => (p.label ? <Inline key={i}>{p.label}</Inline> : null)),
        };
        return <Calc source={source} labels={labels} locale={locale} />;
      }
      if (lang === "3d") {
        const model = parseModelBlock(raw);
        const embed = model && embedUrl(model.src);
        if (embed) {
          return (
            <figure className="not-prose my-8 overflow-hidden rounded-2xl border border-line bg-surface">
              <iframe
                src={embed}
                title={model.title || "3D"}
                allow="autoplay; fullscreen; xr-spatial-tracking"
                allowFullScreen
                loading="lazy"
                className="block aspect-[4/3] w-full sm:aspect-video"
              />
              {model.title && <figcaption className="px-4 py-2 text-xs font-medium">{model.title}</figcaption>}
            </figure>
          );
        }
        if (model) return <ModelViewer src={model.src} title={model.title} locale={locale} />;
      }
      if (lang === "tool") {
        const tool = parseTool(raw);
        if (tool) return <BusinessTool name={tool.name} params={tool.params} locale={locale} />;
      }
      if (lang === "canvas") {
        const canvas = parseCanvas(raw);
        if (canvas) return <StrategyCanvas source={canvas} locale={locale} />;
      }
      if (lang === "case") {
        const cases = parseCases(raw).map((c) => ({
          id: c.id,
          situation: <Inline>{c.situation}</Inline>,
          options: c.options.map((o) => ({
            verdict: o.verdict,
            text: <Inline>{o.text}</Inline>,
            why: o.why ? <Inline>{o.why}</Inline> : undefined,
          })),
        }));
        if (cases.length) return <CaseTrainer cases={cases} locale={locale} />;
      }
      if (lang === "process") {
        const process = parseProcess(raw);
        if (process) {
          return (
            <ProcessBlock
              type={process.type}
              title={process.title ? <Inline>{process.title}</Inline> : undefined}
              steps={process.steps.map((s) => ({
                ...s,
                title: <Inline>{s.title}</Inline>,
                description: s.description ? <Inline>{s.description}</Inline> : undefined,
              }))}
              locale={locale}
            />
          );
        }
      }
      if (lang === "gantt") {
        const gantt = parseGantt(raw);
        if (gantt.tasks.length) return <Gantt source={gantt} locale={locale} />;
      }
      if (lang === "sql") {
        const sql = parseSql(raw);
        return <SqlSandbox setup={sql.setup} query={sql.query} locale={locale} />;
      }
      if (lang === "python" || lang === "py") {
        return (
          <PythonRunner code={raw} locale={locale}>
            <pre {...domProps(props)}>{children}</pre>
          </PythonRunner>
        );
      }
      return <pre {...domProps(props)}>{children}</pre>;
    },
  };

  return (
    <div className="prose-ingenium">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath, remarkGlossary]}
        rehypePlugins={[rehypeKatex, [rehypeHighlight, { detect: true, plainText: PLAIN }]]}
        components={components}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}

// Blocks we render ourselves: the highlighter must leave their text alone.
const PLAIN = ["cards", "quiz", "calc", "3d", "tool", "canvas", "case", "process", "gantt", "sql"];

/** One line of Markdown (bold, `code`, $math$) without the wrapping paragraph. */
function Inline({ children }: { children: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={{ p: ({ children }) => <>{children}</> }}
    >
      {children}
    </ReactMarkdown>
  );
}

/** react-markdown passes its AST node along; it must not end up as a DOM attribute. */
function domProps<T extends { node?: unknown }>({ node, ...rest }: T) {
  void node;
  return rest;
}

function textOf(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) return textOf(node.props.children);
  return "";
}
