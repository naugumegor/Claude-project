---
title: "Mechanism structure: links, joints and degrees of freedom"
excerpt: Kinematic pairs and chains, the Chebyshev–Grübler–Kutzbach mobility formulas, Assur groups, redundant constraints, the slider-crank and the Grashof four-bar.
---

## Basics

**Link**, **frame**, **kinematic pair** (joint) classified by the constraints it imposes. Lower pairs (revolute, prismatic, screw, cylindrical, spherical) touch over a surface; higher pairs (cam, gear teeth) over a line or point.

## Mobility

Spatial (Somov–Malyshev / Kutzbach): $W = 6n - 5p_5 - 4p_4 - 3p_3 - 2p_2 - p_1$.
Planar (Chebyshev / Grübler): $W = 3n - 2p_l - p_h$.

Slider-crank: $n = 3$, $p_l = 4$, $W = 1$. A triangle truss gives $W = 0$. A roller follower adds a local idle freedom that is subtracted. Redundant constraints $q$: $W = 3n - 2p_l - p_h + q$; such mechanisms need tight tolerances or self-aligning joints.

## Assur groups

Any mechanism is a driver plus zero-mobility **Assur groups**; the simplest is the dyad (2 links, 3 pairs, class II: RRR, RRP, RPR, PRP, RPP). Kinematic and force analysis proceed group by group.

## Four-bar and Grashof

With shortest $a$ and longest $d$: if $a + d \le b + c$, at least one link fully rotates (crank-rocker when the shortest is adjacent to the frame, double-crank when it is the frame, double-rocker when opposite). Keep the transmission angle above 40–45°.

## Slider-crank kinematics

$x \approx r(1 - \cos\varphi + \frac{\lambda}{2}\sin^2\varphi)$, $v \approx r\omega(\sin\varphi + \frac{\lambda}{2}\sin2\varphi)$, $a \approx r\omega^2(\cos\varphi + \lambda\cos2\varphi)$, $\lambda = r/l$. The $\lambda$ term causes second-order vibration in inline-four engines.

```calc
r = 40 | 10..100 | mm | Crank radius
l = 140 | 50..400 | mm | Rod length
n = 3000 | 100..8000 | rpm | Speed
w = pi*n/30 | | rad/s | Angular speed
lam = r/l | | | λ = r/l
plot f: 0..2*pi | r*(1 - cos(f) + lam/2*sin(f)^2) | x(φ), mm
plot f: 0..2*pi | r/1000*w*(sin(f) + lam/2*sin(2*f)) | v(φ), m/s
axes: φ, rad ; x, v
```

## Flashcards

```cards
Planar mobility :: $W = 3n - 2p_l - p_h$
Assur group :: zero-mobility structural group
Grashof condition :: $s + l \le p + q$
Slider stroke :: $2r$
```
