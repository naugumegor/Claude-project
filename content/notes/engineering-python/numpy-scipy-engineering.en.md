---
title: "Engineering Python: NumPy, SciPy and Matplotlib for calculations"
excerpt: Ready-to-run snippets for routine engineering work in the browser. Arrays and vectorization, linear systems, root finding, integrals, ODEs, curve fitting of test data, optimization and plots.
---

## Why Python

Free, readable, and complete: linear algebra, ODEs, optimization, data and plots. Every block below runs on the page; change the numbers for your own case.

## Vectorization

```python
import numpy as np
F = 50e3
d = np.array([12, 16, 20, 24, 30])
sigma = F / (np.pi * d**2 / 4)
print(dict(zip(d.tolist(), sigma.round(1).tolist())))
```

## Beam diagrams

```python
import numpy as np
import matplotlib.pyplot as plt
L, q, F, a = 6.0, 4.0, 12.0, 2.0
x = np.linspace(0, L, 601)
RB = (F * a + q * (L / 2) * (3 * L / 4)) / L
RA = F + q * L / 2 - RB
Q = RA - F * (x > a) - q * np.clip(x - L / 2, 0, None)
M = RA * x - F * np.clip(x - a, 0, None) - q * np.clip(x - L / 2, 0, None) ** 2 / 2
fig, (ax1, ax2) = plt.subplots(2, 1, sharex=True)
ax1.plot(x, Q); ax1.set_ylabel("Q, kN")
ax2.plot(x, M); ax2.set_ylabel("M, kN·m"); ax2.invert_yaxis()
plt.show()
```

## Roots, integrals, ODEs

```python
import numpy as np
from scipy.optimize import brentq
from scipy.integrate import quad, solve_ivp

Re, rel = 5e4, 0.002
lam = brentq(lambda l: 1/np.sqrt(l) + 2*np.log10(rel/3.7 + 2.51/(Re*np.sqrt(l))), 1e-3, 0.2)
print("Colebrook λ =", round(lam, 4))

W, _ = quad(lambda V: 1e5 * (1e-3 / V)**1.3, 1e-3, 1e-4)
print("polytropic work, J:", round(W, 1))

m, c = 50.0, 2e5
sol = solve_ivp(lambda t, y: [y[1], (-c * y[0] - 200 * y[1]) / m], [0, 0.5], [0.001, 0])
print("x(0.5 s) =", sol.y[0, -1])
```

## Curve fitting

```python
import numpy as np
from scipy.optimize import curve_fit
t = np.array([0, 30, 60, 90, 120, 180, 240, 300])
T = np.array([95.0, 79.8, 68.1, 59.0, 51.9, 41.8, 35.3, 31.0])
model = lambda t, Tc, T0, tau: Tc + (T0 - Tc) * np.exp(-t / tau)
p, cov = curve_fit(model, t, T, p0=[20, 95, 100])
print("params:", p.round(2), "±", np.sqrt(np.diag(cov)).round(2))
```

## Tips

Keep one unit system (or use `pint`), read data with `pandas`, get fluid properties from `CoolProp` or `iapws`, and keep calculations in Jupyter notebooks.

## Flashcards

```cards
Solve a linear system :: `np.linalg.solve`
Bracketed root :: `brentq`
Initial value ODE :: `solve_ivp`
Nonlinear fit :: `curve_fit`
```
