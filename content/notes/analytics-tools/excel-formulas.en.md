---
title: "Excel and Google Sheets for analysts: formulas, lookups, pivots"
excerpt: The formulas you use every day. References and $, IF and SUMIFS, VLOOKUP versus INDEX/MATCH and XLOOKUP, text and dates, financial functions (NPV, IRR, PMT) and their traps, pivot tables and rules for a clean model.
---

## References

`A1` relative, `$A$1` absolute, `$A1` / `A$1` mixed. F4 cycles them.

## Logic and conditional sums

`IF`, `IFS`, `AND`, `OR`, `IFERROR`, `SUMIFS(sum, range1, crit1, …)`, `COUNTIFS`, `AVERAGEIFS`.

## Lookups

- `VLOOKUP(key, table, col, FALSE)`: always FALSE; cannot look left; breaks when columns are inserted.
- `INDEX(C:C, MATCH(key, A:A, 0))`: looks anywhere, robust.
- `XLOOKUP(key, A:A, C:C, "not found")`: the modern default.

## Text and dates

`&`, `CONCAT`, `TRIM`, `LEFT`, `MID`, `TEXTSPLIT`/`SPLIT`, `TEXT`, `EOMONTH`, `NETWORKDAYS`. Dates are day numbers, so you can subtract them.

## Financial functions

| Task | Formula | Trap |
|---|---|---|
| NPV | `=NPV(rate, CF1:CFn) + CF0` | NPV discounts its first value one period |
| IRR | `=IRR(CF0:CFn)` | equal periods only |
| Dated cash flows | `XNPV`, `XIRR` | annual rate |
| Loan payment | `=PMT(rate/12, years*12, -amount)` | sign convention |

## Pivot tables

Flat data, one record per row, no merged cells; format as a Table (Ctrl+T). A pivot is SQL's `GROUP BY`.

## Model hygiene

Inputs separate and coloured; no hard-coded numbers in formulas; one formula per row; check cells; do not hide errors with IFERROR.

## Flashcards

```cards
$A$1 :: absolute reference
VLOOKUP last argument :: FALSE
INDEX/MATCH advantage :: looks left, survives inserted columns
Excel NPV trap :: add CF0 outside the function
XNPV :: NPV with real dates
```
