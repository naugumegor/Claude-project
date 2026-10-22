import { Children, isValidElement, type ReactElement, type ReactNode } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import type { Locale } from "@/lib/i18n";
import { slugify } from "@/lib/slug";
import { parseCards, parseQuiz } from "@/lib/study";
import { Flashcards } from "./study/flashcards";
import { Quiz } from "./study/quiz";

/**
 * Renders a note's Markdown body: tables, $math$, highlighted code, and the study blocks
 * ```cards (flip cards) and ```quiz (mini test). h2/h3 get ids for the table of contents.
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
      return <pre {...props}>{children}</pre>;
    },
  };

  return (
    <div className="prose-ingenium">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex, [rehypeHighlight, { detect: true, plainText: ["cards", "quiz"] }]]}
        components={components}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}

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

function textOf(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) return textOf(node.props.children);
  return "";
}
