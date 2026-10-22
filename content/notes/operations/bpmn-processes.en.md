---
title: "Business processes: BPMN, swimlanes, bottlenecks and Lean"
excerpt: How to draw a process both a director and an operator understand. BPMN elements, swimlanes, the RACI matrix, finding bottlenecks, Little's law and the seven wastes of lean production.
---

## Processes

A process turns an input into a result a customer values; it has an owner, a start and end, and metrics (time, cost, quality).

## BPMN essentials

Events (circles), tasks (rounded rectangles, verb + object), gateways (diamonds: × exclusive, + parallel), sequence flow (solid arrows), message flow (dashed), pools and swimlanes (who does it), data objects. Keep 7–15 tasks per level and label every gateway branch.

```process
type: flow
title: Make-to-order part
Customer request | 0.5 day | Sales receives the drawing
Manufacturability check | 1 day | Process engineer reviews the design
Price and lead time | 0.5 day | Machine-hour costing
Contract and prepayment | 2 days | Customer signs and pays
Material purchase | 3 days | Procurement, if not in stock
Machining | 2 days | Turning, milling, heat treatment
Inspection | 0.5 day | Dimensional check
Shipping | 0.5 day | Documents and delivery
```

Ten days in total, two on machines: value-adding time is typically 5–20%.

## RACI

Responsible does, Accountable owns (exactly one per task), Consulted before, Informed after.

## Bottlenecks and Little's law

The slowest step sets throughput. $WIP = TH\cdot CT$: 40 jobs in progress at 4 a day means 10 days per job; cap WIP at 20 to halve lead time (kanban).

```calc
title: Little's law
WIP = 40 | 1..200 | jobs | Work in progress
TH = 4 | 0.5..30..0.5 | jobs/day | Throughput
CT = WIP/TH | | days | Cycle time
```

## Seven wastes

Overproduction, waiting, transport, over-processing, inventory, motion, defects (plus unused talent). Tools: 5S, value stream mapping, SMED, poka-yoke, kaizen.

## Flashcards

```cards
Exclusive gateway :: only one branch runs
Accountable per task :: exactly one
Little's law :: $WIP = TH\cdot CT$
Bottleneck :: the slowest step, it sets throughput
Poka-yoke :: mistake-proofing by design
```
