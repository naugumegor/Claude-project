import { Fragment } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { common, createLowlight } from "lowlight";
import { toJsxRuntime } from "hast-util-to-jsx-runtime";

const lowlight = createLowlight(common);

/**
 * A paste's text with highlight.js colours, rendered on the server. The input only ever becomes
 * text nodes inside <span class="hljs-…">, so a paste can't inject markup. Very long pastes skip
 * the highlighting to keep the page fast.
 */
export function CodeView({ code, language }: { code: string; language: string }) {
  let tree;
  if (code.length <= 100_000 && language !== "plaintext") {
    tree = language === "auto" ? lowlight.highlightAuto(code) : lowlight.registered(language) ? lowlight.highlight(language, code) : null;
  }
  const lines = code.split("\n").length;
  return (
    <div className="flex overflow-x-auto rounded-2xl border border-line bg-surface font-mono text-[0.85rem] leading-6">
      <pre aria-hidden className="select-none border-r border-line bg-surface-2/60 px-3 py-4 text-right text-muted">
        {Array.from({ length: lines }, (_, i) => i + 1).join("\n")}
      </pre>
      <pre className="min-w-0 flex-1 px-4 py-4">
        <code className="hljs">{tree ? toJsxRuntime(tree, { Fragment, jsx, jsxs }) : code}</code>
      </pre>
    </div>
  );
}

