---
title: "Drawing 10. Tolerances and fits: why Ø50 is never exactly 50"
excerpt: "Lecture 7, seminar 6. Size scatter and the cost of accuracy, nominal size, deviations and tolerance, letters (zone position) and IT grades, H7 and g6, clearance, transition and interference fits, hole-basis and shaft-basis systems, ISO tables, and the lecture's worked problems: Ø62 for easy assembly, 35 H6/r5 and the key fits."
---

## The whole topic in a minute

- You can't make a part **exactly** 50.000 mm. So you give an **allowed corridor**: from and to.
- The narrower the corridor, the **more expensive**: rough turning ±0.5, standard machining ±0.1, grinding ±0.01, honing ±0.005. Use the widest tolerance that still works.
- A standard tolerance is a **letter and a number**: Ø50 H7. The **letter** is where the corridor sits (relative to nominal), the **number** is its width (IT grade).
- **Capitals** for holes (H), **lower case** for shafts (g).
- A fit is a pair: Ø50 H7/g6. It's **clearance**, **transition** or **interference**.
- Usually the **hole-basis system** is used: the hole is always H, and the fit is chosen through the shaft.

## Why tolerances at all

Analogy: you order 100 copies of your flat key. Each is slightly different, but they all open the lock. "Slightly" is the tolerance. Allow too much and some keys won't open; demand too much and the keys cost like jewellery.

Causes of scatter: machine inaccuracy, tool wear, temperature, measuring error. The part is good if its size is inside the corridor.

## Terms

| Term | Meaning |
|---|---|
| Nominal size (N) | The number on the drawing, e.g. 50 |
| Upper limit of size | The largest allowed |
| Lower limit of size | The smallest allowed |
| Upper and lower deviation | How far the limits are from nominal (ES, EI for holes; es, ei for shafts) |
| Tolerance T | The corridor's width: T = upper − lower = ES − EI |
| Zero line | The nominal size on the zone diagram |

Example: Ø50 +0.025/0 means anything from 50.000 to 50.025, tolerance 0.025.

## How it's written

- **One-way limit:** only a max or only a min ("not more than").
- **Individual deviations:** Ø50 +0.025/−0.010, 40±0.1.
- **Standard tolerance:** Ø50 H7, Ø50 g6. Numbers come from ISO tables.

A zone can be **unilateral** (both limits on one side of nominal, like +0.025/0) or **bilateral** (either side, like ±0.1).

## Letter and number

- The **letter** (fundamental deviation) says **where** the corridor is. For holes A…Z: from A (well above nominal) to Z (well below). **H** starts exactly at nominal and goes up. For shafts a…z mirror it: **h** ends exactly at nominal and goes down; f, g sit below nominal (thinner shaft, clearance); k, n, p, r, s sit above (fatter shaft, interference).
- The **number** (IT grade) says **how wide** the corridor is. There are 20 grades: IT01, IT0, IT1 … IT18. Smaller number, more accurate. IT5–IT7 for bearings and precise fits, IT8–IT11 for ordinary machining, IT12 and up for rough blanks.
- The width also depends on **size**: IT7 is 15 µm at Ø10 but 35 µm at Ø100. A big part can't be made as precisely the same way.

## Fits

![Clearance, transition and interference fits in the hole-basis system](/drawing/fits.svg "The H hole zone stays put; the shaft chooses the fit")

| Fit | What | Example | Used for |
|---|---|---|---|
| **Clearance** | Shaft always smaller than the hole | `H7/g6`, `H8/f7` | Plain bearings, moving parts |
| **Transition** | Either a gap or interference | `H7/k6`, `H7/n6` | Accurate location, keyed gears, comes apart with a mallet |
| **Interference** | Shaft always bigger than the hole | `H7/p6`, `H7/s6` | Press fits: wheel on axle, bushing in housing |

Analogy: clearance is a finger in a loose ring. Transition is a ring that only just goes on. Interference is a ring two sizes too small: only with soap or heat.

**Hole basis:** the hole is always **H** (lower deviation 0), the fit is chosen via the shaft. Used more often, because making holes in ten variants needs a full set of reamers and gauges, while a shaft is easy to turn to any size.

**Shaft basis:** the shaft is always **h**, the hole is chosen. For bought parts whose outer size is already fixed: a bearing's outer ring, ground bar, a key.

## Worked problems from the lecture

**Problem 1. Ø62 for easy assembly.** We need clearance in the hole basis, so take `Ø62 H7/g6`. 62 falls in the 50–80 range.
- Hole H7: IT7 = 30 µm, so **+0.030 / 0**.
- Shaft g6: fundamental deviation g = −10 µm, IT6 = 19 µm, so **−0.010 / −0.029**.
- Least clearance = 0 − (−0.010) = **0.010**. Largest clearance = 0.030 − (−0.029) = **0.059**. Always a gap, correct.

**Problem 2. 35 for assembly with high force: H6/r5.** Range 30–50.
- Hole H6: IT6 = 16 µm, **+0.016 / 0**.
- Shaft r5: ei = +34 µm, IT5 = 11 µm, **+0.045 / +0.034**.
- Least interference = 0.034 − 0.016 = **0.018**. Largest interference = 0.045 − 0 = **0.045**. Always interference: a press fit.

**Problem 4. Fits of a 6 mm wide key.** Key `h8`: 0 / −0.018. Shaft keyseat `P9`: −0.012 / −0.042. Hub keyway `Js9`: ±0.015.

Formulas (the groove is the hole, the key is the shaft):
- **Largest clearance** = max hole − min shaft.
- **Largest interference** = max shaft − min hole.

| Pair | Largest clearance | Largest interference | Type |
|---|---|---|---|
| Key h8 / shaft keyseat P9 | −0.012 − (−0.018) = **0.006** | 0 − (−0.042) = **0.042** | transition, nearly interference: the key sits tight in the shaft |
| Key h8 / hub keyway Js9 | 0.015 − (−0.018) = **0.033** | 0 − (−0.015) = **0.015** | transition: the hub slides on more easily |

Typical questions: find the limits of a size, find the largest interference and least clearance, name the type of fit.

> Quick test: if the hole's lowest edge is above the shaft's highest edge, it's always clearance. If the shaft's lowest edge is above the hole's highest edge, always interference. Otherwise, transition.

## Videos

```video
https://www.youtube.com/watch?v=rXQgJcBlaj0 | Hole basis and shaft basis, simply explained (tec-science)
https://www.youtube.com/watch?v=PDh6KO0bTA0 | Hole-basis and shaft-basis systems
https://www.youtube.com/watch?v=_57usPCAtM8 | Engineering fits and tolerances (Machining Doctor)
```

## Check yourself

```quiz
? Ø40 H7 is
+ a hole, lower deviation 0, grade 7
- a shaft, upper deviation 0
- a hole with a 7 mm tolerance

? Shaft 0/−0.018, hole −0.012/−0.042. Largest interference?
- 0.006
+ 0.042
- 0.024
> Max shaft 0 minus min hole −0.042.

? Why is the hole-basis system used more often?
+ holes are harder to make in many variants, shafts are easy to turn
- holes are more accurate than shafts
- ISO 2768 says so
```

```cards
Capital letter in a tolerance :: hole
Lower-case letter :: shaft
H :: hole lower deviation = 0
h :: shaft upper deviation = 0
Number after the letter :: IT grade, the zone's width
Tolerance T :: upper limit − lower limit
Largest clearance :: max hole − min shaft
Largest interference :: max shaft − min hole
H7/g6 :: clearance fit
H7/p6 :: interference fit
```
