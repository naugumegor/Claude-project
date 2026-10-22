---
title: "Shafts and bearings: design and selection"
excerpt: Preliminary and fatigue design of shafts, stepped shaft layout, rolling bearing types, designations, dynamic load rating and L10 life, plus plain bearings in brief.
---

## Shaft vs axle

A shaft transmits torque (bending + torsion), an axle only supports (bending).

## Shaft design

1. **Preliminary diameter** from torsion with a low allowable: $d \ge \sqrt[3]{T/(0.2[\tau])}$, $[\tau] = 15$–25 MPa. Then lay out steps: coupling end, seal, bearing seat (multiples of 5 mm), shoulder, gear seat, locating shoulder.
2. **Layout and diagrams**: beam on two supports, mesh and overhung loads, reactions in two planes, $M = \sqrt{M_x^2 + M_y^2}$.
3. **Fatigue check**: fully reversed bending, pulsating torsion; $s_\sigma = \sigma_{-1}/(K_{\sigma D}\sigma_a + \psi_\sigma\sigma_m)$, likewise $s_\tau$, combined $s = s_\sigma s_\tau/\sqrt{s_\sigma^2 + s_\tau^2} \ge 1.5$–2.5 at every critical section (keyways, fillets, press fits). Also check peak static load and stiffness.

## Rolling bearings

Deep-groove ball (cheap, fast, moderate axial), angular contact ball (in pairs), tapered roller (heavy combined loads), cylindrical roller (heavy radial, floating support), spherical (self-aligning), needle (compact), thrust (axial only).

GOST designation: last two digits × 5 = bore (for 20–495 mm; 00 = 10, 01 = 12, 02 = 15, 03 = 17). GOST 207 ≈ ISO 6207.

Equivalent load $P = (XVF_r + YF_a)K_bK_T$. Life $L_{10} = (C/P)^p$ million revolutions, $p = 3$ ball, $10/3$ roller; hours $L_{10h} = 10^6L_{10}/(60n)$. Doubling load cuts ball bearing life by 8.

```calc
C = 25.5 | 5..200 | kN | Dynamic load rating
P = 3 | 0.5..50 | kN | Equivalent load
n = 500 | 10..10000 | rpm | Speed
p = 3 | 3..3.34 | | Exponent
L10 = (C/P)^p | | Mrev | Life
L10h = L10*1e6/(60*n) | | h | Life in hours
```

Arrangements: cross-located (short shafts) or locating + floating.

## Plain bearings

Hydrodynamic oil wedge separates surfaces; for very high loads and speeds, split housings, shock. Simple check: $p = F/(dl) \le [p]$, $pv \le [pv]$.

## Flashcards

```cards
Preliminary shaft diameter :: $\sqrt[3]{T/(0.2[\tau])}$
Bearing life :: $L_{10} = (C/P)^p$
Ball bearing exponent :: 3
Bore of a 208 / 6208 bearing :: 40 mm
```
