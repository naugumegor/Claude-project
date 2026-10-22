---
title: Heat treatment and steel grades
excerpt: Annealing, normalizing, quenching, tempering, case hardening; martensite and TTT curves; how to read GOST steel grades and pick a steel for a shaft, spring or knife.
---

## The four operations

| Operation | Heating | Cooling | Result |
|---|---|---|---|
| Annealing | above $A_3$ or below $A_1$ | very slow, in the furnace | soft, stress-free |
| Normalizing | 30–50 °C above $A_3$ | still air | fine grain |
| Quenching | above $A_3$ ($A_1$ for hypereutectoid) | water, oil, polymer | martensite, max hardness |
| Tempering | below $A_1$ | any | less brittleness |

Never use a quenched part without tempering.

**Martensite** is carbon trapped in a distorted α-iron lattice, formed when cooling beats the critical rate and misses the nose of the TTT curve (~500–550 °C). Alloying (Cr, Ni, Mo, Mn) shifts the curves right: oil quenching and deeper **hardenability**.

Tempering: low 150–250 °C (tools, bearings, HRC 58–63), medium 350–500 °C (springs), high 500–650 °C (shafts, gears). Quench + high temper is called **hardening and tempering**.

Surface hardening: induction hardening, carburizing (low-carbon steels, then quench + low temper), nitriding (no quench, minimal distortion), carbonitriding.

## Reading GOST grades

- **St3sp**: plain carbon structural steel.
- **45**: quality carbon steel, carbon in hundredths of a percent (0.45%).
- **U8, U10A**: tool steel, carbon in tenths (0.8%, 1.0%).
- **40Kh, 12Kh18N10T**: alloy steels; letters are elements, numbers after them are percent. Kh Cr, N Ni, M Mo, G Mn, S Si, V W, F V, T Ti, Yu Al, D Cu, B Nb, R B, K Co.

12Kh18N10T ≈ AISI 321 austenitic stainless; ShKh15 ≈ 52100 bearing steel; R6M5 ≈ M2 high-speed steel; 65G spring steel; 45 ≈ C45 / 1045; 40Kh ≈ 41Cr4 / 5140.

## Choosing

Welded frame: St3, 09G2S. General shaft: 45, hardened and tempered. Loaded gear: 40Kh or carburized 20Kh / 18KhGT. Spring: 65G, 60S2A. Bearing: ShKh15. Knife: U8–U10. Drill: R6M5. Food/chemical: 12Kh18N10T.

Hardness: HB (ball), HRC (cone, hardened steel), HV (pyramid). $\sigma_u \approx 3.4\,\text{HB}$ MPa.

## Flashcards

```cards
Quench + high temper :: hardening and tempering (shafts, gears)
Spring tempering :: medium, 350–500 °C
Steel 45 :: 0.45% C quality carbon steel
12Kh18N10T :: 0.12% C, 18% Cr, 10% Ni, Ti
```
