---
title: Trusses, friction and centroids
excerpt: Method of joints and method of sections, zero-force members, sliding and rolling friction, the capstan equation and centroids of composite shapes.
---

## Trusses

Pin-jointed straight members loaded at the joints carry **only axial force**. Planar determinacy: $m = 2j - 3$.

- **Method of joints**: assume all members in tension, start at a joint with at most two unknowns.
- **Method of sections (Ritter)**: cut three members and take moments about the point where two of them meet.
- **Zero-force members**: an unloaded two-member joint (non-collinear) has both zero; an unloaded three-member joint with two collinear members has the third zero.

## Friction

Coulomb: $F \le fN$; friction angle $\tan\varphi = f$; self-locking when $\alpha \le \varphi$. Capstan (Euler) equation $T_2 = T_1e^{f\beta}$: three turns at $f = 0.3$ give a factor of about 285. Rolling resistance $M = \delta N$, so $F = \delta N/R$ and larger wheels roll easier.

## Centroids

$x_c = \sum A_ix_i/\sum A_i$; holes count as negative areas. Triangle: $h/3$ from the base; semicircle: $4R/3\pi$ from the diameter; semicircular arc: $2R/\pi$; solid cone: $h/4$. Symmetry axes contain the centroid.

## Flashcards

```cards
Planar truss determinacy :: $m = 2j - 3$
Self-locking condition :: $\alpha \le \varphi$
Capstan equation :: $T_2 = T_1 e^{f\beta}$
Semicircle centroid :: $4R/(3\pi)$ from the diameter
```
