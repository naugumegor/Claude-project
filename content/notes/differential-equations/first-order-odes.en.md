---
title: "First-order ODEs: separable, linear, and where they show up"
excerpt: Recognizing and solving first-order equations. Cooling, capacitor charging, tank draining and numerical solution with Euler and Runge–Kutta.
---

## What an ODE is

An equation relating $y(x)$ and its derivatives. The general solution has constants; an **initial condition** $y(x_0) = y_0$ picks one (initial value problem). Engineers meet them because physical laws state **how fast** things change.

## Separable: $y' = f(x)g(y)$

Separate and integrate. **Newton's cooling**: $dT/dt = -k(T - T_\text{env})$ gives $T = T_\text{env} + (T_0 - T_\text{env})e^{-kt}$. The **time constant** $\tau = 1/k$: 63% done after $\tau$, 95% after $3\tau$, 99% after $5\tau$.

**Torricelli tank**: $A\,dh/dt = -\mu a\sqrt{2gh}$, drain time $t = \frac{A}{\mu a}\sqrt{2h_0/g}$.

## Linear: $y' + p(x)y = q(x)$

Multiply by the **integrating factor** $\mu = e^{\int p\,dx}$: $y = \frac{1}{\mu}\left(\int\mu q\,dx + C\right)$.

RC charging: $RC\,u' + u = E$ gives $u = E(1 - e^{-t/RC})$. All first-order systems (thermocouple, RC filter) share this exponential.

## Others

Homogeneous $y' = f(y/x)$: substitute $y = ux$. Exact $P\,dx + Q\,dy = 0$ with $P_y = Q_x$: solution $F(x, y) = C$.

## Numerically

Euler $y_{n+1} = y_n + hf(x_n, y_n)$ (error $\sim h$); classic RK4 (error $\sim h^4$) is the default, e.g. `scipy.integrate.solve_ivp`.

```python
import numpy as np
from scipy.integrate import solve_ivp
k, Tenv = 0.05, 20
sol = solve_ivp(lambda t, T: -k * (T - Tenv), [0, 120], [850], t_eval=np.linspace(0, 120, 7))
print(sol.y[0])
```

```calc
T0 = 850 | 100..1200 | °C | Initial temperature
Tc = 20 | 0..100 | °C | Ambient temperature
k = 0.05 | 0.005..0.3 | 1/s | Cooling coefficient
tau = 1/k | | s | Time constant
plot t: 0..5*tau | Tc + (T0 - Tc)*exp(-k*t) | T(t)
axes: t, s ; T, °C
```

## Flashcards

```cards
Integrating factor for $y' + py = q$ :: $e^{\int p\,dx}$
Newton's cooling :: $T = T_\text{env} + (T_0 - T_\text{env})e^{-kt}$
RC time constant :: $\tau = RC$
Euler's method :: $y_{n+1} = y_n + h f(x_n, y_n)$
```
