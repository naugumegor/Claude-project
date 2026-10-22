// ISO 286 / ГОСТ 25346: limits of holes and shafts for sizes up to 500 mm, IT5–IT12,
// the letters used in practice. Everything in micrometres. Used by the fit tooltips in notes
// (`H7/p6`, `Ø25 H7/p6`) and the calculator on the reference page.

const STEPS = [3, 6, 10, 18, 30, 50, 80, 120, 180, 250, 315, 400, 500];

const IT: Record<number, number[]> = {
  5: [4, 5, 6, 8, 9, 11, 13, 15, 18, 20, 23, 25, 27],
  6: [6, 8, 9, 11, 13, 16, 19, 22, 25, 29, 32, 36, 40],
  7: [10, 12, 15, 18, 21, 25, 30, 35, 40, 46, 52, 57, 63],
  8: [14, 18, 22, 27, 33, 39, 46, 54, 63, 72, 81, 89, 97],
  9: [25, 30, 36, 43, 52, 62, 74, 87, 100, 115, 130, 140, 155],
  10: [40, 48, 58, 70, 84, 100, 120, 140, 160, 185, 210, 230, 250],
  11: [60, 75, 90, 110, 130, 160, 190, 220, 250, 290, 320, 360, 400],
  12: [100, 120, 150, 180, 210, 250, 300, 350, 400, 460, 520, 570, 630],
};

// Shaft fundamental deviations: upper (es) for d–h, lower (ei) for k–p.
const SHAFT: Record<string, number[]> = {
  d: [-20, -30, -40, -50, -65, -80, -100, -120, -145, -170, -190, -210, -230],
  e: [-14, -20, -25, -32, -40, -50, -60, -72, -85, -100, -110, -125, -135],
  f: [-6, -10, -13, -16, -20, -25, -30, -36, -43, -50, -56, -62, -68],
  g: [-2, -4, -5, -6, -7, -9, -10, -12, -14, -15, -17, -18, -20],
  h: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  k: [0, 1, 1, 1, 2, 2, 2, 3, 3, 4, 4, 4, 5],
  m: [2, 4, 6, 7, 8, 9, 11, 13, 15, 17, 20, 21, 23],
  n: [4, 8, 10, 12, 15, 17, 20, 23, 27, 31, 34, 37, 40],
  p: [6, 12, 15, 18, 22, 26, 32, 37, 43, 50, 56, 62, 68],
};

// r and s change inside the big ranges, so they get their own finer steps.
const FINE_STEPS = [3, 6, 10, 18, 30, 50, 65, 80, 100, 120, 140, 160, 180, 200, 225, 250, 280, 315, 355, 400, 450, 500];
const FINE: Record<string, number[]> = {
  r: [10, 15, 19, 23, 28, 34, 41, 43, 51, 54, 63, 65, 68, 77, 80, 84, 94, 98, 108, 114, 126, 132],
  s: [14, 19, 23, 28, 35, 43, 53, 59, 71, 79, 92, 100, 108, 122, 130, 140, 158, 170, 190, 208, 232, 252],
};

export const SHAFT_LETTERS = ["d", "e", "f", "g", "h", "js", "k", "m", "n", "p", "r", "s"];
export const HOLE_LETTERS = ["D", "E", "F", "G", "H", "JS", "K", "M", "N", "P"];
export const GRADES = [5, 6, 7, 8, 9, 10, 11, 12];

export type Zone = { upper: number; lower: number };
export type FitKind = "clearance" | "transition" | "interference";
export type Fit = {
  size: number;
  hole: Zone;
  shaft: Zone;
  /** Largest clearance (positive) and smallest clearance (negative means interference). */
  maxGap: number;
  minGap: number;
  kind: FitKind;
};

function step(size: number, steps = STEPS) {
  const i = steps.findIndex((s) => size <= s);
  return i;
}

export function shaftZone(letter: string, grade: number, size: number): Zone | null {
  const i = step(size);
  const it = IT[grade]?.[i];
  if (i < 0 || it === undefined || size <= 0) return null;
  if (letter === "js") return { upper: it / 2, lower: -it / 2 };
  if (letter in FINE) {
    const ei = FINE[letter][step(size, FINE_STEPS)];
    return { upper: ei + it, lower: ei };
  }
  const dev = SHAFT[letter]?.[i];
  if (dev === undefined) return null;
  if ("defgh".includes(letter)) return { upper: dev, lower: dev - it };
  // k only gets its deviation for IT4–IT7; coarser grades (and sizes up to 3 mm) start at zero.
  const ei = letter === "k" && (grade > 7 || size <= 3) ? 0 : dev;
  return { upper: ei + it, lower: ei };
}

export function holeZone(letter: string, grade: number, size: number): Zone | null {
  const i = step(size);
  const it = IT[grade]?.[i];
  if (i < 0 || it === undefined || size <= 0) return null;
  if (letter === "JS") return { upper: it / 2, lower: -it / 2 };
  const lower = letter.toLowerCase();
  if ("DEFGH".includes(letter)) {
    // Holes mirror the shafts: EI = -es.
    const ei = -SHAFT[lower][i];
    return { upper: ei + it, lower: ei };
  }
  if (!"KMNP".includes(letter)) return null;
  // K, M, N up to IT8 and P up to IT7 use the "special rule": ES = -ei + Δ, Δ = ITn − ITn−1.
  const special = letter === "P" ? grade <= 7 : grade <= 8;
  const delta = special && size > 3 && IT[grade - 1] ? it - IT[grade - 1][i] : 0;
  let es: number;
  if (letter === "K") es = special && size > 3 ? -SHAFT.k[i] + delta : 0;
  // Coarse N (keyways: N9) starts at zero above 3 mm.
  else if (letter === "N" && !special) es = size > 3 ? 0 : -SHAFT.n[i];
  else es = -SHAFT[lower][i] + delta;
  return { upper: es, lower: es - it };
}

export function parseFit(text: string) {
  const m = text
    .trim()
    .match(/^(?:[Ø⌀]\s*(\d+(?:[.,]\d+)?)\s*)?([A-Z]{1,2})(\d{1,2})\s*\/\s*([a-z]{1,2})(\d{1,2})$/);
  if (!m) return null;
  const [, size, hl, hg, sl, sg] = m;
  if (!HOLE_LETTERS.includes(hl) || !SHAFT_LETTERS.includes(sl)) return null;
  return {
    size: size ? Number(size.replace(",", ".")) : undefined,
    hole: { letter: hl, grade: Number(hg) },
    shaft: { letter: sl, grade: Number(sg) },
  };
}

export function computeFit(
  hole: { letter: string; grade: number },
  shaft: { letter: string; grade: number },
  size: number,
): Fit | null {
  const h = holeZone(hole.letter, hole.grade, size);
  const s = shaftZone(shaft.letter, shaft.grade, size);
  if (!h || !s) return null;
  const maxGap = h.upper - s.lower;
  const minGap = h.lower - s.upper;
  const kind: FitKind = minGap >= 0 ? "clearance" : maxGap <= 0 ? "interference" : "transition";
  return { size, hole: h, shaft: s, maxGap, minGap, kind };
}

/** Recommended fits with where they are used (hole basis unless noted). */
export const COMMON_FITS: { fit: string; ru: string; en: string }[] = [
  { fit: "H11/d11", ru: "Свободная, грубая: шарниры, рычаги, крышки", en: "Loose running: hinges, levers, covers" },
  { fit: "H9/d9", ru: "Свободная: валы в опорах с большими зазорами, сальники", en: "Free running: shafts with large clearances, seals" },
  { fit: "H8/e8", ru: "Ходовая: подшипники скольжения на высоких оборотах", en: "Running: plain bearings at high speed" },
  { fit: "H7/f7", ru: "Ходовая: подшипники скольжения, золотники, коробки передач", en: "Close running: plain bearings, spools, gearboxes" },
  { fit: "H7/g6", ru: "Движения: точные направляющие, плунжеры, шпиндели", en: "Sliding: precise guides, plungers, spindles" },
  { fit: "H7/h6", ru: "Скользящая: центрирование, сменные шестерни, втулки", en: "Locational clearance: centring, change gears, bushes" },
  { fit: "H7/js6", ru: "Переходная плотная: шкивы, муфты, зубчатые колёса со шпонкой", en: "Transition: pulleys, couplings, keyed gears" },
  { fit: "H7/k6", ru: "Переходная напряжённая: шестерни и муфты на валах, внутренние кольца подшипников", en: "Transition: gears and couplings on shafts, bearing inner rings" },
  { fit: "H7/n6", ru: "Переходная глухая: тяжело нагруженные колёса, втулки в корпусах", en: "Transition, tight: heavily loaded wheels, bushes in housings" },
  { fit: "H7/p6", ru: "Лёгкопрессовая: втулки подшипников скольжения, венцы колёс", en: "Light press: plain-bearing bushes, gear rims" },
  { fit: "H7/r6", ru: "Прессовая: зубчатые венцы, кондукторные втулки, муфты без шпонки", en: "Medium press: gear rims, jig bushes, keyless couplings" },
  { fit: "H7/s6", ru: "Прессовая средняя: передача момента без шпонки, бандажи", en: "Press: torque transfer without a key, tyres" },
];

export const FIT_KIND_NAMES: Record<FitKind, { ru: string; en: string }> = {
  clearance: { ru: "С зазором", en: "Clearance" },
  transition: { ru: "Переходная", en: "Transition" },
  interference: { ru: "С натягом", en: "Interference" },
};
