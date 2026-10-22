---
title: "Joints: bolted, welded, keyed and interference fits"
excerpt: Thread types and bolt property classes, preload and the typical bolt cases, weld types and sizing, keys and splines, press fits.
---

## Threads and bolts

Metric (60°, coarse by default, M12×1.25 fine), pipe (55°), trapezoidal (30°, lead screws), buttress. Self-locking when the lead angle is below the friction angle; vibration still loosens, so use locking.

Property class **8.8**: $\sigma_u = 800$ MPa, $\sigma_y = 8\cdot8\cdot10 = 640$ MPa. Nut class ≥ bolt class. M12 stress area ≈ 84 mm².

Cases: plain tension; preloaded bolt (factor 1.3 for twisting); clearance bolt in shear held by friction, preload $kF/(if)$, 5–10× the shear force; fitted bolt in shear $\tau = F/(i\pi d^2/4)$; preloaded joint with external separating load where the bolt sees only $\chi F$ ($\chi \approx 0.2$–0.3). Tightening torque $T \approx 0.2F_pd$.

## Welds

Butt welds are nearly as strong as the parent metal: $\sigma = F/(ls)$. Fillet welds fail through the throat $0.7k$: $\tau = F/(0.7kl_\Sigma)$; allowable ≈ $0.6[\sigma]$ for manual arc welding. Side fillets ≤ $60k$. Weldability: carbon equivalent $C + Mn/6 + (Cr+Mo+V)/5 + (Ni+Cu)/15 < 0.45\%$; steels like 45 and 40Kh need preheat.

## Keys and splines

Parallel key checked in bearing (crushing): $\sigma = 2T/(d(h - t_1)l_p) \le 100$–150 MPa. Splines carry more and centre better.

## Interference fits

Torque by friction $T = \pi d^2lpf/2$, pressure from Lamé's solution. Assemble by pressing, heating the hub or cooling the shaft. Fits H7/p6, H7/r6, H7/s6, H7/u7.

## Flashcards

```cards
Class 8.8 :: 800 / 640 MPa
Fillet weld throat :: $0.7k$
Key check :: bearing (crushing) stress
Tightening torque :: $\approx 0.2F_pd$
```
