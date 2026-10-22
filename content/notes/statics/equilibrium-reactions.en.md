---
title: "Statics: forces, moments, supports and reactions"
excerpt: Moment of a force, couples, support types and their reactions, equilibrium equations and a step-by-step method for problems.
---

## Force and moment

A force can slide along its line of action. Moment about $O$: $\vec M_O = \vec r\times\vec F$, $|M| = Fh$ with lever arm $h$. Varignon: $M_O = xF_y - yF_x$. A **couple** has the same moment $Fd$ about every point.

The key axiom: **replace a support by its reaction**.

## Supports

| Support | Reactions |
|---|---|
| Roller | 1 force normal to the surface |
| Pin | 2 forces |
| Fixed (cantilever) | 2 forces + moment |
| Cable | 1 tension along the cable |
| Two-force link | 1 force along the link |

## Equilibrium

Planar: $\sum F_x = 0$, $\sum F_y = 0$, $\sum M_A = 0$ (3 equations); spatial: 6. More unknowns than equations means **statically indeterminate** (needs deformations), fewer means a mechanism.

Replace distributed load by its resultant: uniform $qa$ at mid-span; triangular $qa/2$ at $a/3$ from the larger end.

## Method

Isolate the body, draw reactions, take moments about the point where most unknowns meet, solve, and check with another moment equation.

Example: simply supported 6 m beam, 12 kN at 2 m, 4 kN/m on the right half: $R_B = 13$ kN, $R_A = 11$ kN, check $\sum F_y = 0$.

```calc
l = 6 | 2..12 | m | Span
F = 12 | 0..50 | kN | Point load
a = 2 | 0..l | m | Load position from A
q = 4 | 0..20 | kN/m | Load on the right half
RB = (F*a + q*(l/2)*(3*l/4)) / l | | kN | Reaction B
RA = F + q*l/2 - RB | | kN | Reaction A
```

## Flashcards

```cards
Moment of a force :: $M = Fh$
Fixed support reactions :: two forces and a moment
Planar equilibrium :: $\sum F_x = 0$, $\sum F_y = 0$, $\sum M = 0$
Triangular load resultant :: $qa/2$ at $a/3$ from the larger end
```
