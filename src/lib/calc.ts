// ```calc blocks: live formulas with sliders and graphs inside a note.
//
//   ```calc
//   title: Прогиб консольной балки
//   F = 1000 | 100..5000 | Н | Сила на конце
//   L = 2 | 0.5..5 | м | Длина
//   E = 2e11 | | Па | Модуль Юнга
//   I = 8e-6 | | м⁴
//   f = F*L^3/(3*E*I)*1000 | | мм | Прогиб на конце
//   plot x: 0..L | F*x^2*(3*L - x)/(6*E*I)*1000 | Прогиб, мм
//   axes: x, м ; w, мм
//   ```
//
// A line "name = expr | range | unit | label" declares a value. With a range (min..max or
// min..max..step) it becomes a slider that starts at expr; without one it is computed from
// the lines above and shown as a result. "plot t: a..b | expr | label" draws a curve over t;
// "expr ; expr" draws a parametric curve (x(t) ; y(t)). Several plots share one chart.
// Expressions: + - * / ^, parentheses, pi, e and sin cos tan asin acos atan sinh cosh tanh
// sqrt cbrt exp ln log10 log2 abs floor ceil round sign min max pow atan2 hypot,
// and finance: npv(r, CF0, CF1, …), irr(CF0, CF1, …), pmt(r, n, pv), pv(r, n, pmt), fv(r, n, pmt).

export type CalcValue = {
  name: string;
  expr: string;
  range?: { min: string; max: string; step?: string };
  unit: string;
  label: string;
};

export type CalcPlot = {
  variable: string;
  from: string;
  to: string;
  /** One expression, or two for a parametric curve. */
  exprs: [string] | [string, string];
  label: string;
};

export type CalcSource = {
  title: string;
  values: CalcValue[];
  plots: CalcPlot[];
  axes: [string, string];
  errors: string[];
};

const NAME = /^[\p{L}_][\p{L}\p{N}_]*$/u;

export function parseCalc(raw: string): CalcSource {
  const out: CalcSource = { title: "", values: [], plots: [], axes: ["", ""], errors: [] };
  raw.split("\n").forEach((rawLine, i) => {
    const line = rawLine.trim();
    if (!line || line.startsWith("#") || line.startsWith("//")) return;
    const fail = (why: string) => out.errors.push(`${i + 1}: ${why} — «${line}»`);

    const directive = line.match(/^(title|axes)\s*:\s*(.*)$/i);
    if (directive) {
      const [, key, rest] = directive;
      if (key.toLowerCase() === "title") out.title = rest.trim();
      else {
        const [x = "", y = ""] = rest.split(";").map((s) => s.trim());
        out.axes = [x, y];
      }
      return;
    }

    const plot = line.match(/^plot\s+([\p{L}_][\p{L}\p{N}_]*)\s*:\s*(.+?)\s*\.\.\s*([^|]+?)\s*\|(.*)$/u);
    if (plot) {
      const [, variable, from, to, rest] = plot;
      const [exprPart, ...labelParts] = rest.split("|");
      const exprs = exprPart.split(";").map((s) => s.trim()).filter(Boolean);
      if (exprs.length < 1 || exprs.length > 2) return fail("plot needs «expr» or «x(t) ; y(t)»");
      for (const e of [from, to, ...exprs]) {
        const err = checkExpr(e);
        if (err) return fail(err);
      }
      out.plots.push({
        variable,
        from,
        to,
        exprs: exprs as [string] | [string, string],
        label: labelParts.join("|").trim(),
      });
      return;
    }

    const eq = line.indexOf("=");
    if (eq > 0) {
      const name = line.slice(0, eq).trim();
      const [expr, range = "", unit = "", ...label] = line.slice(eq + 1).split("|");
      if (!NAME.test(name)) return fail("bad name");
      const exprErr = checkExpr(expr.trim());
      if (exprErr) return fail(exprErr);
      const value: CalcValue = {
        name,
        expr: expr.trim(),
        unit: unit.trim(),
        label: label.join("|").trim(),
      };
      if (range.trim()) {
        const [min, max, step] = range.split("..").map((s) => s.trim());
        if (!min || !max) return fail("range is min..max");
        for (const e of [min, max, step].filter(Boolean)) {
          const err = checkExpr(e!);
          if (err) return fail(err);
        }
        value.range = { min, max, step: step || undefined };
      }
      out.values.push(value);
      return;
    }
    fail("unknown line");
  });
  return out;
}

// ---------------------------------------------------------------------------
// Expressions: a small recursive-descent parser that compiles to a closure.

export type Scope = Record<string, number>;
type Fn = (scope: Scope) => number;

const FUNCS: Record<string, (...a: number[]) => number> = {
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  asin: Math.asin,
  acos: Math.acos,
  atan: Math.atan,
  sinh: Math.sinh,
  cosh: Math.cosh,
  tanh: Math.tanh,
  sqrt: Math.sqrt,
  cbrt: Math.cbrt,
  exp: Math.exp,
  ln: Math.log,
  log: Math.log10,
  log10: Math.log10,
  log2: Math.log2,
  abs: Math.abs,
  floor: Math.floor,
  ceil: Math.ceil,
  round: Math.round,
  sign: Math.sign,
  min: Math.min,
  max: Math.max,
  pow: Math.pow,
  atan2: Math.atan2,
  hypot: Math.hypot,
  deg: (r) => (r * 180) / Math.PI,
  rad: (d) => (d * Math.PI) / 180,
  // Finance: r is a fraction (0.12), CF0 sits at t = 0 (unlike Excel's NPV).
  npv: (r, ...flows) => npv(r, flows),
  irr: (...flows) => irr(flows),
  pmt: (r, n, pv) => (r === 0 ? pv / n : (pv * r) / (1 - (1 + r) ** -n)),
  pv: (r, n, pmt) => (r === 0 ? pmt * n : (pmt * (1 - (1 + r) ** -n)) / r),
  fv: (r, n, pmt) => (r === 0 ? pmt * n : (pmt * ((1 + r) ** n - 1)) / r),
};

export function npv(r: number, flows: number[]) {
  return flows.reduce((sum, cf, t) => sum + cf / (1 + r) ** t, 0);
}

/** Internal rate of return by bisection on (−99 %, 1000 %); NaN when NPV never changes sign. */
export function irr(flows: number[]) {
  let lo = -0.99;
  let hi = 10;
  let fLo = npv(lo, flows);
  if (Math.sign(fLo) === Math.sign(npv(hi, flows))) return NaN;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    const f = npv(mid, flows);
    if (Math.abs(f) < 1e-10) return mid;
    if (Math.sign(f) === Math.sign(fLo)) {
      lo = mid;
      fLo = f;
    } else hi = mid;
  }
  return (lo + hi) / 2;
}
const CONSTS: Scope = { pi: Math.PI, π: Math.PI, e: Math.E };

type Token = { kind: "num" | "name" | "op"; text: string; value?: number };

function tokenize(src: string): Token[] {
  const tokens: Token[] = [];
  const re = /\s*(?:(\d+\.?\d*(?:e[+-]?\d+)?|\.\d+(?:e[+-]?\d+)?)|([\p{L}_][\p{L}\p{N}_]*)|(\*\*|[-+*/^(),·×]))/uy;
  let pos = 0;
  while (pos < src.length) {
    re.lastIndex = pos;
    const m = re.exec(src);
    if (!m) {
      if (/^\s*$/.test(src.slice(pos))) break;
      throw new Error(`unexpected «${src.slice(pos).trim()[0]}»`);
    }
    pos = re.lastIndex;
    if (m[1]) tokens.push({ kind: "num", text: m[1], value: Number(m[1]) });
    else if (m[2]) tokens.push({ kind: "name", text: m[2] });
    else {
      const op = m[3] === "**" ? "^" : m[3] === "·" || m[3] === "×" ? "*" : m[3];
      tokens.push({ kind: "op", text: op });
    }
  }
  return tokens;
}

const cache = new Map<string, Fn>();

/** Compiles an expression once; unknown variables evaluate to NaN. */
export function compile(src: string): Fn {
  const hit = cache.get(src);
  if (hit) return hit;
  const tokens = tokenize(src);
  let i = 0;
  const peek = () => tokens[i];
  const take = (text?: string) => {
    const t = tokens[i];
    if (!t || (text && t.text !== text)) throw new Error(text ? `expected «${text}»` : "unexpected end");
    i++;
    return t;
  };

  // sum := product (("+" | "-") product)*
  const sum = (): Fn => {
    let left = product();
    while (peek()?.text === "+" || peek()?.text === "-") {
      const op = take().text;
      const a = left;
      const b = product();
      left = op === "+" ? (s) => a(s) + b(s) : (s) => a(s) - b(s);
    }
    return left;
  };
  // product := unary (("*" | "/") unary)*
  const product = (): Fn => {
    let left = unary();
    while (peek()?.text === "*" || peek()?.text === "/") {
      const op = take().text;
      const a = left;
      const b = unary();
      left = op === "*" ? (s) => a(s) * b(s) : (s) => a(s) / b(s);
    }
    return left;
  };
  // unary := ("-" | "+") unary | power
  const unary = (): Fn => {
    if (peek()?.text === "-") {
      take();
      const a = unary();
      return (s) => -a(s);
    }
    if (peek()?.text === "+") {
      take();
      return unary();
    }
    return power();
  };
  // power := atom ("^" unary)?   (right-associative, binds tighter than unary minus on the left)
  const power = (): Fn => {
    const base = atom();
    if (peek()?.text === "^") {
      take();
      const exp = unary();
      return (s) => Math.pow(base(s), exp(s));
    }
    return base;
  };
  const atom = (): Fn => {
    const t = take();
    if (t.kind === "num") {
      const v = t.value!;
      return () => v;
    }
    if (t.text === "(") {
      const inner = sum();
      take(")");
      return inner;
    }
    if (t.kind === "name") {
      if (peek()?.text === "(") {
        const fn = FUNCS[t.text];
        if (!fn) throw new Error(`unknown function ${t.text}`);
        take("(");
        const args: Fn[] = [];
        if (peek()?.text !== ")") {
          args.push(sum());
          while (peek()?.text === ",") {
            take();
            args.push(sum());
          }
        }
        take(")");
        return (s) => fn(...args.map((a) => a(s)));
      }
      const name = t.text;
      if (name in CONSTS) {
        const c = CONSTS[name];
        return (s) => (name in s ? s[name] : c);
      }
      return (s) => (name in s ? s[name] : NaN);
    }
    throw new Error(`unexpected «${t.text}»`);
  };

  const fn = sum();
  if (i < tokens.length) throw new Error(`unexpected «${tokens[i].text}»`);
  cache.set(src, fn);
  return fn;
}

function checkExpr(src: string): string | null {
  if (!src) return "empty expression";
  try {
    compile(src);
    return null;
  } catch (e) {
    return (e as Error).message;
  }
}

export function evaluate(src: string, scope: Scope): number {
  try {
    return compile(src)(scope);
  } catch {
    return NaN;
  }
}

/**
 * Evaluates every value top to bottom. Sliders take their current position from `slider`
 * (falling back to the initial expression); `pin` forces one name, e.g. the plot variable.
 */
export function solve(values: CalcValue[], slider: Scope, pin?: Scope): Scope {
  const scope: Scope = { ...pin };
  for (const v of values) {
    if (pin && v.name in pin) continue;
    scope[v.name] = v.range && v.name in slider ? slider[v.name] : evaluate(v.expr, scope);
  }
  return scope;
}

/** 4 significant digits, scientific with a ×10ⁿ suffix for very large or small numbers. */
export function formatNumber(x: number, locale: string) {
  if (!Number.isFinite(x)) return "—";
  if (x === 0) return "0";
  const abs = Math.abs(x);
  if (abs >= 1e6 || abs < 1e-3) {
    const exp = Math.floor(Math.log10(abs));
    const mant = x / 10 ** exp;
    const sup = String(exp)
      .split("")
      .map((c) => "⁻⁰¹²³⁴⁵⁶⁷⁸⁹"["-0123456789".indexOf(c)])
      .join("");
    return `${new Intl.NumberFormat(locale, { maximumSignificantDigits: 3 }).format(mant)}·10${sup}`;
  }
  return new Intl.NumberFormat(locale, { maximumSignificantDigits: 4 }).format(x);
}

/** Round step for a slider: about 200 positions, snapped to 1, 2 or 5 × 10ⁿ. */
export function niceStep(span: number) {
  const raw = Math.abs(span) / 200 || 1;
  const pow = 10 ** Math.floor(Math.log10(raw));
  const m = raw / pow;
  return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * pow;
}

/** Evenly spaced axis ticks covering [lo, hi]. */
export function ticks(lo: number, hi: number, count = 5): number[] {
  if (!(hi > lo)) return [lo];
  const step = niceStep(((hi - lo) / count) * 200);
  const out: number[] = [];
  for (let v = Math.ceil(lo / step) * step; v <= hi + step * 1e-9; v += step) {
    out.push(Math.abs(v) < step * 1e-9 ? 0 : v);
  }
  return out;
}
