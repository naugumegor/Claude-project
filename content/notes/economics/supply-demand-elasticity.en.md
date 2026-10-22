---
title: "Supply, demand and elasticity"
excerpt: How a market finds its price. Demand and supply curves, equilibrium, consumer and producer surplus, taxes and price controls, price, cross and income elasticity, and what it means for pricing your product.
---

## Curves and equilibrium

Demand $P = a - bQ$ slopes down; supply $P = c + dQ$ slopes up. Price moves you along a curve; income, substitutes, costs and technology shift it. Equilibrium: $Q^* = (a - c)/(b + d)$, $P^* = a - bQ^*$.

Example: $P = 100 - 2Q$, $P = 10 + Q$ → $Q^* = 30$, $P^* = 40$. Consumer surplus $\tfrac12(a - P^*)Q^* = 900$, producer surplus $450$.

## Taxes

A per-unit tax $t = 15$ on sellers: $Q = 25$, buyers pay 50, sellers keep 35. Buyers bear $b/(b + d) = 2/3$. Revenue 375, deadweight loss $\tfrac12\cdot15\cdot5 = 37.5$. The less elastic side pays more.

```calc
title: Market with a tax
a = 100 | 20..200 | | Demand intercept
b = 2 | 0.2..10..0.1 | | Demand slope
c = 10 | 0..100 | | Supply intercept
d = 1 | 0.1..10..0.1 | | Supply slope
t = 15 | 0..60 | /unit | Tax
Q0 = (a - c)/(b + d) | | | Quantity, no tax
Q = (a - c - t)/(b + d) | | | Quantity with tax
Pb = a - b*Q | | | Buyer price
Ps = Pb - t | | | Seller price
DWL = t*(Q0 - Q)/2 | | | Deadweight loss
E = -Pb/(b*Q) | | | Point elasticity of demand
plot x: 0..a/b | a - b*x | Demand
plot x: 0..a/b | c + d*x | Supply
plot x: 0..a/b | c + t + d*x | Supply + tax
axes: Q ; P
```

```tool
name: demand
a: 100
b: 2
c: 10
d: 1
```

Price ceilings below equilibrium create shortages; floors above it create surpluses.

## Elasticity

$E_d = \frac{dQ}{dP}\frac{P}{Q}$. $|E| > 1$ elastic, $< 1$ inelastic. On a straight line $E = -P/(a - P)$, so it changes along the curve; revenue peaks at $|E| = 1$ ($P = a/2$). Inelastic demand: raise the price; elastic: cut it. Cross elasticity > 0 means substitutes, < 0 complements; income elasticity > 1 luxury, < 0 inferior good.

## Flashcards

```cards
Equilibrium quantity :: $(a - c)/(b + d)$
Who bears a tax :: the less elastic side
Price elasticity :: $\frac{dQ}{dP}\frac{P}{Q}$
Revenue is maximal when :: $|E| = 1$
Positive cross elasticity :: substitutes
```
