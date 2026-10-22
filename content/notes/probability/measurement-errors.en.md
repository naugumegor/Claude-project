---
title: "Probability for experiments: errors, the normal distribution, least squares"
excerpt: Random variables, the normal law and the three-sigma rule, confidence intervals, propagation of uncertainty and least-squares fitting.
---

## Basics

Mean $M[X]$, variance $D[X] = M[X^2] - M[X]^2$, standard deviation $\sigma = \sqrt D$. Sample standard deviation uses $n - 1$ (Bessel's correction): $s = \sqrt{\frac{1}{n-1}\sum(x_i - \bar x)^2}$.

## Normal distribution

By the **central limit theorem**, many small independent effects add up to a normal law. **Three-sigma rule**: 68.3%, 95.4%, 99.73% within 1, 2, 3 σ. Process capability $C_p = T/6\sigma$; $C_p \ge 1.33$ is a common target.

## Confidence interval

$\bar x \pm t_{P,n-1}\,s/\sqrt n$; for $P = 0.95$, $t$ = 4.30 ($n = 3$), 2.78 ($n = 5$), 2.26 ($n = 10$), 1.96 ($n \to \infty$).

## Errors

Systematic (calibrate them out), random (average them down as $1/\sqrt n$), blunders (discard). Propagation for $y = f(x_i)$: $\Delta y = \sqrt{\sum(\partial f/\partial x_i\,\Delta x_i)^2}$. In $E = FL/(A\Delta L)$ the diameter enters squared, so measure it most carefully.

## Least squares

Minimize $\sum(y_i - kx_i - b)^2$: $k = \dfrac{n\sum xy - \sum x\sum y}{n\sum x^2 - (\sum x)^2}$, $b = \bar y - k\bar x$. Linearize power and exponential laws with logarithms. Check $R^2$.

```python
import numpy as np
F = np.array([0, 2, 4, 6, 8, 10]) * 1e3
dL = np.array([0.000, 0.012, 0.025, 0.037, 0.051, 0.063])
k, b = np.polyfit(dL, F, 1)
print("E, GPa:", k * 100 / (np.pi * 25) / 1e3)
```

## Flashcards

```cards
Three-sigma rule :: 99.73% within $\mu \pm 3\sigma$
Standard error of the mean :: $s/\sqrt n$
Process capability :: $C_p = T/6\sigma$
```
