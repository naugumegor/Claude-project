---
title: "Financial maths: the time value of money"
excerpt: Why a dollar today beats a dollar tomorrow. Simple and compound interest, compounding and discounting, effective rate, annuities, loan payments and inflation.
---

## The idea

Money today is worth more than the same money later: it can earn a return, and inflation and risk erode the future. Amounts at different dates must be moved to one date before adding: **compound** forward, **discount** back.

## Interest

Simple: $FV = PV(1 + rn)$. Compound: $FV = PV(1 + r)^n$. Rule of 72: doubling time ≈ $72/r\%$ years.

$m$ compoundings a year: $FV = PV(1 + j/m)^{mn}$; effective annual rate $(1 + j/m)^m - 1$ (12% monthly → 12.68%); continuous: $PV e^{jn}$.

## Discounting

$PV = FV/(1 + r)^n$. The discount rate is the **opportunity cost of capital**: the return on the best alternative of equal risk.

## Annuities

$PV = A\frac{1 - (1 + r)^{-n}}{r}$, $FV = A\frac{(1 + r)^n - 1}{r}$. Perpetuity $A/r$, growing perpetuity (Gordon) $A/(r - g)$.

Loan payment: $A = S\frac{i}{1 - (1 + i)^{-N}}$. A 3,000,000 loan over 20 years at 12% costs about 33,033 a month, 7.93 million in total. Annuity loans pay mostly interest early; amortizing (equal principal) loans cost less in total.

```calc
title: Loan calculator
S = 3000 | 100..20000 | k | Loan amount
R = 12 | 1..30 | % p.a. | Rate
Y = 20 | 1..30 | years | Term
i = R/100/12 | | | Monthly rate
N = Y*12 | | months | Payments
A = S*1000*i/(1 - (1 + i)^(-N)) | | | Monthly payment
total = A*N/1000 | | k | Total paid
plot t: 0..Y | S*((1 + i)^(N) - (1 + i)^(12*t))/((1 + i)^(N) - 1) | Balance, k
axes: years ; k
```

## Inflation

Fisher: $(1 + r_\text{nom}) = (1 + r_\text{real})(1 + \pi)$, roughly $r_\text{real} \approx r_\text{nom} - \pi$.

## Flashcards

```cards
Compound interest :: $FV = PV(1 + r)^n$
Present value :: $FV/(1 + r)^n$
Annuity PV :: $A\frac{1 - (1 + r)^{-n}}{r}$
Gordon growth :: $A/(r - g)$
Fisher equation :: $(1 + r_\text{nom}) = (1 + r_\text{real})(1 + \pi)$
```
