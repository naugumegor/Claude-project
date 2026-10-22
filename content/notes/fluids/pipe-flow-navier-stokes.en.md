---
title: Pipe flow, head losses and the Navier–Stokes equations
excerpt: Reynolds number, laminar and turbulent flow, Darcy–Weisbach, the Moody chart, minor losses, water hammer, and what Navier–Stokes is and why CFD is hard.
---

## Reynolds number

$Re = vd/\nu$: laminar below ~2300, turbulent above ~4000. Water at 1 m/s in a 50 mm pipe: $Re = 50\,000$. Non-circular ducts use $d_h = 4A/P$.

## Major losses

Darcy–Weisbach: $\Delta p = \lambda\frac{l}{d}\frac{\rho v^2}{2}$. Laminar $\lambda = 64/Re$; smooth turbulent (Blasius) $0.316/Re^{0.25}$; general Colebrook–White $\frac{1}{\sqrt\lambda} = -2\lg\left(\frac{\Delta/d}{3.7} + \frac{2.51}{Re\sqrt\lambda}\right)$, explicit Altshul $0.11(\Delta/d + 68/Re)^{0.25}$, plotted as the Moody chart. At constant flow rate $\Delta p \sim 1/d^5$.

## Minor losses

$h = \zeta v^2/2g$: sharp inlet 0.5, exit 1.0, smooth 90° bend 0.2–0.3, sharp elbow ~1.1, open gate valve 0.1–0.2. Sudden expansion (Borda): $(v_1 - v_2)^2/2g$.

System curve $H = H_\text{st} + kQ^2$; the pump operates where its curve crosses it.

## Water hammer

Joukowsky: $\Delta p = \rho c\Delta v$, $c \approx 1000$–1400 m/s; stopping 2 m/s gives 2–2.8 MPa. Close valves slower than $2l/c$.

## Navier–Stokes

$$\rho\left(\frac{\partial\vec v}{\partial t} + (\vec v\cdot\nabla)\vec v\right) = -\nabla p + \mu\nabla^2\vec v + \rho\vec g,\quad \nabla\cdot\vec v = 0.$$

The convective term is nonlinear and drives turbulence. Without viscosity you get Euler's equations and, along a streamline, Bernoulli. Smoothness in 3D is a Millennium Prize problem. CFD uses RANS (k-ε, k-ω SST) for speed and LES for accuracy; DNS only at low $Re$.

```calc
Q = 10 | 0.5..100 | m³/h | Flow rate
d = 50 | 10..300 | mm | Inner diameter
l = 100 | 1..1000 | m | Length
rough = 0.1 | 0.001..2 | mm | Roughness
nu = 1 | 0.3..100 | mm²/s | Viscosity
v = Q/3600/(pi*(d/1000)^2/4) | | m/s | Velocity
Re = v*(d/1000)/(nu*1e-6) | | | Reynolds number
lam = 0.11*(rough/d + 68/Re)^0.25 | | | Friction factor
dp = lam*l/(d/1000)*1000*v^2/2/1000 | | kPa | Pressure loss
```

## Flashcards

```cards
Reynolds number :: $vd/\nu$
Laminar friction factor :: $64/Re$
Darcy–Weisbach :: $\Delta p = \lambda (l/d)\rho v^2/2$
Joukowsky :: $\Delta p = \rho c\Delta v$
```
