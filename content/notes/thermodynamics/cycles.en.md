---
title: "Heat engine cycles: Carnot, Otto, Diesel, Brayton, Rankine"
excerpt: Carnot efficiency as the ceiling, internal combustion cycles with heat addition at constant volume and constant pressure, the gas turbine Brayton cycle and the steam Rankine cycle, with interactive plots.
---

## Thermal efficiency

$\eta = l/q_1 = 1 - q_2/q_1$.

## Carnot

Two isotherms, two adiabats: $\eta = 1 - T_2/T_1$, the upper bound for any engine. Reverse cycle: refrigerator COP $T_2/(T_1 - T_2)$, heat pump $T_1/(T_1 - T_2)$.

## Otto (petrol)

Adiabatic compression, heat at constant volume, adiabatic expansion, heat rejection at constant volume: $\eta = 1 - 1/\varepsilon^{k-1}$. Compression ratio is limited by knock (~10–12).

## Diesel

Heat at constant pressure: $\eta = 1 - \frac{1}{\varepsilon^{k-1}}\frac{\rho^k - 1}{k(\rho - 1)}$. Less efficient than Otto at equal $\varepsilon$, but $\varepsilon = 16$–22 is allowed. Real engines follow the dual (Sabathé) cycle.

## Brayton (gas turbine)

$\eta = 1 - 1/\pi^{(k-1)/k}$ with pressure ratio $\pi$ (40–50 in modern jet engines). Limited by turbine inlet temperature; regeneration and combined cycles reach ~60%.

## Rankine (steam)

Pump, boiler, turbine, condenser. $\eta \approx (h_1 - h_2)/(h_1 - h_3)$, pump work is tiny because water is nearly incompressible. Enthalpies from steam tables or the Mollier chart (`iapws`, `CoolProp` in Python). Improve with higher steam parameters, lower condenser pressure, reheat and feedwater regeneration.

```calc
eps = 10 | 2..25 | | Compression ratio ε
k = 1.4 | 1.2..1.67 | | Adiabatic index
rho = 2 | 1.1..4 | | Cut-off ratio ρ
etaOtto = (1 - 1/eps^(k - 1))*100 | | % | Otto efficiency
etaDiesel = (1 - (rho^k - 1)/(k*(rho - 1)*eps^(k - 1)))*100 | | % | Diesel efficiency
plot e: 2..25 | (1 - 1/e^(k - 1))*100 | Otto
plot e: 2..25 | (1 - (rho^k - 1)/(k*(rho - 1)*e^(k - 1)))*100 | Diesel
axes: ε ; η, %
```

## Flashcards

```cards
Carnot efficiency :: $1 - T_2/T_1$
Otto efficiency :: $1 - 1/\varepsilon^{k-1}$
Brayton efficiency :: $1 - 1/\pi^{(k-1)/k}$
What limits petrol engine compression :: knock
```
