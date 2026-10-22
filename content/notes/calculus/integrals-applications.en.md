---
title: "The integral: from area to work and centroids"
excerpt: The definite integral as a sum of tiny pieces, the Newton–Leibniz formula, main techniques and engineering uses.
---

## The idea

A **definite integral** is the limit of a sum of many small contributions $f(x_i)\Delta x$:

$$\int_a^b f(x)\,dx = \lim_{\max \Delta x_i \to 0}\ \sum_i f(\xi_i)\,\Delta x_i.$$

Height gives area, force gives work, flow rate gives volume. The meaning is always **accumulation**.

## Newton–Leibniz

If $F' = f$, then $\int_a^b f(x)\,dx = F(b) - F(a)$.

## Techniques

- **Table integrals**: $\int x^n dx = \dfrac{x^{n+1}}{n+1} + C$, $\int dx/x = \ln|x| + C$, $\int e^x dx = e^x + C$.
- **Substitution**: $\int f(g(x))\,g'(x)\,dx = \int f(u)\,du$.
- **By parts**: $\int u\,dv = uv - \int v\,du$; pick as $u$ what simplifies when differentiated.

## Engineering uses

| Quantity | Formula |
|---|---|
| Work of a variable force | $W = \int F(x)\,dx$ |
| Work of a gas | $W = \int p\,dV$ |
| First moment of area | $S_y = \int_A x\,dA$ |
| Centroid | $x_c = S_y / A$ |
| Second moment of area | $I_x = \int_A y^2\,dA$ |

For a $b \times h$ rectangle: $I_x = \int_{-h/2}^{h/2} y^2 b\,dy = bh^3/12$. Height is cubed, which is why beams stand on edge.

Isothermal compression: $W = p_1 V_1 \ln(V_2/V_1)$.

## Numerical integration

Trapezoidal rule (error $\sim h^2$) and Simpson's rule (error $\sim h^4$) for data or functions without a closed-form antiderivative.

```python
import numpy as np
from scipy.integrate import quad, trapezoid

b, h = 40, 120
y = np.linspace(-h/2, h/2, 201)
print("trapezoid:", trapezoid(b * y**2, y))
print("exact:    ", b * h**3 / 12)
```

## Flashcards

```cards
Newton–Leibniz formula :: $\int_a^b f\,dx = F(b) - F(a)$
Integration by parts :: $\int u\,dv = uv - \int v\,du$
Second moment of a rectangle :: $I_x = bh^3/12$
```

## Quiz

```quiz
? Doubling the height of a rectangular beam multiplies $I_x$ by
- 2
- 4
+ 8
```
