// Engineering cheat-sheet data for the reference page and the steel tooltips in notes.
// Strength figures are typical values for the usual delivery or heat-treated state; the
// standards (ГОСТ 1050, 4543, 5632, 19281, 14959, 1435, 801, 19265, 1412, 4784) are the source
// of truth for exact numbers.

export type Steel = {
  grade: string;
  /** Other spellings readers might type in a note, e.g. "Сталь 45". */
  aliases?: string[];
  group: "carbon" | "alloy" | "stainless" | "spring" | "tool" | "cast-iron" | "nonferrous";
  standard: string;
  analogs: string;
  composition: { ru: string; en: string };
  /** Ultimate and yield strength, MPa; hardness as written in the standard. */
  uts?: number;
  yield?: number;
  hardness?: string;
  state: { ru: string; en: string };
  use: { ru: string; en: string };
};

export const STEEL_GROUPS: Record<Steel["group"], { ru: string; en: string }> = {
  carbon: { ru: "Углеродистые конструкционные", en: "Carbon structural" },
  alloy: { ru: "Легированные конструкционные", en: "Alloy structural" },
  stainless: { ru: "Нержавеющие", en: "Stainless" },
  spring: { ru: "Пружинные", en: "Spring" },
  tool: { ru: "Инструментальные и подшипниковые", en: "Tool and bearing" },
  "cast-iron": { ru: "Чугуны", en: "Cast irons" },
  nonferrous: { ru: "Цветные сплавы", en: "Non-ferrous alloys" },
};

export const STEELS: Steel[] = [
  {
    grade: "Ст3сп",
    aliases: ["Ст3", "Ст3пс"],
    group: "carbon",
    standard: "ГОСТ 380-2005",
    analogs: "S235JR, A283 C",
    composition: { ru: "C 0,14–0,22 %, спокойная", en: "C 0.14–0.22 %, killed" },
    uts: 370,
    yield: 245,
    state: { ru: "горячекатаный прокат", en: "hot rolled" },
    use: {
      ru: "Сварные металлоконструкции, фермы, листы, неответственные детали",
      en: "Welded steelwork, trusses, plates, non-critical parts",
    },
  },
  {
    grade: "10",
    aliases: ["Сталь 10"],
    group: "carbon",
    standard: "ГОСТ 1050-2013",
    analogs: "C10, 1010",
    composition: { ru: "C 0,07–0,14 %", en: "C 0.07–0.14 %" },
    uts: 330,
    yield: 205,
    state: { ru: "нормализация", en: "normalised" },
    use: {
      ru: "Штамповка, трубы, цементуемые мелкие детали",
      en: "Stampings, tubes, small case-hardened parts",
    },
  },
  {
    grade: "20",
    aliases: ["Сталь 20"],
    group: "carbon",
    standard: "ГОСТ 1050-2013",
    analogs: "C22, 1020",
    composition: { ru: "C 0,17–0,24 %", en: "C 0.17–0.24 %" },
    uts: 410,
    yield: 245,
    state: { ru: "нормализация", en: "normalised" },
    use: {
      ru: "Трубы котлов, крепёж, оси, цементуемые детали с мягкой сердцевиной",
      en: "Boiler tubes, fasteners, axles, case-hardened parts",
    },
  },
  {
    grade: "35",
    aliases: ["Сталь 35"],
    group: "carbon",
    standard: "ГОСТ 1050-2013",
    analogs: "C35, 1035",
    composition: { ru: "C 0,32–0,40 %", en: "C 0.32–0.40 %" },
    uts: 530,
    yield: 315,
    state: { ru: "нормализация", en: "normalised" },
    use: { ru: "Оси, тяги, рычаги, болты, диски", en: "Axles, rods, levers, bolts, discs" },
  },
  {
    grade: "45",
    aliases: ["Сталь 45"],
    group: "carbon",
    standard: "ГОСТ 1050-2013",
    analogs: "C45, 1045",
    composition: { ru: "C 0,42–0,50 %, Mn 0,5–0,8 %", en: "C 0.42–0.50 %, Mn 0.5–0.8 %" },
    uts: 600,
    yield: 355,
    hardness: "≤ 229 HB",
    state: {
      ru: "нормализация; после улучшения σв ≈ 750–900 МПа, ТВЧ до 50 HRC",
      en: "normalised; quenched and tempered UTS ≈ 750–900 MPa, induction to 50 HRC",
    },
    use: {
      ru: "Валы, шестерни, шпиндели, пальцы: самая ходовая сталь в машиностроении",
      en: "Shafts, gears, spindles, pins: the workhorse of machine building",
    },
  },
  {
    grade: "09Г2С",
    group: "alloy",
    standard: "ГОСТ 19281-2014",
    analogs: "S355J2, A516 Gr.70",
    composition: { ru: "C ≤ 0,12 %, Mn 1,3–1,7 %, Si 0,5–0,8 %", en: "C ≤ 0.12 %, Mn 1.3–1.7 %, Si 0.5–0.8 %" },
    uts: 490,
    yield: 345,
    state: { ru: "прокат до 20 мм", en: "plate up to 20 mm" },
    use: {
      ru: "Сварные конструкции, мосты, сосуды давления, работа до −70 °C",
      en: "Welded structures, bridges, pressure vessels, service down to −70 °C",
    },
  },
  {
    grade: "40Х",
    group: "alloy",
    standard: "ГОСТ 4543-2016",
    analogs: "41Cr4, 5140",
    composition: { ru: "C 0,36–0,44 %, Cr 0,8–1,1 %", en: "C 0.36–0.44 %, Cr 0.8–1.1 %" },
    uts: 980,
    yield: 785,
    state: { ru: "закалка 860 °C + отпуск 500 °C", en: "quenched 860 °C + tempered 500 °C" },
    use: {
      ru: "Нагруженные валы, оси, шестерни, болты, шатуны",
      en: "Loaded shafts, axles, gears, bolts, con rods",
    },
  },
  {
    grade: "40ХН",
    group: "alloy",
    standard: "ГОСТ 4543-2016",
    analogs: "40NiCr6, 3140",
    composition: { ru: "C 0,36–0,44 %, Cr 0,45–0,75 %, Ni 1,0–1,4 %", en: "C 0.36–0.44 %, Cr 0.45–0.75 %, Ni 1.0–1.4 %" },
    uts: 980,
    yield: 785,
    state: { ru: "закалка + отпуск", en: "quenched and tempered" },
    use: { ru: "Крупные валы, шатуны, коленвалы, шестерни", en: "Large shafts, con rods, crankshafts, gears" },
  },
  {
    grade: "18ХГТ",
    group: "alloy",
    standard: "ГОСТ 4543-2016",
    analogs: "20MnCr5 (близкий)",
    composition: { ru: "C 0,17–0,23 %, Cr 1,0–1,3 %, Mn 0,8–1,1 %, Ti", en: "C 0.17–0.23 %, Cr 1.0–1.3 %, Mn 0.8–1.1 %, Ti" },
    uts: 980,
    yield: 885,
    hardness: "поверхность 56–62 HRC",
    state: { ru: "цементация + закалка + низкий отпуск", en: "carburised, quenched, low tempered" },
    use: {
      ru: "Шестерни коробок передач, кулачковые муфты, валы-шестерни",
      en: "Gearbox gears, dog clutches, pinion shafts",
    },
  },
  {
    grade: "30ХГСА",
    group: "alloy",
    standard: "ГОСТ 4543-2016",
    analogs: "≈ 4130 (близкий)",
    composition: { ru: "C 0,28–0,34 %, Cr, Mn, Si по 0,8–1,1 %", en: "C 0.28–0.34 %, Cr, Mn, Si 0.8–1.1 % each" },
    uts: 1080,
    yield: 830,
    state: { ru: "закалка 880 °C + отпуск 540 °C", en: "quenched 880 °C + tempered 540 °C" },
    use: {
      ru: "Силовые сварные узлы, детали шасси и авиаконструкций",
      en: "Load-bearing welded assemblies, landing gear and airframe parts",
    },
  },
  {
    grade: "38Х2МЮА",
    group: "alloy",
    standard: "ГОСТ 4543-2016",
    analogs: "41CrAlMo7",
    composition: { ru: "C 0,35–0,42 %, Cr 1,35–1,65 %, Mo, Al", en: "C 0.35–0.42 %, Cr 1.35–1.65 %, Mo, Al" },
    uts: 980,
    yield: 835,
    hardness: "азотированный слой до 1000 HV",
    state: { ru: "улучшение + азотирование", en: "quenched, tempered and nitrided" },
    use: {
      ru: "Гильзы цилиндров, точные шпиндели, штоки, червяки",
      en: "Cylinder liners, precision spindles, piston rods, worms",
    },
  },
  {
    grade: "12Х18Н10Т",
    group: "stainless",
    standard: "ГОСТ 5632-2014",
    analogs: "AISI 321, 1.4541",
    composition: { ru: "Cr 17–19 %, Ni 9–11 %, Ti ≤ 0,8 %", en: "Cr 17–19 %, Ni 9–11 %, Ti ≤ 0.8 %" },
    uts: 510,
    yield: 196,
    state: { ru: "аустенитизация 1050 °C, вода", en: "solution annealed 1050 °C, water" },
    use: {
      ru: "Химическое и пищевое оборудование, сварные ёмкости, работа до 600 °C",
      en: "Chemical and food equipment, welded tanks, service up to 600 °C",
    },
  },
  {
    grade: "08Х18Н10",
    aliases: ["AISI 304"],
    group: "stainless",
    standard: "ГОСТ 5632-2014",
    analogs: "AISI 304, 1.4301",
    composition: { ru: "C ≤ 0,08 %, Cr 17–19 %, Ni 9–11 %", en: "C ≤ 0.08 %, Cr 17–19 %, Ni 9–11 %" },
    uts: 520,
    yield: 205,
    state: { ru: "аустенитизация", en: "solution annealed" },
    use: { ru: "Посуда, кухонное оборудование, облицовка, трубы", en: "Kitchenware, catering equipment, cladding, tubes" },
  },
  {
    grade: "20Х13",
    group: "stainless",
    standard: "ГОСТ 5632-2014",
    analogs: "AISI 420, 1.4021",
    composition: { ru: "C 0,16–0,25 %, Cr 12–14 %", en: "C 0.16–0.25 %, Cr 12–14 %" },
    uts: 650,
    yield: 440,
    state: { ru: "закалка + отпуск", en: "quenched and tempered" },
    use: {
      ru: "Лопатки турбин, клапаны, арматура, хирургический инструмент",
      en: "Turbine blades, valves, fittings, surgical instruments",
    },
  },
  {
    grade: "65Г",
    group: "spring",
    standard: "ГОСТ 14959-2016",
    analogs: "1066, C67",
    composition: { ru: "C 0,62–0,70 %, Mn 0,9–1,2 %", en: "C 0.62–0.70 %, Mn 0.9–1.2 %" },
    uts: 980,
    yield: 785,
    state: { ru: "закалка 830 °C, масло + отпуск 480 °C", en: "oil quenched 830 °C + tempered 480 °C" },
    use: { ru: "Пружины, шайбы Гровера, диски сцепления, ножи", en: "Springs, split lock washers, clutch discs, blades" },
  },
  {
    grade: "60С2А",
    group: "spring",
    standard: "ГОСТ 14959-2016",
    analogs: "9260, 61SiCr7 (близкий)",
    composition: { ru: "C 0,58–0,63 %, Si 1,6–2,0 %", en: "C 0.58–0.63 %, Si 1.6–2.0 %" },
    uts: 1570,
    yield: 1370,
    state: { ru: "закалка 870 °C + отпуск 420 °C", en: "quenched 870 °C + tempered 420 °C" },
    use: { ru: "Рессоры, торсионы, тяжело нагруженные пружины", en: "Leaf springs, torsion bars, heavy-duty springs" },
  },
  {
    grade: "У8",
    aliases: ["У8А"],
    group: "tool",
    standard: "ГОСТ 1435-99",
    analogs: "C80U, W1",
    composition: { ru: "C 0,75–0,84 %", en: "C 0.75–0.84 %" },
    hardness: "62–64 HRC после закалки",
    state: { ru: "закалка в воду + низкий отпуск", en: "water quenched + low tempered" },
    use: {
      ru: "Ручной инструмент: зубила, кернеры, отвёртки, топоры",
      en: "Hand tools: chisels, centre punches, screwdrivers, axes",
    },
  },
  {
    grade: "ШХ15",
    group: "tool",
    standard: "ГОСТ 801-2022",
    analogs: "100Cr6, 52100",
    composition: { ru: "C 0,95–1,05 %, Cr 1,3–1,65 %", en: "C 0.95–1.05 %, Cr 1.3–1.65 %" },
    hardness: "61–65 HRC",
    state: { ru: "закалка в масло + низкий отпуск", en: "oil quenched + low tempered" },
    use: { ru: "Кольца и тела качения подшипников, плунжеры, калибры", en: "Bearing rings and rolling elements, plungers, gauges" },
  },
  {
    grade: "Р6М5",
    group: "tool",
    standard: "ГОСТ 19265-73",
    analogs: "HS6-5-2, M2",
    composition: { ru: "W 6 %, Mo 5 %, Cr 4 %, V 2 %", en: "W 6 %, Mo 5 %, Cr 4 %, V 2 %" },
    hardness: "63–65 HRC, красностойкость до 620 °C",
    state: { ru: "закалка 1220 °C + трёхкратный отпуск 560 °C", en: "quenched 1220 °C + triple tempered 560 °C" },
    use: { ru: "Свёрла, фрезы, метчики, протяжки", en: "Drills, mills, taps, broaches" },
  },
  {
    grade: "СЧ20",
    group: "cast-iron",
    standard: "ГОСТ 1412-85",
    analogs: "EN-GJL-200, ASTM A48 30",
    composition: { ru: "серый чугун, пластинчатый графит", en: "grey iron, flake graphite" },
    uts: 200,
    hardness: "170–241 HB",
    state: { ru: "литьё", en: "as cast" },
    use: {
      ru: "Станины, корпуса редукторов, шкивы, тормозные барабаны",
      en: "Machine beds, gearbox housings, pulleys, brake drums",
    },
  },
  {
    grade: "ВЧ50",
    group: "cast-iron",
    standard: "ГОСТ 7293-85",
    analogs: "EN-GJS-500-7",
    composition: { ru: "высокопрочный чугун, шаровидный графит", en: "ductile iron, spheroidal graphite" },
    uts: 500,
    yield: 320,
    hardness: "170–230 HB",
    state: { ru: "литьё", en: "as cast" },
    use: { ru: "Коленвалы, шестерни, корпуса насосов, трубы", en: "Crankshafts, gears, pump housings, pipes" },
  },
  {
    grade: "Д16Т",
    group: "nonferrous",
    standard: "ГОСТ 4784-2019",
    analogs: "2024-T4",
    composition: { ru: "Al + Cu 3,8–4,9 %, Mg 1,2–1,8 %", en: "Al + Cu 3.8–4.9 %, Mg 1.2–1.8 %" },
    uts: 440,
    yield: 290,
    state: { ru: "закалка + естественное старение", en: "solution treated + naturally aged" },
    use: { ru: "Обшивка и силовой набор самолётов, профили", en: "Aircraft skins and frames, profiles" },
  },
  {
    grade: "АМг6",
    group: "nonferrous",
    standard: "ГОСТ 4784-2019",
    analogs: "5456 (близкий)",
    composition: { ru: "Al + Mg 5,8–6,8 %", en: "Al + Mg 5.8–6.8 %" },
    uts: 320,
    yield: 160,
    state: { ru: "отжиг", en: "annealed" },
    use: { ru: "Сварные баки, корпуса судов, цистерны", en: "Welded tanks, ship hulls, tankers" },
  },
  {
    grade: "Л63",
    group: "nonferrous",
    standard: "ГОСТ 15527-2004",
    analogs: "CuZn37, C27200",
    composition: { ru: "Cu 62–65 %, остальное Zn", en: "Cu 62–65 %, balance Zn" },
    uts: 300,
    yield: 110,
    state: { ru: "мягкая", en: "soft" },
    use: { ru: "Трубки теплообменников, крепёж, штампованные детали", en: "Heat exchanger tubes, fasteners, stampings" },
  },
];

const steelIndex = new Map<string, Steel>();
for (const s of STEELS) {
  for (const name of [s.grade, ...(s.aliases ?? [])]) steelIndex.set(normalize(name), s);
}

function normalize(name: string) {
  return name.toLowerCase().replace(/^(сталь|steel)\s+/, "").replace(/\s+/g, "");
}

/**
 * The steel a piece of inline code names. Pure numbers ("45") only count with the word
 * «Сталь» in front, so plain `45` in a formula never turns into a tooltip.
 */
export function findSteel(text: string): Steel | null {
  const t = text.trim();
  if (/^\d+$/.test(t)) return null;
  return steelIndex.get(normalize(t)) ?? null;
}

// ---------------------------------------------------------------------------
// Geometric tolerances, ГОСТ 2.308-2011 / ISO 1101. The glyph is drawn in components.

export type GdtSymbol = {
  id: string;
  group: "form" | "orientation" | "location" | "runout";
  name: { ru: string; en: string };
  datum: boolean;
  note: { ru: string; en: string };
};

export const GDT_GROUPS: Record<GdtSymbol["group"], { ru: string; en: string }> = {
  form: { ru: "Допуски формы", en: "Form" },
  orientation: { ru: "Допуски ориентации", en: "Orientation" },
  location: { ru: "Допуски расположения", en: "Location" },
  runout: { ru: "Допуски биения", en: "Run-out" },
};

export const GDT: GdtSymbol[] = [
  { id: "straightness", group: "form", datum: false, name: { ru: "Прямолинейность", en: "Straightness" }, note: { ru: "Образующая вала, кромка, ось", en: "Shaft generatrix, edge, axis" } },
  { id: "flatness", group: "form", datum: false, name: { ru: "Плоскостность", en: "Flatness" }, note: { ru: "Привалочные плоскости, столы, фланцы", en: "Mating faces, tables, flanges" } },
  { id: "roundness", group: "form", datum: false, name: { ru: "Круглость", en: "Roundness" }, note: { ru: "Любое сечение вала или отверстия", en: "Any cross-section of a shaft or bore" } },
  { id: "cylindricity", group: "form", datum: false, name: { ru: "Цилиндричность", en: "Cylindricity" }, note: { ru: "Шейки под подшипники, плунжеры", en: "Bearing journals, plungers" } },
  { id: "line-profile", group: "form", datum: false, name: { ru: "Форма заданного профиля", en: "Profile of a line" }, note: { ru: "Кулачки, лекала (с базой это допуск расположения)", en: "Cams, templates (with a datum it locates)" } },
  { id: "surface-profile", group: "form", datum: false, name: { ru: "Форма заданной поверхности", en: "Profile of a surface" }, note: { ru: "Лопатки, штампы, сложные поверхности", en: "Blades, dies, freeform surfaces" } },
  { id: "parallelism", group: "orientation", datum: true, name: { ru: "Параллельность", en: "Parallelism" }, note: { ru: "Направляющие, оси валов редуктора", en: "Guideways, gearbox shaft axes" } },
  { id: "perpendicularity", group: "orientation", datum: true, name: { ru: "Перпендикулярность", en: "Perpendicularity" }, note: { ru: "Торец к оси, стенка к основанию", en: "Face to axis, wall to base" } },
  { id: "angularity", group: "orientation", datum: true, name: { ru: "Наклон", en: "Angularity" }, note: { ru: "Наклонные плоскости и оси под углом", en: "Inclined faces and axes" } },
  { id: "position", group: "location", datum: true, name: { ru: "Позиционный допуск", en: "Position" }, note: { ru: "Отверстия под крепёж, ⌀ перед числом = зона-цилиндр", en: "Bolt holes; ⌀ before the value = cylindrical zone" } },
  { id: "concentricity", group: "location", datum: true, name: { ru: "Соосность / концентричность", en: "Coaxiality / concentricity" }, note: { ru: "Ступени вала, посадочные отверстия корпуса", en: "Shaft steps, housing bores" } },
  { id: "symmetry", group: "location", datum: true, name: { ru: "Симметричность", en: "Symmetry" }, note: { ru: "Шпоночные пазы относительно оси", en: "Keyways about the axis" } },
  { id: "runout", group: "runout", datum: true, name: { ru: "Радиальное / торцовое биение", en: "Circular run-out" }, note: { ru: "Проверяют индикатором при одном обороте", en: "Dial indicator over one turn" } },
  { id: "total-runout", group: "runout", datum: true, name: { ru: "Полное биение", en: "Total run-out" }, note: { ru: "Индикатор ведут вдоль всей поверхности", en: "Indicator moved along the whole surface" } },
];

// ---------------------------------------------------------------------------
// Surface roughness, ГОСТ 2789-73 and ГОСТ 2.309-73.

export const ROUGHNESS: {
  ra: number;
  rz: number;
  oldClass: number;
  method: { ru: string; en: string };
  use: { ru: string; en: string };
}[] = [
  { ra: 50, rz: 200, oldClass: 2, method: { ru: "Литьё в землю, ковка, газовая резка", en: "Sand casting, forging, flame cutting" }, use: { ru: "Необрабатываемые поверхности", en: "Unmachined surfaces" } },
  { ra: 25, rz: 100, oldClass: 3, method: { ru: "Черновое точение, строгание, отрезка", en: "Rough turning, planing, parting" }, use: { ru: "Нерабочие поверхности, заготовки", en: "Non-functional faces, blanks" } },
  { ra: 12.5, rz: 50, oldClass: 4, method: { ru: "Получистовое точение, фрезерование, сверление", en: "Semi-finish turning, milling, drilling" }, use: { ru: "Свободные поверхности, отверстия под болты", en: "Free surfaces, clearance holes" } },
  { ra: 6.3, rz: 25, oldClass: 5, method: { ru: "Чистовое точение и фрезерование, зенкерование", en: "Finish turning and milling, counterboring" }, use: { ru: "Неподвижные стыки, торцы, фаски", en: "Static joints, faces, chamfers" } },
  { ra: 3.2, rz: 12.5, oldClass: 6, method: { ru: "Чистовое точение, развёртывание, протягивание", en: "Fine turning, reaming, broaching" }, use: { ru: "Посадки с зазором, шпоночные пазы, зубья", en: "Clearance fits, keyways, gear teeth" } },
  { ra: 1.6, rz: 6.3, oldClass: 7, method: { ru: "Тонкое точение, шлифование, чистовое развёртывание", en: "Precision turning, grinding, finish reaming" }, use: { ru: "Посадочные поверхности, отверстия H7", en: "Fitting surfaces, H7 bores" } },
  { ra: 0.8, rz: 3.2, oldClass: 8, method: { ru: "Шлифование, хонингование", en: "Grinding, honing" }, use: { ru: "Шейки валов под подшипники, цапфы", en: "Bearing journals, trunnions" } },
  { ra: 0.4, rz: 1.6, oldClass: 9, method: { ru: "Тонкое шлифование, хонингование", en: "Fine grinding, honing" }, use: { ru: "Гильзы цилиндров, точные шпиндели", en: "Cylinder liners, precision spindles" } },
  { ra: 0.2, rz: 0.8, oldClass: 10, method: { ru: "Доводка, суперфиниширование", en: "Lapping, superfinishing" }, use: { ru: "Плунжеры, клапаны, дорожки подшипников", en: "Plungers, valves, bearing raceways" } },
  { ra: 0.1, rz: 0.4, oldClass: 11, method: { ru: "Доводка, полирование", en: "Lapping, polishing" }, use: { ru: "Измерительный инструмент, калибры", en: "Gauges, measuring tools" } },
  { ra: 0.05, rz: 0.2, oldClass: 12, method: { ru: "Тонкая доводка, зеркальное полирование", en: "Fine lapping, mirror polishing" }, use: { ru: "Концевые меры, оптика", en: "Gauge blocks, optics" } },
];

export const ROUGHNESS_SIGNS: { id: "any" | "removal" | "no-removal"; ru: string; en: string }[] = [
  { id: "any", ru: "Способ обработки не указан", en: "Any process allowed" },
  { id: "removal", ru: "Со снятием слоя материала (точение, фрезерование, шлифование)", en: "Material removal required (turning, milling, grinding)" },
  { id: "no-removal", ru: "Без снятия материала (литьё, ковка, прокат) или поверхность не обрабатывается", en: "No material removal (casting, forging, rolling) or left as is" },
];

// ---------------------------------------------------------------------------
// Welds: joint types per ГОСТ 5264-80 and the auxiliary signs of ГОСТ 2.312-72.

export const WELD_JOINTS: { code: string; ru: string; en: string; examples: { ru: string; en: string } }[] = [
  { code: "С", ru: "Стыковое", en: "Butt", examples: { ru: "С2 без скоса кромок, С17 V-разделка, С25 X-разделка", en: "C2 square, C17 single-V, C25 double-V" } },
  { code: "У", ru: "Угловое", en: "Corner", examples: { ru: "У4 без скоса, У6 со скосом одной кромки", en: "U4 square, U6 single bevel" } },
  { code: "Т", ru: "Тавровое", en: "T-joint", examples: { ru: "Т1 односторонний шов, Т3 двусторонний, Т8 с разделкой", en: "T1 one-sided, T3 two-sided, T8 bevelled" } },
  { code: "Н", ru: "Нахлёсточное", en: "Lap", examples: { ru: "Н1 односторонний, Н2 двусторонний", en: "N1 one-sided, N2 two-sided" } },
];

export const WELD_SIGNS: { sign: string; ru: string; en: string }[] = [
  { sign: "⌒", ru: "Усиление шва снять", en: "Remove the weld reinforcement" },
  { sign: "◡", ru: "Наплывы и неровности обработать с плавным переходом", en: "Dress the weld smoothly into the base metal" },
  { sign: "○", ru: "Шов по замкнутой линии", en: "Weld all around" },
  { sign: "⌐", ru: "Шов выполнить при монтаже", en: "Site (field) weld" },
  { sign: "⊿ k", ru: "Катет углового шва k, мм", en: "Fillet leg size k, mm" },
  { sign: "l / t", ru: "Прерывистый шов: длина участка l, шаг t (цепной)", en: "Intermittent weld: length l, pitch t (chain)" },
  { sign: "l Z t", ru: "Прерывистый шов в шахматном порядке", en: "Staggered intermittent weld" },
  { sign: "⌟", ru: "Шов по незамкнутой линии (знак у линии-выноски)", en: "Weld along an open line" },
];
