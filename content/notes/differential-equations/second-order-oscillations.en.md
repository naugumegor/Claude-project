---
title: Second-order linear ODEs and vibrations
excerpt: Characteristic equation, the three root cases, forced vibrations, resonance and the dynamic amplification factor, using the mass-spring system.
---

## The equation

$m\ddot x + b\dot x + cx = F(t)$, or with **natural frequency** $\omega_0 = \sqrt{c/m}$ and **damping ratio** $\zeta = b/(2\sqrt{cm})$:

$$\ddot x + 2\zeta\omega_0\dot x + \omega_0^2 x = F/m.$$

## Homogeneous solution

Characteristic equation $ar^2 + br + c = 0$:

| Roots | Solution | Mechanics |
|---|---|---|
| Real distinct | $C_1e^{r_1x} + C_2e^{r_2x}$ | overdamped, $\zeta > 1$ |
| Repeated | $(C_1 + C_2x)e^{rx}$ | critically damped, $\zeta = 1$ |
| $\alpha \pm i\beta$ | $e^{\alpha x}(C_1\cos\beta x + C_2\sin\beta x)$ | underdamped, $\zeta < 1$ |

Damped frequency $\omega_d = \omega_0\sqrt{1-\zeta^2}$; log decrement $\delta \approx 2\pi\zeta$.

## Forced response

General = homogeneous + particular. Guess the particular solution from the right-hand side; multiply by $x$ if it matches a characteristic root (that is resonance).

For $F_0\sin\omega t$: $X = \dfrac{F_0/c}{\sqrt{(1-\eta^2)^2 + (2\zeta\eta)^2}}$, $\eta = \omega/\omega_0$. Peak amplification $\approx 1/(2\zeta)$. Vibration isolation needs $\eta > \sqrt2$, in practice 3–4.

```calc
m = 50 | 1..500 | kg | Mass
c = 200000 | 10000..2000000 | N/m | Stiffness
z = 0.05 | 0.005..1 | | Damping ratio ζ
w0 = sqrt(c/m) | | rad/s | Natural frequency
plot e: 0..3 | 1/sqrt((1 - e^2)^2 + (2*z*e)^2) | μ(η)
axes: η = ω/ω₀ ; μ
```

## Flashcards

```cards
Natural frequency :: $\omega_0 = \sqrt{c/m}$
Damping ratio :: $\zeta = b/(2\sqrt{cm})$
Damped frequency :: $\omega_0\sqrt{1-\zeta^2}$
Peak amplification :: $\approx 1/(2\zeta)$
```
