---
title: "Break-even point, operating leverage and machine-hour cost"
excerpt: How much you must sell to reach zero profit. Fixed and variable costs, contribution margin, margin of safety, operating leverage, machine-hour rate and make-or-buy for engineers.
---

## Costs and contribution

Variable costs $V$ per unit (material, piece wages, energy); fixed costs $F$ per period (rent, salaries, depreciation). Contribution margin $CM = P - V$ covers $F$ first, then becomes profit.

## Break-even

$\Pi = (P - V)Q - F$, so $Q_{be} = F/(P - V)$, or in revenue $F/(1 - V/P)$. Target profit: $Q = (F + \Pi^*)/(P - V)$. Margin of safety $(Q - Q_{be})/Q$.

Example: $F$ = 400,000 a month, $P$ = 1200, $V$ = 700 → break-even 800 units; at 1000 units profit is 100,000 and the margin of safety 20%.

```calc
title: Break-even
F = 400 | 10..5000..10 | k/mo | Fixed costs
P = 1200 | 10..10000..10 | /unit | Price
V = 700 | 0..9000..10 | /unit | Variable cost
Q = 1000 | 1..10000..10 | units/mo | Sales plan
Qb = F*1000/(P - V) | | units/mo | Break-even
profit = ((P - V)*Q - F*1000)/1000 | | k/mo | Profit
safety = (Q - Qb)/Q*100 | | % | Margin of safety
plot x: 0..2*Qb | P*x/1000 | Revenue
plot x: 0..2*Qb | (F*1000 + V*x)/1000 | Costs
axes: units/mo ; k
```

```tool
name: breakeven
fixed: 400000
price: 1200
variable: 700
volume: 1000
```

## Operating leverage

$DOL = CM_{total}/\Pi$. At 1000 units $DOL = 5$: +10% sales gives +50% profit. High fixed costs mean high leverage; near break-even $DOL \to \infty$.

## Machine-hour rate

A 12 M CNC centre, 8-year life, 2850 working hours a year: depreciation 1.5 M + maintenance 0.4 M + floor space 0.3 M = 772 per hour; energy, operator and tooling add 870 per hour; total ≈ 1640 per hour. Utilisation drives the rate.

Make or buy: own cell $F + VQ$ vs supplier $P_s Q$ → in-house wins above $Q^* = F/(P_s - V)$.

## Flashcards

```cards
Break-even units :: $F/(P - V)$
Contribution margin :: $P - V$
Operating leverage :: $CM/\Pi$
Make-or-buy volume :: $F/(P_s - V)$
```
