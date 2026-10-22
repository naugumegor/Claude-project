---
title: "Unit economics: CAC, LTV, ROI and customer payback"
excerpt: Does the business make money on one customer or one sale? Acquisition cost, lifetime value, churn, margin, ROI and ROMI, CAC payback and the usual calculation mistakes.
---

## Why

Unit economics is profit per unit: one customer, order or subscription. If a unit loses money, growth only kills you faster. Decide what the unit is first.

## Core metrics

| Metric | Formula |
|---|---|
| [[CAC]] | acquisition spend / new customers (include sales salaries, not just ads) |
| ARPU | revenue / customers per period |
| AOV | revenue / orders |
| Margin $m$ | (revenue − variable cost) / revenue |
| [[Churn]] $c$ | customers lost in a month / customers at start |

## LTV

With constant monthly churn $c$, average lifetime is $1/c$ months, so $LTV = ARPU\cdot m / c$. For a shop, $LTV = AOV\cdot m\cdot$ purchases per lifetime. Always use margin, never revenue.

Checks: $LTV/CAC > 3$; CAC payback $CAC/(ARPU\cdot m)$ under 12 months; positive contribution margin per unit.

Example (online school): ARPU 1500, margin 70%, churn 5%, CAC 9000. Lifetime 20 months, LTV 21,000, LTV/CAC ≈ 2.3, payback ≈ 8.6 months. Cutting churn to 3% lifts LTV to 35,000.

```calc
title: Subscription unit economics
ARPU = 1500 | 100..10000..50 | /mo | Revenue per customer
m = 70 | 10..95 | % | Margin
c = 5 | 1..30..0.5 | %/mo | Churn
CAC = 9000 | 0..50000..100 | | Acquisition cost
LTV = ARPU*m/c | | | LTV
ratio = LTV/CAC | | | LTV / CAC
payback = CAC/(ARPU*m/100) | | months | CAC payback
plot t: 0..36 | ARPU*m/100*(1 - (1 - c/100)^t)/(c/100) - CAC | Cumulative profit per customer
axes: months ; profit
```

```tool
name: unit
arpu: 1500
margin: 70
churn: 5
cac: 9000
```

Shop example: 10,000 visitors for 200,000, 2% conversion, AOV 3000, margin 30%. CAC = 1000, first-order profit 900, so the first order loses 100; at 2.5 orders per customer the unit earns 1250. The shop lives on repeat purchases.

## ROI and ROMI

$ROI = (\text{gain} - \text{cost})/\text{cost}$. ROMI is ROI on marketing, computed on gross profit. ROI ignores time; use NPV/IRR for long projects.

## Common mistakes

LTV on revenue; CAC without salaries; average churn instead of cohorts; blending channels; 10-year LTV for an 8-month-old startup.

## Flashcards

```cards
CAC :: acquisition spend / new customers
Subscription LTV :: $ARPU\cdot m / c$
Healthy LTV/CAC :: above 3
CAC payback :: $CAC/(ARPU\cdot m)$
ROI :: (gain − cost) / cost
```
