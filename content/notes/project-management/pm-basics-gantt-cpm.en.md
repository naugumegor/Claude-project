---
title: "Project management: Gantt, critical path, PERT, earned value and Scrum"
excerpt: How to plan a coursework project, a workshop refit or a product launch. Work breakdown structure, Gantt charts, the critical path method, PERT estimates, earned value control, risks and agile methods.
---

## Basics

A project is temporary with a unique result. The iron triangle: scope, time, cost. A WBS breaks the result into work packages; the 100% rule says children cover all of the parent's work.

## Critical path

| # | Task | Days | After |
|---|---|---|---|
| 1 | Brief analysis | 3 | |
| 2 | Layout sketch | 5 | 1 |
| 3 | Calculations | 7 | 1 |
| 4 | Drawings | 6 | 2, 3 |
| 5 | Report | 4 | 3 |
| 6 | Defence | 1 | 4, 5 |

Forward pass gives a 17-day project; backward pass gives zero slack on 1–3–4–6 (the critical path) and 2 days on tasks 2 and 5. Add people to the calculations, not the sketch. Compress by crashing (more resources) or fast tracking (overlap tasks).

```gantt
title: Machine design coursework
start: 2026-11-02
Brief analysis | 0 | 3 | 100
Layout sketch | после 1 | 5 | 60
Calculations | после 1 | 7 | 30
Drawings | после 2,3 | 6
Report | после 3 | 4
Defence | после 4,5 | 1
```

## PERT

$t_e = (a + 4m + b)/6$, $\sigma = (b - a)/6$; add means and variances along a path.

## Earned value

$CPI = EV/AC$, $SPI = EV/PV$, $EAC = BAC/CPI$. Budget 1 M, planned 50%, done 40%, spent 450 k → CPI 0.89, SPI 0.8, EAC ≈ 1.125 M.

```calc
title: Earned value
BAC = 1000 | 100..10000..10 | k | Budget
plan = 50 | 0..100 | % | Planned complete
done = 40 | 0..100 | % | Actually complete
AC = 450 | 0..10000..10 | k | Actual cost
EV = BAC*done/100 | | k | Earned value
CPI = EV/AC | | | Cost index
SPI = EV/(BAC*plan/100) | | | Schedule index
EAC = BAC/CPI | | k | Estimate at completion
```

## Risks and agile

Risk = probability × impact; avoid, transfer, mitigate or accept. Scrum: 1–4 week sprints, product owner, scrum master, team, backlog, daily stand-up, review, retrospective. Kanban: a board with WIP limits.

## Flashcards

```cards
Critical path :: the longest chain, zero slack
PERT estimate :: $(a + 4m + b)/6$
CPI :: $EV/AC$
SPI :: $EV/PV$
Sprint :: a 1–4 week iteration with a working increment
```
