---
title: "Capital budgeting: NPV, IRR, WACC and payback"
excerpt: Is a project worth it? Cash flows, net present value, internal rate of return, discounted payback, profitability index, and where the discount rate comes from (WACC, CAPM).
---

## Cash flows

Use cash, not profit: depreciation is not an outflow, capex and working capital increases are. $FCF = EBIT(1 - t) + D\&A - \text{capex} - \Delta NWC$.

## NPV

$NPV = \sum_{t=0}^n CF_t/(1 + r)^t$. Accept if positive; among mutually exclusive projects pick the largest. NPV is additive.

## IRR

The rate where NPV = 0 (Excel `=IRR()`). Accept if IRR > r. Pitfalls: multiple or no IRRs for non-conventional flows, scale blindness, reinvestment at IRR (MIRR fixes it). **When NPV and IRR disagree, NPV wins.**

## Payback and PI

Simple payback ignores time value and later cash; discounted payback is always longer. $PI = PV(\text{inflows})/I_0$; $PI > 1 \iff NPV > 0$; rank by PI under capital rationing.

## Discount rate

$WACC = \frac{E}{V}r_E + \frac{D}{V}r_D(1 - t)$, with the tax shield $(1 - t)$. CAPM: $r_E = r_f + \beta(r_m - r_f)$. Add a specific risk premium for risky ventures.

Example: a 10 M machine saving 3 M a year for 5 years at 15%: NPV ≈ +0.06 M, IRR ≈ 15.2%. Barely positive, so run a sensitivity analysis.

```calc
title: 5-year project NPV
I0 = 10 | 1..100 | M | Investment
CF = 3 | 0..30 | M/yr | Annual cash flow
g = 0 | -20..20 | %/yr | Growth
r = 15 | 1..40 | % | Discount rate
q = 1 + g/100 | | | Growth factor
PVsum = CF*(1/(1 + r/100) + q/(1 + r/100)^2 + q^2/(1 + r/100)^3 + q^3/(1 + r/100)^4 + q^4/(1 + r/100)^5) | | M | PV of inflows
NPV = PVsum - I0 | | M | NPV
plot x: 1..40 | CF*(1/(1 + x/100) + q/(1 + x/100)^2 + q^2/(1 + x/100)^3 + q^3/(1 + x/100)^4 + q^4/(1 + x/100)^5) - I0 | NPV(rate)
axes: rate, % ; NPV, M
```

Any cash flows of your own:

```tool
name: cashflow
rate: 15
flows: -10, 3, 3, 3, 3, 3
```

```python
import numpy as np
from scipy.optimize import brentq
cf = np.array([-10, 3, 3, 3, 3, 3], dtype=float)
t = np.arange(len(cf))
npv = lambda r: np.sum(cf / (1 + r) ** t)
print(f"NPV@15% = {npv(0.15):.3f}, IRR = {brentq(npv, -0.9, 1.0):.2%}")
```

## Flashcards

```cards
NPV :: $\sum CF_t/(1 + r)^t$
IRR :: rate where NPV = 0
NPV vs IRR conflict :: NPV wins
WACC :: $\frac{E}{V}r_E + \frac{D}{V}r_D(1 - t)$
CAPM :: $r_f + \beta(r_m - r_f)$
```
