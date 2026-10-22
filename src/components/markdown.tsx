import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";

/** Renders a note's Markdown body, including tables, $math$ and highlighted code blocks. */
export function Markdown({ children }: { children: string }) {
  return (
    <div className="prose-ingenium">
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex, [rehypeHighlight, { detect: true }]]}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
