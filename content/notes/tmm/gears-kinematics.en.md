---
title: "Gears: involute, module, ratios and planetary trains"
excerpt: The fundamental law of gearing, the involute profile, module and gear dimensions, undercut and profile shift, contact ratio, multi-stage and planetary gears with Willis' formula.
---

## Law of gearing

Constant ratio requires the common normal to pass through a fixed **pitch point**. The **involute** (traced by unwinding a string from the base circle) satisfies it with a straight line of action, insensitivity to centre distance errors, and one rack cutter per module.

## Dimensions (spur, no shift)

Module $m = p/\pi$ (standard series 1, 1.25, 1.5, 2, 2.5, 3, 4, 5…), pressure angle 20°.

$d = mz$, $d_a = m(z+2)$, $d_f = m(z - 2.5)$, $d_b = d\cos\alpha$, $a_w = m(z_1+z_2)/2$.

Helical: $d = m_nz/\cos\beta$, axial force $F_a = F_t\tan\beta$; herringbone cancels it.

## Undercut and shift

Below $z = 17$ (at 20°) the rack undercuts the root. Positive profile shift $xm$ fixes it and strengthens the tooth. Contact ratio should be at least 1.1–1.2 (spur gears 1.4–1.8).

## Ratios

$u = z_2/z_1$; stages multiply; $T_2 = T_1u\eta$. Typical per stage: spur/helical 2–6.3, bevel 1–4, worm 8–80.

## Spin the gearbox

Rotate it, explode it into parts and cut a section to see how gear pairs form the stages.

```3d
src: https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/GearboxAssy/glTF-Binary/GearboxAssy.glb
title: Gearbox assembly
```

## Planetary trains

Willis: $\frac{\omega_a - \omega_H}{\omega_b - \omega_H} = -\frac{z_b}{z_a}$. Fixed ring, sun in, carrier out: $u = 1 + z_b/z_a$. Assembly needs coaxiality $z_b = z_a + 2z_g$, neighbour clearance, and $(z_a + z_b)/k$ integer.

```calc
za = 20 | 12..60 | | Sun teeth
zb = 70 | 40..200 | | Ring teeth
k = 3 | 2..6 | | Planets
zg = (zb - za)/2 | | | Planet teeth
u = 1 + zb/za | | | Ratio (ring fixed)
asm = (za + zb)/k | | | Must be an integer
```

## Flashcards

```cards
Pitch diameter :: $d = mz$
Tip diameter :: $m(z + 2)$
Minimum teeth without undercut :: 17
Planetary ratio, ring fixed :: $1 + z_b/z_a$
```
