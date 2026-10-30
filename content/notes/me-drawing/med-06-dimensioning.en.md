---
title: "Drawing 06. Dimensioning: telling the machinist how long to cut"
excerpt: "Lectures 4–5. What a dimension consists of, arrows and extension lines, Ø, R, S, □ symbols, taper and slope, chamfers, holes (through, blind, countersunk, counterbored), chain, parallel, combined, running and coordinate dimensioning, choosing datums and what not to dimension. Test 1 exercise 5."
---

## The whole topic in a minute

- Views show the shape; **dimensions** show the size. Without them you can neither make nor check the part.
- Each dimension appears **once**. A closed dimension chain is **forbidden**.
- The default unit is **millimetres**, not written. A dimension is always **true size**; scale has no effect.
- A shape symbol goes before the number: **Ø** diameter, **R** radius, **SØ / SR** sphere, **□** square.
- Dimension **from datums** that suit function and machining, not "what looks nice".
- In test exercise 5 you write no numbers, just **symbols and placement**, but by the rules.

## Anatomy of a dimension

- **Extension lines:** narrow, from the outline, running 2–3 mm past the dimension line.
- **Dimension line:** narrow, parallel to what it measures, at least 10 mm from the outline, 7 mm between rows.
- **Arrows:** slim, filled, about 3 mm, sharp. No room: put them outside, or use dots or oblique strokes.
- **Figure:** 3.5 mm, **above** the dimension line with a small gap, centred. Read from the bottom or the right.

Nothing may cross a figure or an arrowhead: break the line. Extension lines must not cross dimension lines, and dimensions don't go **inside** the outline if they can go outside.

Analogy: the extension lines say "from here to here", the dimension line is the tape measure between them, the figure is what the tape reads.

## Shape symbols

| Symbol | Meaning | Example |
|---|---|---|
| Ø | diameter | Ø40 |
| R | radius | R5 |
| SØ | sphere diameter | SØ20 |
| SR | sphere radius | SR10 |
| □ | square | □14 |
| ▷ | taper | ▷1:10 |
| x | thickness (size perpendicular to the view) | x3 |

No symbol means a plain length. A tolerance may follow: Ø100±0.5 or □100H11. Without one, the general tolerance of **ISO 2768** applies.

## Special features

- **Radii:** one arrow only, on the arc side. If the radius follows from more important dimensions, write just **R** with no number.
- **Sphere:** SR or SØ. If the arc's centre is off the sheet, the dimension line is drawn with a jog.
- **Taper:** the ratio of diameter difference to length (1:10). The symbol points the way it narrows.
- **Slope:** the same for a flat face, height difference over length.
- **Chamfers:** for safety (no cut fingers) and so parts slide together easily. A 45° chamfer is written short as **2×45°**. Any other angle needs two dimensions: length and angle.
- **Angles:** radial extension lines, arc-shaped dimension line.
- **Fillets:** with a rounded outline, take the extension line from the **imaginary intersection** of the extended faces.

## Holes

- **Through (open-end)** and **blind**. A drilled blind hole ends in a 118–120° cone; its depth is measured **without** the cone.
- **Countersinking:** a conical recess for a countersunk screw.
- **Counterboring:** a cylindrical recess for a socket-head screw.
- Simplified, a hole is just a centre line with **diameter × depth**, e.g. Ø8×20.
- Equal holes on a circle: "6× Ø10 EQS". With equal spacing the angle between them can be left out.
- Repeated features are dimensioned **once**.

## Dimensioning methods

![Chain, parallel and running dimensioning of one stepped part](/drawing/dimension-systems.svg "One part, three methods")

| Method | How | When |
|---|---|---|
| **Chain** | Each dimension starts where the previous ended | Only where piled-up error doesn't hurt the function |
| **Parallel (baseline)** | All from one datum | Accurate feature positions, errors don't pile up |
| **Combined** | A mix: important ones from the datum, small stuff in a chain | Most common in practice |
| **Running** | Parallel, squeezed onto one line, datum marked with a small circle | Saves space |
| **Coordinate** | An X, Y table for each hole | Lots of holes, CNC |

**Why a chain piles up error.** Say each dimension is made to ±0.1. Three in a chain put the last feature off by up to ±0.3. From a common datum each feature only drifts its own ±0.1. Like measuring five metres with a one-metre ruler: every step adds a bit more error.

**A closed chain is forbidden.** If you dimension every piece and the overall length too, one dimension is extra. The machinist can't hold them all at once. Leave the least important piece undimensioned (or give it as a reference in brackets).

## Datums

A datum is the surface or axis you measure from.

- **Operating datum:** the face a neighbouring part sits against, e.g. the shaft collar a gear pushes against.
- **Rotational datum:** the axis of a turned part. All diameters come from it.
- **Manufacturing datum:** where machining starts, e.g. the end face of the bar on the lathe.

Rules:

- Keep the dimensions of one feature (slot, hole) **in one view**.
- External dimensions on one side, internal on the other.
- Keep different manufacturing stages apart. Blank (casting) dimensions go **in brackets** as reference values.
- Symmetric features may be dimensioned from one side.

## What not to dimension

Don't write the obvious:

- that edges are perpendicular or parallel;
- the angles of a regular polygon;
- that features are symmetric about an axis;
- the radius of a semicircle joining two dimensioned faces;
- centres of concentric arcs;
- the spacing of holes on a pitch circle when their number is given;
- the depth of a through hole.

## The shaft from test exercise 5

Lecture 8 showed a typical shaft: a square end with a tapped hole, steps, a **keyseat**, a **flat**, and an **M30 thread with a run-out groove** at the end. What to put on it:

- step lengths from the **datum end face**, plus the overall length;
- diameters with **Ø** right on the view (no side view needed);
- the square with **□**;
- the keyseat: length and position on the main view, width and depth on a **removed cut** A–A;
- the thread as **M30** and its length;
- chamfers **2×45°**, fillets **R**;
- a **+T** mark next to dimensions that need a special tolerance.

## Videos

```video
https://www.youtube.com/watch?v=XIfOtKO3FJU | Dimensions in Engineering Drawing Explained (ISO)
https://www.youtube.com/watch?v=km-3sQ9kz20 | Dimensioning Rules in Engineering Drawings
https://www.youtube.com/watch?v=R9NIDuAix0w | Dimensioning: rules, symbols and best practices
https://www.youtube.com/watch?v=ZRVUZasogfs | How It's Made: crankshafts (casting and machining, lecture 4)
```

## Check yourself

```quiz
? May you chain every step of a shaft and add the overall length too?
- yes, it's safer
+ no, that's a closed chain
- only on an assembly drawing
> One dimension is extra; the part is over-defined.

? Which method is better when each hole's position is critical?
- chain
+ parallel (from a common datum)
- any

? How do you write a 2 mm 45° chamfer in short?
+ 2×45°
- 45×2
- R2
```

```cards
Default unit on a drawing :: mm, not written
Dimension line distance from outline :: at least 10 mm, 7 mm between rows
Sphere symbol :: S before Ø or R
General tolerance when none is given :: ISO 2768
Chain dimensioning :: errors pile up
Blank dimensions :: in brackets, for reference
Counterbore vs countersink :: cylinder vs cone
```
