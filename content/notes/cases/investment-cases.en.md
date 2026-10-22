---
title: "Cases: investment and production"
excerpt: Three short cases for an engineer with a budget. Buy a machine or outsource, which of two projects to pick when IRR and NPV disagree, and what to do with a project that has already absorbed 20 million.
---

Calculate first, then choose. See the NPV/IRR and break-even notes.

## Case 1. Own machine or outsource

```case
? A plant buys milled housings at 900 each, 2000 a year.
? An in-house cell costs 1.8 M a year fixed and 300 per part variable. Sales promise 5000 a year in two years, with no contracts yet.
+ Stay with the supplier, sign a volume framework deal, revisit above a steady 3000 a year :: Break-even volume 1.8 M / (900 − 300) = 3000. At 2000, in-house costs 2.4 M vs 1.8 M.
~ Lease the machine now and sell spare hours :: Works only if there is a real local market for machining.
- Buy on a 25% loan to be independent :: Independence has a price: 0.6 M a year plus interest at today's volume.
```

## Case 2. NPV vs IRR

```case
? Money for one of two mutually exclusive projects at 14%.
? A: NPV 4 M, IRR 18%. B: NPV 1.5 M, IRR 40%.
+ Project A :: NPV measures value created; IRR ignores scale.
~ B, investing the rest elsewhere :: Only if another project adds more than 2.5 M NPV.
- B because the return is higher :: The classic IRR ranking error.
```

## Case 3. Already spent 20 million

```case
? Two years and 20 M spent on an in-house gearbox; 5 M more to reach production.
? Revised forecast: the present value of future cash flows is only 4 M.
+ Stop and try to sell or reuse the IP and tooling :: 20 M is sunk. Continuing has NPV = −5 + 4 = −1 M.
~ Freeze for six months and recheck the market :: Reasonable if there is evidence the forecast is low, but freezing costs money too.
- Finish it or the 20 M is wasted :: The sunk-cost fallacy.
```

Count only incremental cash, compare with the alternative, and prefer flexibility to commitments when demand is a forecast.
