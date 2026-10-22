---
title: "Thermodynamics: the laws, ideal gas and basic processes"
excerpt: Equation of state, first and second laws, enthalpy and entropy, specific heats, the four basic processes and the polytropic, p-v and T-s diagrams.
---

## Ideal gas

$pv = RT$ per kg, $R = 8314/\mu$ J/(kg·K); air $R \approx 287$. Always use kelvins.

## First law

Closed system: $q = \Delta u + l$, $l = \int p\,dv$, $\Delta u = c_v\Delta T$. Flow: $q = \Delta h + l_t + \Delta(w^2/2) + g\Delta z$ with enthalpy $h = u + pv$, $\Delta h = c_p\Delta T$. Adiabatic turbine work $l_t = h_1 - h_2$.

$c_p - c_v = R$ (Mayer), $k = c_p/c_v$: 1.67 monatomic, 1.4 air, ~1.3 polyatomic.

## Second law and entropy

Heat does not flow cold to hot on its own; no cycle turns all heat into work. $ds = \delta q/T$ (reversible); isolated systems have $\Delta S \ge 0$. Area under a T-s curve is heat, under a p-v curve is work.

## Processes

| Process | Relation | Work | Heat |
|---|---|---|---|
| Isochoric | $p/T$ const | 0 | $c_v\Delta T$ |
| Isobaric | $v/T$ const | $R\Delta T$ | $c_p\Delta T$ |
| Isothermal | $pv$ const | $RT\ln(v_2/v_1)$ | $= l$ |
| Adiabatic | $pv^k$ const | $\frac{R}{k-1}(T_1 - T_2)$ | 0 |
| Polytropic | $pv^n$ const | $\frac{R}{n-1}(T_1 - T_2)$ | $c_n\Delta T$ |

Adiabatic: $T_2/T_1 = (v_1/v_2)^{k-1}$. Compressing air 10× from 300 K gives ~754 K, which is why diesels self-ignite.

```calc
T1 = 300 | 200..600 | K | Initial temperature
eps = 10 | 1..25 | | Compression ratio
k = 1.4 | 1.1..1.67 | | Adiabatic index
T2 = T1*eps^(k - 1) | | K | Final temperature
plot v: 1/eps..1 | v^(-k) | adiabatic p/p₁
plot v: 1/eps..1 | 1/v | isothermal p/p₁
axes: v/v₁ ; p/p₁
```

## Flashcards

```cards
Mayer's relation :: $c_p - c_v = R$
Adiabatic process :: $pv^k = \text{const}$
Isothermal work :: $RT\ln(v_2/v_1)$
Area under T-s curve :: heat
```
