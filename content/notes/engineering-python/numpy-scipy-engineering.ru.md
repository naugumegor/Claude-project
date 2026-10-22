---
title: "Инженерный Python: NumPy, SciPy и Matplotlib для расчётов"
excerpt: Готовые сниппеты для рутинных инженерных расчётов прямо в браузере. Массивы и векторизация, СЛАУ, корни уравнений, интегралы, ОДУ, аппроксимация эксперимента, оптимизация и графики.
tags: python, numpy, scipy, matplotlib, численные методы, сниппеты
date: 2026-10-22
---

## Зачем инженеру Python

Excel хорош до первого цикла и первой формулы на 200 символов. Python бесплатный, читаемый, и в нём есть всё: линейная алгебра, ОДУ, оптимизация, обработка данных, графики. Каждый блок ниже можно **запустить прямо на странице** и поменять цифры под свою задачу.

Стек: **NumPy** (массивы и линейная алгебра), **SciPy** (численные методы), **Matplotlib** (графики), **SymPy** (символьная математика), **pandas** (таблицы).

## Массивы и векторизация

Вместо циклов считаем сразу на массивах. Быстро и коротко.

```python
import numpy as np

# Напряжения в стержнях разного диаметра при одной силе
F = 50e3                                  # Н
d = np.array([12, 16, 20, 24, 30])        # мм
A = np.pi * d**2 / 4                      # мм²
sigma = F / A                             # МПа
for di, s in zip(d, sigma):
    print(f"d = {di:2d} мм   σ = {s:6.1f} МПа   {'OK' if s < 180 else 'мало'}")
```

## Эпюры балки за пять строк

```python
import numpy as np
import matplotlib.pyplot as plt

L, q, F, a = 6.0, 4.0, 12.0, 2.0          # м, кН/м, кН, м
x = np.linspace(0, L, 601)
# реакции простой балки: q на правой половине, F на расстоянии a от A
RB = (F * a + q * (L / 2) * (3 * L / 4)) / L
RA = F + q * L / 2 - RB
Q = RA - F * (x > a) - q * np.clip(x - L / 2, 0, None)
M = RA * x - F * np.clip(x - a, 0, None) - q * np.clip(x - L / 2, 0, None) ** 2 / 2

fig, (ax1, ax2) = plt.subplots(2, 1, sharex=True, figsize=(7, 5))
ax1.fill_between(x, Q, alpha=0.3); ax1.plot(x, Q); ax1.set_ylabel("Q, кН")
ax2.fill_between(x, M, alpha=0.3); ax2.plot(x, M); ax2.set_ylabel("M, кН·м")
ax2.set_xlabel("x, м"); ax2.invert_yaxis()
plt.tight_layout(); plt.show()
print(f"RA = {RA:.2f} кН, RB = {RB:.2f} кН, Mmax = {M.max():.2f} кН·м")
```

## СЛАУ

```python
import numpy as np

# Токи в цепи по законам Кирхгофа или усилия в ферме
A = np.array([[ 4, -1,  0],
              [-1,  4, -1],
              [ 0, -1,  4]], dtype=float)
b = np.array([15, 10, 10], dtype=float)
x = np.linalg.solve(A, b)
print("решение:", x)
print("проверка A @ x - b:", A @ x - b)
```

## Корни нелинейных уравнений

```python
from scipy.optimize import brentq, fsolve
import numpy as np

# Коэффициент трения λ по Колбруку–Уайту (неявное уравнение)
Re, rel = 5e4, 0.1 / 50
f = lambda lam: 1 / np.sqrt(lam) + 2 * np.log10(rel / 3.7 + 2.51 / (Re * np.sqrt(lam)))
lam = brentq(f, 1e-3, 0.2)
print(f"λ = {lam:.4f}")

# Система: точка пересечения двух кривых
sol = fsolve(lambda v: [v[0]**2 + v[1]**2 - 4, v[0] - v[1]**3], [1, 1])
print("x, y =", sol)
```

`brentq` надёжен, если знаешь интервал со сменой знака. `fsolve` для систем, нужно начальное приближение.

## Интегралы

```python
from scipy.integrate import quad
import numpy as np

# Работа газа при политропном сжатии pV^n = const
p1, V1, V2, n = 1e5, 1e-3, 1e-4, 1.3
W, err = quad(lambda V: p1 * (V1 / V)**n, V1, V2)
print(f"W = {W:.1f} Дж (минус = работа затрачена)")
print("аналитически:", p1 * V1 / (n - 1) * (1 - (V1 / V2)**(n - 1)))
```

## ОДУ: колебания с демпфированием

```python
import numpy as np
import matplotlib.pyplot as plt
from scipy.integrate import solve_ivp

m, c, zeta = 50.0, 2e5, 0.05
w0 = np.sqrt(c / m); b = 2 * zeta * np.sqrt(c * m)
F0, w = 1000.0, 0.9 * w0                  # сила и частота возбуждения

def rhs(t, y):
    x, v = y
    return [v, (F0 * np.sin(w * t) - b * v - c * x) / m]

t = np.linspace(0, 1.5, 3000)
sol = solve_ivp(rhs, [0, t[-1]], [0, 0], t_eval=t, rtol=1e-8)
plt.plot(t, sol.y[0] * 1000)
plt.xlabel("t, с"); plt.ylabel("x, мм"); plt.title("Разгон к резонансу (η = 0.9)")
plt.grid(alpha=0.3); plt.show()
print(f"f0 = {w0 / 2 / np.pi:.1f} Гц, статический прогиб {F0 / c * 1000:.2f} мм")
```

ОДУ высокого порядка всегда сводят к системе первого порядка: $y = [x, \dot x]$.

## Аппроксимация эксперимента

```python
import numpy as np
import matplotlib.pyplot as plt
from scipy.optimize import curve_fit

# Остывание: подгоняем T = Tc + (T0 - Tc) exp(-t / tau)
t = np.array([0, 30, 60, 90, 120, 180, 240, 300])
T = np.array([95.0, 79.8, 68.1, 59.0, 51.9, 41.8, 35.3, 31.0])

model = lambda t, Tc, T0, tau: Tc + (T0 - Tc) * np.exp(-t / tau)
p, cov = curve_fit(model, t, T, p0=[20, 95, 100])
err = np.sqrt(np.diag(cov))
print("Tc = %.1f ± %.1f, T0 = %.1f ± %.1f, τ = %.0f ± %.0f с" % (p[0], err[0], p[1], err[1], p[2], err[2]))

tt = np.linspace(0, 320, 200)
plt.plot(t, T, "o", label="эксперимент")
plt.plot(tt, model(tt, *p), label="модель")
plt.xlabel("t, с"); plt.ylabel("T, °C"); plt.legend(); plt.grid(alpha=0.3); plt.show()
```

`curve_fit` отдаёт и **ковариационную матрицу**: корни её диагонали это погрешности параметров. Не забывай их писать в отчёт.

## Оптимизация

```python
import numpy as np
from scipy.optimize import minimize

# Минимальная масса трубчатой стойки: D, t при ограничениях по прочности и устойчивости
F, L, E, sT, rho = 50e3, 2000.0, 2e5, 240.0, 7.85e-6  # Н, мм, МПа, МПа, кг/мм³

def area(x):  D, t = x; return np.pi * (D * t - t**2)
def inertia(x): D, t = x; d = D - 2 * t; return np.pi * (D**4 - d**4) / 64

cons = [
    {"type": "ineq", "fun": lambda x: sT / 1.5 - F / area(x)},                  # прочность
    {"type": "ineq", "fun": lambda x: np.pi**2 * E * inertia(x) / L**2 / 2.5 - F},  # Эйлер, запас 2.5
    {"type": "ineq", "fun": lambda x: x[0] / x[1] - 10},                        # не слишком толстостенная
    {"type": "ineq", "fun": lambda x: 50 - x[0] / x[1]},                         # не слишком тонкостенная
]
res = minimize(lambda x: rho * area(x) * L, x0=[60, 5], bounds=[(10, 200), (1, 20)], constraints=cons)
D, t = res.x
print(f"D = {D:.1f} мм, t = {t:.2f} мм, масса {res.fun:.2f} кг")
```

## Полезные приёмы

- **Единицы**: держи одну систему (Н, мм, МПа или СИ). Библиотека `pint` умеет считать с единицами и ловить ошибки размерности.
- **Таблицы**: `pandas.read_csv` / `read_excel` для данных эксперимента.
- **Свойства веществ**: `CoolProp` (вода, хладагенты, воздух), `iapws` (водяной пар).
- **Jupyter** или VS Code с ячейками: код, графики и выводы в одном документе, отчёт можно экспортировать в PDF.

## Карточки

```cards
Решить СЛАУ в NumPy :: `np.linalg.solve(A, b)`
Корень на интервале со сменой знака :: `scipy.optimize.brentq`
Определённый интеграл :: `scipy.integrate.quad`
ОДУ с начальными условиями :: `scipy.integrate.solve_ivp`
Подгонка нелинейной модели :: `scipy.optimize.curve_fit`
Погрешности параметров из curve_fit :: корни диагонали ковариационной матрицы
Как решать ОДУ второго порядка численно :: свести к системе первого порядка
Оптимизация с ограничениями :: `scipy.optimize.minimize` с constraints
```
