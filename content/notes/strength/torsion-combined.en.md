---
title: Torsion, stress state and failure criteria
excerpt: Torsion of circular shafts, angle of twist, principal stresses and Mohr's circle, Tresca and von Mises equivalent stresses, and combined bending plus torsion of shafts.
---

## Torsion

$\tau = T\rho/I_p$, $\tau_{\max} = T/W_p$. Solid shaft $I_p = \pi d^4/32$, $W_p = \pi d^3/16$. Twist $\varphi = Tl/(GI_p)$, $G = E/(2(1+\mu)) \approx 80$ GPa for steel.

Torque from power: $T = 9550P/n$ (kW, rpm → N·m). Hollow shafts save mass: $c = 0.8$ removes 64% of material and only 41% of $W_p$. Sizing: $d \ge \sqrt[3]{16T/(\pi[\tau])}$.

## Stress state

Principal stresses $\sigma_1 \ge \sigma_2 \ge \sigma_3$ act on planes with zero shear. Plane stress: $\sigma_{\max,\min} = \frac{\sigma_x+\sigma_y}{2} \pm \sqrt{(\frac{\sigma_x-\sigma_y}{2})^2 + \tau_{xy}^2}$. Mohr's circle radius is $\tau_{\max}$; rotating the plane by $\alpha$ rotates $2\alpha$ on the circle.

## Failure criteria

| Criterion | $\sigma_\text{eq}$ |
|---|---|
| Max normal stress | $\sigma_1$ |
| Tresca (max shear) | $\sigma_1 - \sigma_3$ |
| von Mises (distortion energy) | $\sqrt{\frac12[(\sigma_1-\sigma_2)^2 + (\sigma_2-\sigma_3)^2 + (\sigma_3-\sigma_1)^2]}$ |
| Mohr | $\sigma_1 - k\sigma_3$ |

The "von Mises stress" in FEA plots is the fourth criterion.

## Shafts under bending and torsion

Tresca: $\sqrt{M^2 + T^2}/W$; von Mises: $\sqrt{M^2 + 0.75T^2}/W$. Then $d \ge \sqrt[3]{32M_\text{eq}/(\pi[\sigma])}$.

```calc
P = 7.5 | 0.1..100 | kW | Power
n = 1450 | 10..6000 | rpm | Speed
M = 60 | 0..2000 | N·m | Bending moment
d = 25 | 10..150 | mm | Shaft diameter
T = 9550*P/n | | N·m | Torque
W = pi*d^3/32 | | mm³ | Section modulus
seq = sqrt((M*1000/W)^2 + 3*(T*1000/(2*W))^2) | | MPa | von Mises stress
```

## Flashcards

```cards
Max torsional shear :: $T/W_p$
Torque from power :: $T = 9550P/n$
Tresca :: $\sigma_1 - \sigma_3$
von Mises for bending + torsion :: $\sqrt{\sigma^2 + 3\tau^2}$
```
