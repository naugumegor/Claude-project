---
title: "SymPy: symbolic maths for engineers"
excerpt: Derivatives, integrals, limits, solving equations and ODEs symbolically, deriving a beam deflection formula, and turning formulas into fast NumPy functions.
---

## Why

NumPy crunches numbers; SymPy manipulates formulas: check derivations, get long formulas right, then `lambdify` them for plots.

```python
import sympy as sp
x = sp.symbols("x", real=True)
a = sp.symbols("a", positive=True)
f = sp.sin(a * x) * sp.exp(-x)
print(sp.diff(f, x))
print(sp.integrate(f, (x, 0, sp.oo)))
print(sp.limit(sp.sin(x) / x, x, 0))
print(sp.series(sp.cos(x), x, 0, 8))
```

## ODEs

```python
import sympy as sp
t = sp.symbols("t", positive=True)
m, c, F0, w = sp.symbols("m c F_0 omega", positive=True)
x = sp.Function("x")
ode = sp.Eq(m * x(t).diff(t, 2) + c * x(t), F0 * sp.sin(w * t))
print(sp.dsolve(ode, x(t), ics={x(0): 0, x(t).diff(t).subs(t, 0): 0}).rhs)
```

## Deriving a cantilever deflection

```python
import sympy as sp
x, l, q, E, I = sp.symbols("x l q E I", positive=True)
C1, C2 = sp.symbols("C1 C2")
M = -q * (l - x)**2 / 2
theta = sp.integrate(M, x) / (E * I) + C1
y = sp.integrate(theta, x) + C2
y = y.subs(sp.solve([theta.subs(x, 0), y.subs(x, 0)], [C1, C2]))
print(sp.simplify(y.subs(x, l)))   # -q*l**4/(8*E*I)
```

## Formula to function

```python
import sympy as sp, numpy as np
e, z = sp.symbols("eta zeta", positive=True)
mu = 1 / sp.sqrt((1 - e**2)**2 + (2 * z * e)**2)
f = sp.lambdify((e, z), mu, "numpy")
print(np.round(f(np.linspace(0, 3, 7), 0.05), 2))
```

Pitfalls: declare assumptions (`positive=True`), use `sp.Rational(1, 3)`, try `factor`/`trigsimp` when `simplify` is slow.

## Flashcards

```cards
Derivative :: `sp.diff(f, x)`
Solve an ODE :: `sp.dsolve`
Formula to NumPy :: `sp.lambdify`
```
