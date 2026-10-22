---
title: "Machine design project: a two-stage helical gearbox from A to Z"
excerpt: Step-by-step algorithm for the classic machine design course project, from motor selection to the assembly drawing, with formulas at each step and a checklist of common mistakes.
---

## Given

Conveyor drive: belt pull $F$, belt speed $v$, drum diameter $D$, service life. Motor → (belt drive) → two-stage gearbox → coupling → drum shaft.

## Steps

1. **Kinematics and power**: $P_\text{out} = Fv$; overall efficiency (belt 0.95–0.97, gear pair 0.97–0.98, bearing pair 0.99, coupling 0.98); pick a motor with $P \ge P_\text{out}/\eta$; drum speed $n = 60000v/(\pi D)$; total ratio $u$; split with $u_\text{HS} \approx (1.2$–$1.3)u_\text{LS}$; tabulate $P_i$, $n_i$, $T_i = 9550P_i/n_i$ per shaft.
2. **Materials and allowables** (e.g. 40Kh / 41Cr4 quenched and tempered, pinion 20–50 HB harder).
3. **Low-speed stage first**: centre distance from contact strength, standard $a_w$ and module, helix angle 8–18°, tooth numbers ($z_1 \ge 17$), actual ratio within 2.5–4%, dimensions, accuracy grade, contact and bending checks, mesh forces.
4. **High-speed stage** the same way.
5. **Belt or chain drive** if present.
6. **Preliminary shafts and layout**: torsion-based diameters, preliminary bearings, scaled layout for distances.
7. **Shaft fatigue check** at critical sections, $s \ge 1.5$–2.5.
8. **Bearings**: equivalent loads including induced axial forces, $L_{10h}$ ≥ required.
9. **Keys, couplings, fits**: gear on shaft H7/r6, bearing inner ring k6, housing H7.
10. **Housing, lubrication, seals**: cast iron wall $\approx 0.025a_w + 3 \ge 8$ mm, splash lubrication with the wheel immersed 1–2 tooth heights.
11. **Drawings and report**: assembly, general arrangement, shaft and gear detail drawings.

## Common mistakes

- Torque computed from motor power instead of the shaft's own power.
- Non-standard $a_w$, $m$ or ratio left unrounded.
- Pinion narrower than or equal to the wheel.
- Shaft steps that force a bearing over the gear seat; missing shoulders.
- Ignoring helical axial forces and overhung coupling loads.
- Using interference fits instead of bearing fits (k6/H7).
- Missing fillets, chamfers, grinding reliefs and centre holes on shaft drawings.

```calc
F = 3 | 0.5..20 | kN | Belt pull
v = 1.2 | 0.2..3 | m/s | Belt speed
D = 300 | 100..800 | mm | Drum diameter
nd = 1450 | 700..2900 | rpm | Motor speed
eta = 0.97^2*0.99^3*0.98 | | | Efficiency
Preq = F*v/eta | | kW | Required motor power
nout = 60000*v/(pi*D) | | rpm | Drum speed
u = nd/nout | | | Total ratio
ut = sqrt(u/1.25) | | | Low-speed stage
ub = u/ut | | | High-speed stage
```
