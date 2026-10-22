---
title: "Tension and compression: Hooke's law, the stress–strain curve, strength design"
excerpt: Method of sections, normal stress, Hooke's law and Poisson's ratio, the steel tensile curve, allowable stress and the three kinds of problems.
---

## Method of sections

Cut, discard one part, replace it with internal forces, balance the rest. In tension/compression the only internal force is the **axial force** $N$ (tension positive).

## Stress and strain

$\sigma = N/A$ (1 MPa = 1 N/mm²). Hooke: $\sigma = E\varepsilon$, $\Delta l = Nl/(EA)$. $E$: steel ≈ 200–210 GPa, aluminium ≈ 70, copper and titanium ≈ 110. Poisson's ratio: steel ≈ 0.3, rubber ≈ 0.5, cork ≈ 0. Thermal strain $\alpha\Delta T$; a restrained steel bar heated by 50 °C sees $E\alpha\Delta T \approx 120$ MPa.

## Tensile curve of mild steel

Proportional limit, elastic limit, **yield strength** $\sigma_y$ (≈ 240 MPa for S235-class steel; use the 0.2% offset $\sigma_{0.2}$ when there is no yield plateau), **ultimate strength** $\sigma_u$ (≈ 380–460 MPa), necking, fracture. Ductility: elongation and reduction of area. Brittle materials (cast iron, glass) fail without plastic strain.

## Strength design

$\sigma_{\max} = N_{\max}/A \le [\sigma] = \sigma_\text{lim}/[n]$, with $\sigma_y$ for ductile and $\sigma_u$ for brittle materials. Check, size ($A \ge N/[\sigma]$) or find the allowable load ($[\sigma]A$).

Example: 50 kN, steel with $\sigma_y = 360$ MPa, $[n] = 2$: $A \ge 278$ mm², $d = 20$ mm.

```calc
N = 50 | 1..300 | kN | Axial force
d = 20 | 5..80 | mm | Rod diameter
sT = 360 | 200..1200 | MPa | Yield strength
A = pi*d^2/4 | | mm² | Area
s = N*1000/A | | MPa | Stress
n = sT/s | | | Safety factor
```

## Stress concentration

$\sigma_{\max} = K_t\sigma_\text{nom}$; a small hole in a wide plate has $K_t = 3$. Critical for brittle materials and fatigue.

## Flashcards

```cards
Normal stress :: $\sigma = N/A$
Elongation :: $\Delta l = Nl/(EA)$
Young's modulus of steel :: ≈ 200 GPa
Strength condition :: $\sigma_{\max} \le \sigma_\text{lim}/[n]$
```
