---
title: "Sales funnel and supply chain: conversions, inventory, EOQ"
excerpt: How to compute a sales funnel and find its leak, how a supply chain works, economic order quantity (Wilson formula), safety stock, reorder point, ABC analysis and the bullwhip effect.
---

## Sales funnel

```process
type: funnel
title: Machine tool sales funnel
Website visitors | 20000 | Search, ads and trade shows
Leads | 600 | Left a contact, 3%
Qualified | 240 | Budget, need and decision maker, 40%
Proposal sent | 120 | 50%
Deals | 30 | Contract signed, 25%
```

End-to-end conversion 0.15%. Conversions multiply, so +20% on any stage gives +20% sales. Compare periods, reps and channels; track sales cycle length. AIDA: attention, interest, desire, action.

## Supply chain

Raw materials → components → assembly → distributor → retailer → customer. Metrics: inventory turnover, OTIF service level, lead time.

## EOQ

$TC(Q) = \frac{D}{Q}S + \frac{Q}{2}H$ is minimal at $EOQ = \sqrt{2DS/H}$, where ordering and holding costs are equal. 12,000 units a year, 3000 per order, 50 per unit-year → EOQ = 1200, 10 orders a year. The curve is flat: 20% off costs only about 2%.

```calc
title: Economic order quantity
D = 12000 | 100..100000..100 | units/yr | Annual demand
S = 3000 | 100..50000..100 | | Cost per order
H = 50 | 1..1000 | /unit·yr | Holding cost
EOQ = sqrt(2*D*S/H) | | units | EOQ
n = D/EOQ | | /yr | Orders per year
plot x: 0.2*EOQ..3*EOQ | D/x*S + x/2*H | Total
plot x: 0.2*EOQ..3*EOQ | D/x*S | Ordering
plot x: 0.2*EOQ..3*EOQ | x/2*H | Holding
axes: order size ; cost/yr
```

## Safety stock and reorder point

$SS = z\sigma_d\sqrt{L}$, $ROP = \bar d L + SS$. With 33 a day, $\sigma_d = 10$, 9 days, 95% ($z = 1.65$): SS ≈ 50, ROP ≈ 347.

ABC: ~20% of items make ~80% of turnover. XYZ: demand stability. Bullwhip: demand swings amplify upstream; share sales data and cut batch sizes.

## Flashcards

```cards
End-to-end conversion :: product of stage conversions
EOQ :: $\sqrt{2DS/H}$
Safety stock :: $z\sigma_d\sqrt{L}$
Reorder point :: $\bar d L + SS$
Bullwhip effect :: demand swings amplify up the chain
```
