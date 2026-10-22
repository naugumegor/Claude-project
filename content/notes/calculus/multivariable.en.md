---
title: "Multivariable calculus: partial derivatives, gradient, extrema"
excerpt: Partial derivatives, total differential, gradient, extrema and Lagrange multipliers, double integrals, with mechanics and optimization examples.
---

## Partial derivatives

Differentiate with respect to **one variable, holding the others constant**. For $f = x^2 y + \sin y$: $f_x = 2xy$, $f_y = x^2 + \cos y$. For smooth functions $f_{xy} = f_{yx}$.

## Total differential and error estimates

$df = f_x\,dx + f_y\,dy$. For $\sigma = F/A$: $\Delta\sigma/\sigma \approx \Delta F/F + \Delta A/A$.

## Gradient

$\nabla f = (f_x, f_y, f_z)$ points to the **steepest ascent** and is **normal to level sets**. Directional derivative: $\nabla f\cdot\vec l$. Examples: Fourier's law $\vec q = -\lambda\nabla T$, $\vec F = -\nabla U$, gradient descent.

## Extrema

Stationary point: $f_x = f_y = 0$. With $A = f_{xx}$, $B = f_{xy}$, $C = f_{yy}$: $AC - B^2 > 0$ and $A > 0$ is a minimum, $A < 0$ a maximum; $AC - B^2 < 0$ is a saddle.

## Lagrange multipliers

Extremize $f$ subject to $g = 0$: solve $\nabla(f - \lambda g) = 0$, $g = 0$.

Strongest beam cut from a log of diameter $d$: maximize $W = bh^2/6$ with $b^2 + h^2 = d^2$. Result: $h/b = \sqrt2$.

## Double integrals

Evaluate as iterated integrals; for circles use polar coordinates, $dA = r\,dr\,d\varphi$. Polar moment of a disk: $I_p = \pi R^4/2 = \pi d^4/32$, used later in shaft torsion.

## Flashcards

```cards
Gradient :: $(f_x, f_y, f_z)$, direction of steepest ascent
Minimum test :: $AC - B^2 > 0$ and $A > 0$
Lagrangian :: $L = f - \lambda g$
Polar area element :: $dA = r\,dr\,d\varphi$
Polar moment of a disk :: $I_p = \pi d^4/32$
```
