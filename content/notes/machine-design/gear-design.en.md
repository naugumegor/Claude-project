---
title: Gear strength design
excerpt: Mesh forces, contact (pitting) and tooth bending strength, allowable stresses, choosing materials and hardness, and sizing the centre distance, following the logic of ISO 6336 / GOST 21354 in simplified form.
---

## Failure modes

Pitting (contact fatigue) governs closed lubricated gears; tooth breakage (bending) is checked; wear and scuffing matter for open or fast gears. So: **design for contact, check bending**.

## Forces

$F_t = 2T/d$, $F_r = F_t\tan\alpha/\cos\beta$, $F_a = F_t\tan\beta$.

## Contact stress (Hertz)

$\sigma_H = Z_EZ_HZ_\varepsilon\sqrt{\frac{F_tK_H}{b_wd_1}\frac{u \pm 1}{u}} \le [\sigma_H]$, with $Z_E \approx 190\sqrt{\text{MPa}}$ for steel, $Z_H \approx 2.5$.

Sizing: $a_w \ge K_a(u+1)\sqrt[3]{\frac{T_2K_H}{\psi_{ba}u^2[\sigma_H]^2}}$, $K_a = 49.5$ spur, 43 helical ($T_2$ in N·mm, stress in MPa, result in mm); face width ratio $\psi_{ba} = 0.25$–0.4. Round to the standard series.

## Bending

$\sigma_F = \frac{F_tK_FY_FY_\beta}{bm} \le [\sigma_F]$; form factor $Y_F$ ≈ 4.1 at $z = 20$, 3.7 at 40. Module $m \approx (0.01$–$0.02)a_w$.

## Allowables

Through-hardened 180–350 HB: $\sigma_{H\lim} = 2\text{HB} + 70$, $\sigma_{F\lim} = 1.75\text{HB}$. Induction hardened: $17\text{HRC} + 200$. Carburized: $23\text{HRC}$, bending 750–800 MPa. Safety factors $S_H$ 1.1–1.2, $S_F$ 1.7–2.2. Make the pinion 20–50 HB harder than the wheel.

Efficiency: gear pair 0.97–0.98, bearing pair 0.99, worm 0.7–0.9.

## Flashcards

```cards
Closed gear design criterion :: contact strength
Tangential force :: $F_t = 2T/d$
Module rule of thumb :: $(0.01$–$0.02)a_w$
Through-hardened contact limit :: $2\text{HB} + 70$ MPa
```
