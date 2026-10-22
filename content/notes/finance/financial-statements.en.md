---
title: "Financial statements: P&L, balance sheet, cash flow and ratios"
excerpt: How to read the three core statements. Revenue, gross profit, EBITDA, EBIT, net income; assets and liabilities; cash flows; profitability, liquidity, leverage and the DuPont formula on one worked example.
---

## Three statements

The **income statement** (P&L) covers a period, the **balance sheet** a date, the **cash flow statement** real money. Net income feeds retained earnings; the change in cash ties to the balance sheet. Profit is not cash.

## P&L (worked example, millions)

Revenue 120 − COGS 78 = gross profit 42 (35%) − SG&A 18 = [[EBITDA]] 24 (20%) − D&A 6 = EBIT 18 − interest 3 = EBT 15 − tax 3 = net income 12 (10%).

EBITDA is comparable across capital structures but ignores capex, tax and working capital: it is not cash.

## Balance sheet

Assets = Liabilities + Equity. Fixed assets 60, inventory 15, receivables 18, cash 7 = 100; equity 50, long-term debt 30, short-term debt 5, payables 15 = 100.

## Cash flow

CFO = 12 + 6 − 4 (working capital) = 14; CFI = −10; CFF = −2 − 3 = −5; net −1. FCF = CFO − capex = 4.

## Ratios

- ROS 10%, ROA 12%, ROE 24%.
- Current ratio 2.0, quick ratio 1.25.
- D/E 0.7, net debt/EBITDA 1.17 (above 3 is a warning), interest cover 6.
- Receivable days 55, inventory days 70, payable days 70 → cash conversion cycle 55 days.

DuPont: $ROE = \text{margin}\times\text{asset turnover}\times\text{leverage} = 10\%\cdot1.2\cdot2 = 24\%$.

```calc
title: DuPont ROE
NI = 12 | 0..60..0.5 | M | Net income
Rev = 120 | 10..500..5 | M | Revenue
A = 100 | 10..500..5 | M | Assets
E = 50 | 5..500..5 | M | Equity
margin = NI/Rev*100 | | % | Net margin
turnover = Rev/A | | | Asset turnover
lev = A/E | | | Leverage
ROE = margin*turnover*lev | | % | ROE
```

## Flashcards

```cards
EBITDA :: earnings before interest, tax, depreciation and amortization
Balance sheet identity :: Assets = Liabilities + Equity
FCF :: CFO − capex
DuPont :: ROE = margin × turnover × leverage
Cash conversion cycle :: DSO + DIO − DPO
```
