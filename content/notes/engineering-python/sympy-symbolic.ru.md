---
title: "SymPy: символьная математика для инженера"
excerpt: Производные, интегралы, пределы, решение уравнений и ОДУ в общем виде, вывод формул прогиба балки методом начальных параметров и проверка размерностей. Плюс как превратить формулу в быструю функцию.
tags: python, sympy, символьные вычисления, матан, сопромат
date: 2026-10-22
---

## Зачем символьные вычисления

NumPy считает числа. **SymPy** работает с формулами как человек на бумаге: дифференцирует, интегрирует, упрощает, решает уравнения в общем виде. Полезно, чтобы:
- проверить свой вывод перед экзаменом;
- получить громоздкую формулу без ошибок (прогибы, моменты инерции, кинематика);
- превратить формулу в быструю numpy-функцию для графиков.

## Основы

```python
import sympy as sp

x = sp.symbols("x", real=True)
a = sp.symbols("a", positive=True)
f = sp.sin(a * x) * sp.exp(-x)

print("f'  =", sp.diff(f, x))
print("∫f  =", sp.simplify(sp.integrate(f, x)))
print("∫₀^∞ f =", sp.integrate(f, (x, 0, sp.oo)))
print("lim sin(x)/x =", sp.limit(sp.sin(x) / x, x, 0))
print("Тейлор cos x:", sp.series(sp.cos(x), x, 0, 8))
```

## Уравнения и системы

```python
import sympy as sp

b, h, d = sp.symbols("b h d", positive=True)

# Балка максимальной прочности из бревна диаметром d (метод Лагранжа)
lam = sp.symbols("lambda")
W = b * h**2 / 6
L = W - lam * (b**2 + h**2 - d**2)
sol = sp.solve([sp.diff(L, b), sp.diff(L, h), b**2 + h**2 - d**2], [b, h, lam], dict=True)
for s in sol:
    if s[b].is_positive:
        print("b =", s[b], "  h =", s[h], "  h/b =", sp.simplify(s[h] / s[b]))
```

## ОДУ в общем виде

```python
import sympy as sp

t = sp.symbols("t", positive=True)
m, c, F0, w = sp.symbols("m c F_0 omega", positive=True)
x = sp.Function("x")

# Вынужденные колебания без демпфирования, нулевые начальные условия
ode = sp.Eq(m * x(t).diff(t, 2) + c * x(t), F0 * sp.sin(w * t))
sol = sp.dsolve(ode, x(t), ics={x(0): 0, x(t).diff(t).subs(t, 0): 0})
print(sp.simplify(sol.rhs))
```

## Прогиб балки: вывод формулы

Консоль длиной $l$ с равномерной нагрузкой $q$, заделка в $x = 0$. Уравнение $EIy'' = M(x)$, $M(x) = -\frac{q(l - x)^2}{2}$.

```python
import sympy as sp

x, l, q, E, I = sp.symbols("x l q E I", positive=True)
C1, C2 = sp.symbols("C1 C2")

M = -q * (l - x)**2 / 2
theta = sp.integrate(M, x) / (E * I) + C1          # угол поворота
y = sp.integrate(theta, x) + C2                     # прогиб
consts = sp.solve([theta.subs(x, 0), y.subs(x, 0)], [C1, C2])   # заделка: y = 0, y' = 0
y = sp.simplify(y.subs(consts))
print("y(x) =", sp.factor(y))
print("прогиб конца:", sp.simplify(y.subs(x, l)))  # ожидаем -q l^4 / (8 E I)
```

Получаем $-\dfrac{ql^4}{8EI}$, ровно табличную формулу.

## Момент инерции сечения символьно

```python
import sympy as sp

y, z, R, t = sp.symbols("y z R t", positive=True)
r, phi = sp.symbols("r phi", positive=True)

# Тонкостенная труба: точная формула и приближение для t << R
I_exact = sp.integrate(sp.integrate((r * sp.sin(phi))**2 * r, (r, R - t, R)), (phi, 0, 2 * sp.pi))
print("I точно:", sp.factor(I_exact))
print("I при t << R:", sp.series(I_exact, t, 0, 2).removeO())    # ≈ π R³ t
```

## Из формулы в функцию

```python
import sympy as sp
import numpy as np

e, z = sp.symbols("eta zeta", positive=True)
mu = 1 / sp.sqrt((1 - e**2)**2 + (2 * z * e)**2)
print("пик μ по η:", sp.solve(sp.diff(mu, e), e))

f = sp.lambdify((e, z), mu, "numpy")     # быстрая numpy-функция
eta = np.linspace(0, 3, 7)
print(np.round(f(eta, 0.05), 2))
```

`lambdify` превращает выражение в обычную функцию, которую можно гонять по массивам и рисовать.

## Подводные камни

- Объявляй символы с допущениями (`positive=True`, `real=True`), иначе `sqrt(x**2)` не упростится до `x`.
- `sp.simplify` медленный и не всегда даёт лучший вид; пробуй `factor`, `expand`, `trigsimp`, `cancel`.
- Дроби пиши `sp.Rational(1, 3)`, а не `1/3`, иначе получишь float `0.333…`.
- Для чисел используй `expr.evalf()` или `lambdify`.

## Карточки

```cards
Производная в SymPy :: `sp.diff(f, x)`
Определённый интеграл :: `sp.integrate(f, (x, a, b))`
Предел :: `sp.limit(f, x, x0)`
Ряд Тейлора :: `sp.series(f, x, x0, n)`
Решить ОДУ :: `sp.dsolve(eq, x(t), ics={...})`
Формулу в numpy-функцию :: `sp.lambdify(args, expr, "numpy")`
Точная дробь 1/3 :: `sp.Rational(1, 3)`
```
