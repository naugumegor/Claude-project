---
title: "Dynamics: Newton's laws, general theorems and d'Alembert's principle"
excerpt: The two problems of dynamics, momentum, angular momentum and energy theorems, moments of inertia, d'Alembert's principle and impact.
---

## Two problems

$m\vec a = \sum\vec F$. Direct problem: motion known, find forces. Inverse problem: forces known, integrate for motion.

## General theorems

1. **Centre of mass**: $M\vec a_C = \sum\vec F^e$; internal forces do not move it.
2. **Momentum**: $d\vec Q/dt = \sum\vec F^e$; conserved when external forces vanish.
3. **Angular momentum**: $d\vec K_O/dt = \sum\vec M_O^e$; about a fixed axis $J_z\varepsilon = \sum M_z$.
4. **Kinetic energy**: $T_2 - T_1 = \sum A$. $T = \frac12Mv_C^2 + \frac12J_C\omega^2$ for planar motion. Ideal constraints do no work, so no reactions are needed. Power $N = Fv = M\omega$.

## Moments of inertia

Rod about centre $ml^2/12$, disk $mR^2/2$, ring $mR^2$, solid sphere $\frac25mR^2$. Parallel axis: $J = J_C + Md^2$ (rod about its end: $ml^2/3$).

## d'Alembert's principle

Add inertia forces $-m\vec a$ and inertia moments $-J\varepsilon$, then solve as statics. This is how force analysis of mechanisms is done. An unbalanced rotor with eccentricity $e$ produces a rotating force $me\omega^2$, hence balancing.

## Impact

Coefficient of restitution $k = |u|/|v|$; momentum is conserved during impact, kinetic energy is not unless $k = 1$.

## Flashcards

```cards
Rotation equation :: $J_z\varepsilon = \sum M_z$
Work–energy theorem :: $T_2 - T_1 = \sum A$
Parallel axis theorem :: $J = J_C + Md^2$
Inertia force :: $-m\vec a$
Unbalance force :: $me\omega^2$
```
