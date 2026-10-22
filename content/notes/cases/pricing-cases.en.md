---
title: "Cases: price, discounts and margin"
excerpt: Three short pricing cases to practise decisions. A competitor cuts prices, raising the price of a unique part, and whether to run a sale. Pick an option and read the worked analysis.
---

Pick an option, then read the analysis. Besides the best answer (+) there are partly right ones (~). Do the arithmetic first.

## Case 1. A competitor cuts prices

```case
? A shop makes 1000 bushings a month at 500. Variable cost 300 per unit, fixed costs 120,000 a month, profit 80,000.
? A competitor drops to 450. Sales wants to match it.
+ Keep the list price; call key customers, stress lead time and quality, discount only for volume or long contracts :: At 450 the contribution falls from 200 to 150; keeping profit needs (120,000 + 80,000)/150 ≈ 1333 units, +33%. A price war won't deliver that.
~ Discount 10% for new customers only :: Protects growth, but existing customers will ask for the same.
- Cut to 450 for everyone :: Profit at the same volume falls from 80,000 to 30,000, −62%.
```

## Case 2. Raise the price of a unique part

```case
? You are the only local maker of a repair kit for old imported presses: 200 kits a month at 30,000, variable cost 18,000.
? Customers say an 8% increase would lose about 3% of them.
+ Raise the price 8% :: Revenue ×1.048; contribution goes from 2.4 M to 194 × 14,400 ≈ 2.79 M, +16%. Demand is inelastic.
~ Raise 4% and watch :: Cautious, but leaves money on the table.
- Leave it :: Uniqueness and inelastic demand are exactly when price should reflect value.
```

## Case 3. A store-wide sale

```case
? A tool store with a 30% contribution margin: an item at 100 costs 70.
? Marketing proposes 20% off everything and promises +50% volume.
+ No blanket discount; discount slow-moving stock and bundles :: At 80 the contribution drops from 30 to 10, so you need 3× the volume, not 1.5×. At +50% profit halves.
~ 20% off for one day, newsletter subscribers only :: Limits the damage and builds a list, but check the maths.
- 20% off everything for a week :: Revenue up, profit down, and customers learn to wait for sales.
```

Required volume growth for a discount $s$ at margin $m$: $Q_{new}/Q_{old} = m/(m - s)$.

```calc
title: Volume needed to pay for a discount
m = 30 | 5..80 | % | Contribution margin
s = 10 | 0..50 | % | Discount
k = m/(m - s) | | × | Required volume growth
plot x: 0..0.9*m | m/(m - x) | Required growth
axes: discount, % ; ×
```
