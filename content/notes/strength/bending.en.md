---
title: "Beam bending: shear and moment diagrams, stresses, deflections"
excerpt: Sign conventions, the differential relations, rules for checking diagrams, bending stress, efficient sections and deflections with a live calculator.
---

## Internal forces

Shear force $Q$ and bending moment $M$. $M > 0$ when the beam sags (bottom fibres in tension).

## Differential relations

$dQ/dx = q$, $dM/dx = Q$. Hence: no load means constant $Q$ and linear $M$; uniform load means linear $Q$ and parabolic $M$; a point force makes a jump in $Q$ and a kink in $M$; a point moment makes a jump in $M$; $M$ peaks where $Q = 0$.

## Standard cases

| Case | $M_{\max}$ | $f_{\max}$ |
|---|---|---|
| Cantilever, end load | $Fl$ | $Fl^3/3EI$ |
| Cantilever, uniform $q$ | $ql^2/2$ | $ql^4/8EI$ |
| Simply supported, central $F$ | $Fl/4$ | $Fl^3/48EI$ |
| Simply supported, uniform $q$ | $ql^2/8$ | $5ql^4/384EI$ |

Combine with superposition.

## Stresses

$\sigma = My/I_x$, $\sigma_{\max} = M/W_x$. Rectangle $W = bh^2/6$, circle $W = \pi d^3/32$. Put material far from the neutral axis (I-beams). Shear: $\tau = QS/(Ib)$, $\tau_{\max} = 1.5Q/A$ for a rectangle.

## Deflection

$EIy'' = M(x)$; integrate twice with boundary conditions. Typical limit $l/250$ for floor beams.

```calc
l = 3 | 0.5..10 | m | Span
q = 10 | 0..100 | kN/m | Uniform load
E = 200 | 70..210 | GPa | Young's modulus
I = 1840 | 100..30000 | cm⁴ | Second moment of area
W = 184 | 10..2000 | cm³ | Section modulus
Mmax = q*l^2/8 | | kN·m | Max moment
smax = Mmax*1000/W | | MPa | Max stress
f = 5*q*l^4/(384*E*I)*1e5 | | mm | Midspan deflection
plot x: 0..l | q*x*(l - x)/2 | M(x), kN·m
plot x: 0..l | q*(l/2 - x) | Q(x), kN
axes: x, m ; Q, M
```

## Flashcards

```cards
Differential relations :: $dQ/dx = q$, $dM/dx = Q$
Bending stress :: $\sigma = My/I$
Rectangle section modulus :: $bh^2/6$
Simply supported beam, uniform load :: $M = ql^2/8$, $f = 5ql^4/384EI$
```
