---
title: Hydrostatics and Bernoulli's equation
excerpt: Pressure in fluids, Pascal's law, force on a wall, Archimedes. Continuity, Bernoulli for ideal and real fluids, Pitot tube and Venturi meter.
---

## Properties

Water ρ ≈ 1000 kg/m³, $\nu \approx 10^{-6}$ m²/s at 20 °C, bulk modulus 2.1 GPa (treated as incompressible).

## Hydrostatics

$p = p_0 + \rho gh$: 10 m of water ≈ 1 atm. Absolute, gauge and vacuum pressure. **Pascal's law** powers presses and brakes: $F_2 = F_1A_2/A_1$.

Force on a flat wall $F = \rho gh_cA$, acting below the centroid: $y_D = y_c + I_c/(y_cA)$; a vertical rectangle from the surface gives $\rho gH^2b/2$ at $2H/3$. **Archimedes**: $F = \rho gV$; floating stability needs the metacentre above the centre of gravity.

## Flow

$Q = vA$, continuity $v_1A_1 = v_2A_2$.

**Bernoulli** (ideal, incompressible, along a streamline): $z + p/\rho g + v^2/2g = \text{const}$. Real fluid: add head loss $h_L$ and kinetic energy factor $\alpha$ (1 turbulent, 2 laminar). Pump power $N = \rho gQH/\eta$.

## Uses

Orifice $Q = \mu A\sqrt{2gH}$ ($\mu \approx 0.62$), Pitot $v = \sqrt{2\Delta p/\rho}$, Venturi $Q = A_2\sqrt{2\Delta p/(\rho(1 - (A_2/A_1)^2))}$, cavitation when pressure drops below vapour pressure.

```calc
D1 = 100 | 20..300 | mm | Inlet diameter
D2 = 50 | 10..200 | mm | Throat diameter
dp = 20 | 0.1..200 | kPa | Pressure difference
rho = 1000 | 700..1200 | kg/m³ | Density
A1 = pi*(D1/1000)^2/4 | | m² | Area 1
A2 = pi*(D2/1000)^2/4 | | m² | Area 2
Q = A2*sqrt(2*dp*1000/(rho*(1 - (A2/A1)^2)))*3600 | | m³/h | Flow rate
```

## Flashcards

```cards
Hydrostatic pressure :: $p = p_0 + \rho gh$
Continuity :: $v_1A_1 = v_2A_2$
Bernoulli :: $z + p/\rho g + v^2/2g = \text{const}$
Pump power :: $\rho gQH/\eta$
```
