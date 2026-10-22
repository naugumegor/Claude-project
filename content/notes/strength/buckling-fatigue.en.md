---
title: Buckling of columns and fatigue
excerpt: Euler's formula, effective length factor, slenderness and its limits, the Tetmajer–Jasinski line, plus metal fatigue, the S–N curve and the endurance limit.
---

## Buckling

A slender column fails by sudden lateral deflection at the **critical load**, often far below yield.

$$F_\text{cr} = \frac{\pi^2EI_{\min}}{(\mu l)^2}$$

Use the **minimum** $I$. Effective length factor $\mu$: fixed–free 2, pinned–pinned 1, fixed–pinned 0.7, fixed–fixed 0.5.

Radius of gyration $i = \sqrt{I/A}$, slenderness $\lambda = \mu l/i$, $\sigma_\text{cr} = \pi^2E/\lambda^2$. Euler is valid for $\lambda \ge \pi\sqrt{E/\sigma_\text{pl}} \approx 100$ for mild steel; intermediate columns use the linear Tetmajer–Jasinski formula $\sigma_\text{cr} = a - b\lambda$; stocky ones are checked in plain compression. Tubes are ideal columns.

```calc
E = 200 | 70..210 | GPa | Young's modulus
d = 30 | 5..200 | mm | Rod diameter
l = 1500 | 100..6000 | mm | Length
mu = 1 | 0.5..2 | | Effective length factor
I = pi*d^4/64 | | mm⁴ | Second moment
lam = mu*l/(d/4) | | | Slenderness
Fcr = pi^2*E*1000*I/(mu*l)^2/1000 | | kN | Euler load
```

## Fatigue

Cyclic stress breaks parts below yield. Cracks start at stress raisers and the surface; the fracture shows beach marks and a final rough zone. Cycle: amplitude $\sigma_a$, mean $\sigma_m$, ratio $R = \sigma_{\min}/\sigma_{\max}$ ($R = -1$ fully reversed). Steels have an **endurance limit** $\sigma_{-1} \approx (0.4\dots0.5)\sigma_u$ at about $10^7$ cycles; aluminium does not. Notches, size and surface finish lower it; shot peening, rolling and nitriding raise it.

## Flashcards

```cards
Euler load :: $\pi^2EI_{\min}/(\mu l)^2$
Fixed–free effective length factor :: 2
Slenderness :: $\lambda = \mu l/i$
Steel endurance limit :: $\approx (0.4\dots0.5)\sigma_u$
```
