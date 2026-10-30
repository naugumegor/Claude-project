---
title: "Drawing 01. The engineer's language: sheet, title block, scale, lettering and lines"
excerpt: "Lecture 1 of Mechanical Engineering Drawing (BME). Why drawings exist, A0–A4 sheets, frame and title block, scales, standard lettering, line weights and line types, drawing types and the parts list. Plus how the course itself works: homework, tests, points."
---

## The whole topic in a minute

- **A drawing is a language.** You draw a part so that any machinist in any country reads it the same way. That is why everything follows ISO: sheet sizes, lines, lettering, symbols.
- **Sheet:** A4 stands upright (portrait), A3 and bigger lie flat (landscape). A frame, and the **title block** in the bottom-right corner.
- **Scale:** only from the series 1, 2, 5, 10… (1:2, 2:1, 1:5). Dimensions always show the **real** size; the scale never changes them.
- **Lines:** wide (0.7) for visible outlines, narrow (0.35) for everything else. Ratio 2:1.
- **Drawing types:** single-part drawing, and assembly drawing with a **parts list** and part numbers.

## How the course works (so you don't fail it)

There is no exam; the grade comes from points over the semester. 3 hours of lecture and 2 hours of seminar a week. Seminar attendance is compulsory: at most 4 absences, and being more than 5 minutes late counts as an absence.

| Item | Min | Max |
|---|---|---|
| HW 1: copy of a part and an assembly + lettering + folder | 4 | 10 |
| HW 2: threaded joint and torque-transmitting joint | 6 | 15 |
| HW 3: detailing from an assembly drawing | 4 | 10 |
| HW 4: pneumatic cylinder assembly | 10 | 25 |
| Test 1 (week 9) | 6 | 15 |
| Test 2 (week 13) | 10 | 25 |

Grade: 0–39 fail, 40–54 pass (2), 55–69 satisfactory (3), 70–84 good (4), 85–100 excellent (5). Every homework is first shown **freehand in pencil**; the teacher marks the mistakes (they won't fix them for you), and only then do you draw it properly with rulers.

What to bring: A4 80 g/m² paper, printed sheets with the layout, a straight ruler, 45° and 30/60° set squares, a compass, 2B, B and HB pencils, a sharpener and an eraser.

## Why drawings exist

Imagine ordering a cake over the phone. "Round, with cream" gets you anything. "24 cm across, 8 cm tall, three layers, this cream" gets you exactly what you wanted. A drawing is that order, for metal. It has to be **unambiguous**: everyone reads the same sheet the same way.

A part's path: requirements → concept (rough sketch) → detailing (freehand drawing) → constructed drawing or CAD → manufacturing. This course trains all three levels by hand.

## Sheet sizes

![A4 sheet: frame, title block, parts list and sheet sizes](/drawing/sheet-layout.svg "A4 sheet: frame, title block and the parts list above it")

The biggest sheet, A0, is 1 m² with sides in the ratio 1 : √2. Fold it in half across the long side and you get the next size. So A4 is exactly half of A3, A3 half of A2.

| Size | mm |
|---|---|
| A0 | 841 × 1189 |
| A1 | 594 × 841 |
| A2 | 420 × 594 |
| A3 | 297 × 420 |
| A4 | 210 × 297 |

The frame sits 10 mm from the edge (wider on the left as a binding margin). A4 is portrait; anything bigger is landscape.

## Title block

The drawing's passport, bottom right: part name, drawing number, material, mass, scale, **projection-method symbol**, who drew it, who checked it, date, company. The BME homework title block is simplified, but fill it completely, by hand, in standard lettering.

## Scale

Scale says how many times the picture is bigger or smaller than the part. Written as M 1:2.

| Enlargement | Full size | Reduction |
|---|---|---|
| 50:1, 20:1, 10:1, 5:1, 2:1 | 1:1 | 1:2, 1:5, 1:10, 1:20, 1:50, 1:100 |

Remember 1, 2, 5, 10, 20, 50: no other numbers, 1:3 or 1:4 are not allowed. If the part fits, always use **1:1**. A tiny area can get its own enlarged detail view.

> Important: a 200 mm shaft drawn at 1:2 is 100 mm on paper, but you write **200**. Like a map: the town is small, but the "20 km" label is real.

## Standard lettering

Letter heights 2.5, 3.5, 5, 7, 10 mm. Stroke width about **1/10 of the height**.

| Where | Height, mm | Stroke, mm |
|---|---|---|
| Tolerances, small title-block text | 2.5 | 0.25 |
| Dimension figures, parts list, notes | 3.5 | 0.35 |
| Main title-block text: title, number | 5 | 0.5 |
| Part numbers, section letters | 7 | 0.7 |

Text is read from the bottom of the sheet. For a long vertical part the sheet may be turned 90° clockwise, so the text reads from the right. HW 1 includes a full A4 page of letters at 10, 7, 5 and 3.5 mm, so practise early.

## Lines

![Line types and where each is used](/drawing/lines.svg "The seven line types this course uses")

Two weights in a 2:1 ratio, usually **0.7 / 0.35**. The wide line is dark and bold; the narrow one is thin but still dark and crisp, not grey.

| Line | Used for |
|---|---|
| Continuous wide | Visible outlines and edges |
| Continuous narrow | Dimensions, leaders, hatching |
| Freehand or zig-zag narrow | Break lines, limits of a broken-out section |
| Dashed narrow | Hidden edges |
| Long-dash dotted narrow | Centre and symmetry lines |
| Long-dash double-dotted | End positions, bend lines, adjacent parts |
| Very light narrow | **Construction only**, almost invisible on the final drawing |

Analogy: the wide line is "what your eye sees", the narrow line is "the engineer's notes on top of the picture".

> The most common HW 1 mistake from the seminar review: all lines the same weight, or grey. Wide must be wide, narrow must be crisp, construction lines must not stick out.

## Drawing types

- **Single-part drawing.** Everything needed to make one part with no other paper: views, all dimensions, tolerances, roughness, material.
- **Assembly drawing.** The whole machine assembled: how parts sit together, overall dimensions, fits. Each part gets a **part number** on a leader.
- **Parts list (BOM).** The table above the title block: number, name, quantity, material, drawing or standard number. Numbering goes **bottom-up**, so new rows can be added on top.
- **Combined detail and assembly drawing.** An assembly with every part's dimensions on it. This is the main task of HW 1.
- **Exploded view.** An isometric picture with parts pulled apart along the assembly axis, the kind you see in IKEA manuals and repair guides.

## Videos

```video
https://www.youtube.com/watch?v=_t2NjPpsegE | Line Types in Technical Drawings (Mr. Dillman)
https://www.youtube.com/watch?v=E6OXZ9OHpVk | Line Types, part 2 (Mr. Dillman)
```

Seminar 1 asked you to watch how the HW 1 parts are made. Part 1 (the positioning pin) is turned on a lathe; part 2 (the handrail carrier) is cut from sheet and welded:

```video
https://www.youtube.com/watch?v=Vm5Chb_2JxA | Basic Turning on a Manual Lathe
https://www.youtube.com/watch?v=vlmGTxa7tUM | Turning a multi-stepped steel pin
https://www.youtube.com/watch?v=3yFmf8uUETc | CNC plasma cutting of sheet
https://www.youtube.com/watch?v=5vQU8MURoJw | TIG welding: puddle control
```

## Check yourself

```quiz
? Which scale is allowed?
- 1:3
+ 1:5
- 1:4
> Only the 1, 2, 5 series and its multiples of ten.

? A 120 mm shaft is drawn at M 1:2. Which number goes on the dimension?
- 60
+ 120
- 240
> Dimensions are always real; the scale only changes the picture.

? Which line shows a hidden edge?
- continuous narrow
+ dashed narrow
- long-dash dotted
```

```cards
A4 size :: 210 × 297 mm
A3 size :: 297 × 420 mm
Wide to narrow line ratio :: 2 : 1, usually 0.7 / 0.35
Lettering stroke width :: about 1/10 of the letter height
Parts list numbering :: bottom-up
Symmetry line :: long-dash dotted narrow
```
