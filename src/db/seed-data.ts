import type { Locale } from "../lib/i18n";
import type { MaterialText, MaterialType } from "../lib/content";

// Demo content loaded into an empty database on first migration.

export const seedSubjects = [
  { slug: "math", nameRu: "Математика", nameEn: "Mathematics" },
  { slug: "physics", nameRu: "Физика", nameEn: "Physics" },
  { slug: "chemistry", nameRu: "Химия", nameEn: "Chemistry" },
  { slug: "programming", nameRu: "Программирование", nameEn: "Programming" },
];

export type SeedMaterial = {
  slug: string;
  type: MaterialType;
  lang: Locale;
  subject: string;
  tags: string[];
  url?: string;
  images?: { src: string; alt: string; width: number; height: number }[];
  createdAt: string;
  text: Partial<Record<Locale, MaterialText>>;
};

export const seedMaterials: SeedMaterial[] = [
  {
    slug: "derivative-meaning",
    type: "note",
    lang: "ru",
    subject: "math",
    tags: ["матан", "производная", "пределы"],
    createdAt: "2026-10-20",
    text: {
      ru: {
        title: "Производная: смысл, а не формула",
        excerpt:
          "Производная это скорость изменения функции в точке. Разбираем через предел, геометрию касательной и физику.",
        body: `## Определение

Производная функции $f$ в точке $x_0$ это предел отношения приращения функции к приращению аргумента:

\`f'(x0) = lim (f(x0 + h) − f(x0)) / h, h → 0\`

## Геометрический смысл

Это **угловой коэффициент касательной** к графику в точке. Берём секущую через две точки графика и сдвигаем вторую точку к первой, секущая поворачивается и в пределе становится касательной.

## Физический смысл

Если $x(t)$ это координата, то $x'(t)$ это мгновенная скорость, а $x''(t)$ ускорение.

## Таблица, которую надо знать наизусть

| Функция | Производная |
|---|---|
| xⁿ | n·xⁿ⁻¹ |
| eˣ | eˣ |
| ln x | 1/x |
| sin x | cos x |
| cos x | −sin x |

> Совет с лекции: если не понимаешь, откуда формула, выведи её через определение для простого случая. Запоминается в разы лучше.`,
      },
      en: {
        title: "The derivative: meaning, not formula",
        excerpt:
          "A derivative is the rate of change of a function at a point. Explained through limits, tangent geometry and physics.",
        body: `## Definition

The derivative of $f$ at $x_0$ is the limit of the ratio of the function's increment to the argument's increment:

\`f'(x0) = lim (f(x0 + h) − f(x0)) / h, h → 0\`

## Geometric meaning

It is the **slope of the tangent line** at that point. Take a secant through two points and slide the second one towards the first: in the limit the secant becomes the tangent.

## Physical meaning

If $x(t)$ is position, $x'(t)$ is instantaneous velocity and $x''(t)$ is acceleration.`,
      },
    },
  },
  {
    slug: "newton-laws",
    type: "note",
    lang: "ru",
    subject: "physics",
    tags: ["механика", "динамика"],
    createdAt: "2026-10-17",
    images: [{ src: "/demo/mechanics.svg", alt: "Брусок на наклонной плоскости", width: 800, height: 600 }],
    text: {
      ru: {
        title: "Законы Ньютона на наклонной плоскости",
        excerpt:
          "Как расставлять силы, куда направлять оси и почему вдоль плоскости удобнее всего. Классика, которая будет на каждом экзамене.",
        body: `## Алгоритм

1. Нарисовать **все** силы: тяжести $mg$, реакции опоры $N$, трения $F_{\\text{тр}}$, внешние.
2. Ось X вдоль плоскости, ось Y перпендикулярно. Так $N$ и проекция $mg$ на Y гасят друг друга.
3. Записать второй закон в проекциях:
   - X: \`ma = mg·sin α − μN\`
   - Y: \`0 = N − mg·cos α\`
4. Подставить $N$ из второго уравнения в первое.

Итог: \`a = g(sin α − μ cos α)\`.

## Проверка на здравый смысл

- При $μ = 0$ получаем $a = g\\sin α$, а при $α = 90°$ это свободное падение. Сходится.
- Если $\\tan α < μ$, ускорение выходит отрицательным, значит брусок вообще не поедет.

## Карточки

\`\`\`cards
Второй закон Ньютона :: $F = ma$
Сила трения скольжения :: $F_{\\text{тр}} = μN$
Проекция $mg$ на ось вдоль плоскости :: $mg\\sin α$
Ускорение бруска на наклонной :: $a = g(\\sin α − μ\\cos α)$
\`\`\`

## Проверь себя

\`\`\`quiz
? Чему равна сила реакции опоры на наклонной плоскости?
- $mg$
+ $mg\\cos α$
- $mg\\sin α$
> Вдоль оси Y ускорения нет, поэтому $N$ уравновешивает проекцию $mg$ на эту ось.

? Брусок не едет. Что это значит?
+ $\\tan α \\le μ$
- $μ = 0$
- $α = 90°$
\`\`\``,
      },
    },
  },
  {
    slug: "3blue1brown-linear-algebra",
    type: "link",
    lang: "en",
    subject: "math",
    tags: ["линал", "видео", "интуиция"],
    url: "https://www.3blue1brown.com/topics/linear-algebra",
    createdAt: "2026-10-15",
    text: {
      ru: {
        title: "Essence of Linear Algebra (3Blue1Brown)",
        excerpt:
          "Лучший визуальный курс по линейной алгебре. Матрица как преобразование пространства, определитель как изменение площади. Смотреть до семестра.",
      },
      en: {
        title: "Essence of Linear Algebra (3Blue1Brown)",
        excerpt:
          "The best visual course on linear algebra. Matrices as transformations of space, determinants as change of area. Watch before the semester.",
      },
    },
  },
  {
    slug: "integrals-table-photo",
    type: "photo",
    lang: "ru",
    subject: "math",
    tags: ["интегралы", "шпаргалка"],
    createdAt: "2026-10-12",
    images: [{ src: "/demo/integrals.svg", alt: "Таблица основных интегралов", width: 800, height: 600 }],
    text: {
      ru: {
        title: "Таблица интегралов с доски",
        excerpt: "Сфоткал с доски после пары. Основные первообразные, которые надо знать без шпаргалки.",
      },
      en: {
        title: "Integral table from the blackboard",
        excerpt: "Snapped after the lecture. Basic antiderivatives you should know by heart.",
      },
    },
  },
  {
    slug: "acid-base-titration",
    type: "note",
    lang: "ru",
    subject: "chemistry",
    tags: ["аналитика", "титрование", "лаба"],
    createdAt: "2026-10-09",
    images: [{ src: "/demo/titration.svg", alt: "Схема установки для титрования", width: 800, height: 600 }],
    text: {
      ru: {
        title: "Кислотно-основное титрование",
        excerpt:
          "Как найти концентрацию кислоты через щёлочь известной концентрации. Точка эквивалентности, индикаторы и расчёт.",
        body: `## Суть

Медленно добавляем щёлочь $NaOH$ известной концентрации к кислоте $HCl$, пока вся кислота не прореагирует:

\`HCl + NaOH → NaCl + H₂O\`

Момент, когда кислоты и щёлочи ровно поровну по молям, называется **точкой эквивалентности**. Её ловим индикатором: фенолфталеин розовеет при pH ≈ 8,2.

## Расчёт

В точке эквивалентности количества вещества равны:

\`C(HCl) · V(HCl) = C(NaOH) · V(NaOH)\`

Отсюда \`C(HCl) = C(NaOH) · V(NaOH) / V(HCl)\`.

**Пример:** на 20 мл кислоты ушло 15 мл 0,1 М щёлочи, значит $C = 0{,}1 · 15 / 20 = 0{,}075$ М.`,
      },
    },
  },
  {
    slug: "mdn-javascript-guide",
    type: "link",
    lang: "en",
    subject: "programming",
    tags: ["js", "документация"],
    url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide",
    createdAt: "2026-10-05",
    text: {
      en: {
        title: "MDN JavaScript Guide",
        excerpt:
          "The reference for JavaScript from Mozilla. Clear, accurate and always up to date. Better than any random tutorial.",
      },
      ru: {
        title: "MDN: руководство по JavaScript",
        excerpt:
          "Главный справочник по JavaScript от Mozilla. Понятно, точно и всегда актуально. Лучше любого рандомного туториала.",
      },
    },
  },
  {
    slug: "thermodynamics-first-law",
    type: "note",
    lang: "en",
    subject: "physics",
    tags: ["термодинамика", "энергия"],
    createdAt: "2026-10-01",
    text: {
      en: {
        title: "First law of thermodynamics",
        excerpt:
          "Energy is conserved: heat added to a system goes into internal energy and work. Sign conventions that trip everyone up.",
        body: `## Statement

\`Q = ΔU + A\`

Heat $Q$ given to a gas goes into changing its internal energy $ΔU$ and into the work $A$ the gas does.

## Special cases

| Process | What's constant | First law becomes |
|---|---|---|
| Isochoric | V | Q = ΔU |
| Isobaric | p | Q = ΔU + pΔV |
| Isothermal | T | Q = A |
| Adiabatic | no heat | 0 = ΔU + A |

**Watch the signs:** here $A$ is work done *by* the gas. Some textbooks use work done *on* the gas, which flips the sign.`,
      },
    },
  },
];
