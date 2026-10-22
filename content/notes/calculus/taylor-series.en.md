---
title: Taylor series and linearization
excerpt: Replacing a complicated function with a polynomial, where sin x ≈ x and small oscillations come from, and how to bound the error.
---

## The idea

Near a point $a$ a smooth function is approximated by a **polynomial** that matches its value and derivatives:

$$f(x) = f(a) + f'(a)(x-a) + \frac{f''(a)}{2!}(x-a)^2 + \dots + R_n(x).$$

## Series to know

$$e^x = 1 + x + \frac{x^2}{2!} + \dots,\quad \sin x = x - \frac{x^3}{3!} + \dots,\quad \cos x = 1 - \frac{x^2}{2!} + \dots$$

$$\ln(1+x) = x - \frac{x^2}{2} + \dots,\quad (1+x)^k = 1 + kx + \dots$$

## Remainder

Lagrange form: $R_n = \dfrac{f^{(n+1)}(\xi)}{(n+1)!}(x-a)^{n+1}$. For $\sin x \approx x$ at 0.2 rad the error is below $x^3/6 \approx 0.0013$, so the **small-angle approximation** is fine up to 10–15°.

## Linearization in engineering

$f(x) \approx f(a) + f'(a)(x-a)$ powers: the small-oscillation pendulum ($T = 2\pi\sqrt{l/g}$), thermal expansion $L = L_0(1 + \alpha\Delta T)$, error propagation $\Delta f \approx |f'|\Delta x$, Newton's method $x_{k+1} = x_k - f/f'$, and stability analysis around equilibrium.

## Fourier series in one line

Instead of powers, expand a periodic function in sines and cosines: $f(x) = \frac{a_0}{2} + \sum (a_n\cos\frac{n\pi x}{L} + b_n\sin\frac{n\pi x}{L})$. Used for vibrations, signals and heat conduction.

```calc
x = 0.3 | 0..1.6 | rad | Angle
plot t: 0..1.6 | sin(t) | sin x
plot t: 0..1.6 | t | approximation x
plot t: 0..1.6 | t - t^3/6 | x − x³/6
err = abs(sin(x) - x) / sin(x) * 100 | | % | Error of sin x ≈ x
axes: x, rad ; y
```

## Flashcards

```cards
Maclaurin series of $e^x$ :: $1 + x + x^2/2! + \dots$
Series of $\sin x$ :: $x - x^3/3! + \dots$
Linearization at $a$ :: $f(a) + f'(a)(x - a)$
Newton's method :: $x_{k+1} = x_k - f(x_k)/f'(x_k)$
```
