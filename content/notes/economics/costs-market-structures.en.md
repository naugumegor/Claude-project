---
title: "Costs and market structures: competition, monopoly, oligopoly"
excerpt: Average and marginal costs, the MR = MC rule, when to shut down, perfect competition versus monopoly, the Lerner index, oligopoly and the prisoner's dilemma.
---

## Costs

$TC = FC + VC$; $AC = TC/Q$, $AVC = VC/Q$; $MC = dTC/dQ$. MC crosses AVC and AC at their minima. Economic costs include opportunity costs, so zero economic profit is normal.

```python
import numpy as np
import matplotlib.pyplot as plt
FC = 100
Q = np.linspace(0.5, 15, 300)
VC = 10*Q - Q**2 + 0.1*Q**3
MC = 10 - 2*Q + 0.3*Q**2
AC = (FC + VC)/Q
i = np.argmin(AC)
print(f"min AC = {AC[i]:.2f} at Q = {Q[i]:.1f}, MC there = {MC[i]:.2f}")
plt.plot(Q, MC, label="MC"); plt.plot(Q, VC/Q, label="AVC"); plt.plot(Q, AC, label="AC")
plt.ylim(0, 60); plt.legend(); plt.grid(alpha=.3); plt.show()
```

## Profit maximisation

$MR = MC$. Under perfect competition $MR = P$: produce where $P = MC$, shut down if $P < \min AVC$; in the long run $P = \min AC$.

## Monopoly

For $P = a - bQ$, $MR = a - 2bQ$. Example $P = 100 - 2Q$, $MC = 20$: monopoly $Q = 20$, $P = 60$; competition $Q = 40$, $P = 20$; deadweight loss 400. Lerner index $L = (P - MC)/P = 1/|E|$.

```calc
title: Monopoly vs competition
a = 100 | 20..300 | | Demand intercept
b = 2 | 0.2..10..0.1 | | Demand slope
MC = 20 | 0..100 | | Marginal cost
Qm = (a - MC)/(2*b) | | | Monopoly quantity
Pm = a - b*Qm | | | Monopoly price
Qc = (a - MC)/b | | | Competitive quantity
DWL = (Pm - MC)*(Qc - Qm)/2 | | | Deadweight loss
L = (Pm - MC)/Pm | | | Lerner index
plot x: 0..a/b | a - b*x | Demand
plot x: 0..a/(2*b) | a - 2*b*x | MR
plot x: 0..a/b | MC | MC
axes: Q ; price
```

## Other structures

Monopolistic competition: many firms, differentiated products, free entry, zero long-run profit. Oligopoly: few firms that react to each other; the prisoner's dilemma pushes both to low prices (5, 5) although (10, 10) was possible; repeated games sustain cooperation.

## Flashcards

```cards
Profit-maximising rule :: $MR = MC$
Short-run shutdown :: $P < \min AVC$
Linear-demand MR :: $a - 2bQ$
Lerner index :: $(P - MC)/P = 1/|E|$
Nash equilibrium :: no one gains by deviating alone
```
