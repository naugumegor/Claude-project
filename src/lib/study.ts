// Helpers for the study tools on note pages: reading time and the ```cards / ```quiz blocks.
//
// Flashcards, one per line:          A quiz, questions separated by a blank line:
//   ```cards                           ```quiz
//   Второй закон Ньютона :: F = ma     ? Чему равна сила тяжести?
//   Импульс :: $p = mv$                - mg/2
//   ```                                + mg
//                                      > Масса на ускорение свободного падения.
//                                      ```
// "+" marks the right answer, "-" a wrong one, ">" an optional explanation.

export type CardSource = { id: string; front: string; back: string };
export type QuizSource = {
  id: string;
  question: string;
  options: { text: string; correct: boolean }[];
  explanation?: string;
};

/** Minutes to read a Markdown body: ~180 words a minute, a formula counts as ten words. */
export function readingMinutes(body: string) {
  const formulas = (body.match(/\$\$[\s\S]+?\$\$|\$[^$\n]+\$/g) ?? []).length;
  const words = body
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/\$\$[\s\S]+?\$\$|\$[^$\n]+\$/g, " ")
    .split(/\s+/)
    .filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
  return Math.max(1, Math.round((words + formulas * 10) / 180));
}

export function parseCards(raw: string): CardSource[] {
  return raw
    .split("\n")
    .map((line) => line.split("::"))
    .filter((parts) => parts.length >= 2 && parts[0].trim() && parts.slice(1).join("::").trim())
    .map(([front, ...rest]) => {
      const back = rest.join("::").trim();
      return { id: hash(`${front.trim()}\u0000${back}`), front: front.trim(), back };
    });
}

export function parseQuiz(raw: string): QuizSource[] {
  return raw
    .split(/\n\s*\n/)
    .map((block) => {
      let question = "";
      let explanation: string | undefined;
      const options: QuizSource["options"] = [];
      for (const line of block.split("\n").map((l) => l.trim())) {
        if (line.startsWith("?")) question = line.slice(1).trim();
        else if (line.startsWith("+")) options.push({ text: line.slice(1).trim(), correct: true });
        else if (line.startsWith("-")) options.push({ text: line.slice(1).trim(), correct: false });
        else if (line.startsWith(">")) explanation = line.slice(1).trim();
      }
      return { id: hash(question), question, options, explanation };
    })
    .filter((q) => q.question && q.options.length >= 2 && q.options.some((o) => o.correct));
}

/** Small stable string hash (djb2) for localStorage keys. */
function hash(text: string) {
  let h = 5381;
  for (let i = 0; i < text.length; i++) h = ((h << 5) + h + text.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}
