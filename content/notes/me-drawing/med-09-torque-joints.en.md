---
title: "Drawing 09. How a shaft turns a pulley: keys, splines, pins and axial locking"
excerpt: "Lecture 6, seminars 5–6, homework 2. Feather and Woodruff keys, taper keys, splined joints and how they're drawn simplified, radial and tangent taper pins, clamping and polygon joints, form vs force locking. Axial locking: end washer, tab washer, castle nut, bearing locknut, retaining ring."
---

## The whole topic in a minute

- A pulley sits on a shaft. Two things are needed: it must **turn with the shaft** (torque transmission) and **not slide off** along it (axial locking).
- Torque goes through **form** (key, splines, polygon: the part simply pushes) or **force/friction** (clamp, taper key: the part is squeezed).
- The **feather key** is the most common. The hub always sits against a **shaft collar**.
- The **Woodruff key** looks like a half-moon; no collar needed, the hub sits on a taper.
- Axial locking: **end washer + bolt + tab washer**, **castle nut + cotter pin**, **bearing locknut + lockwasher**, **retaining ring**.

## Analogy

A key in a lock. You turn the key and the cylinder turns with it because the bit pushes against the pins. That's **form locking**. Grip a pipe in your hand and twist: that's **force locking**. Only friction holds, and if the torque is bigger, your hand slips.

## Feather key

![Cross-section through shaft, hub and feather key](/drawing/feather-key.svg "The key sits in the shaft's keyseat and the hub's keyway")

- The shaft gets a **keyseat** milled with an end mill or a disc cutter; the hub gets a **keyway** broached or slotted.
- The key works on its **side faces**. On top there is a **small gap** to the hub.
- The hub is pressed against a **shaft collar** on one side; axial locking goes on the other.
- Width fits: key `h8` (or h9), shaft keyseat usually `P9` or `N9`, hub keyway `Js9`. The fit calculation itself is in topic 10.
- Key sizes (width × height, groove depths) are **taken from the standard table** by shaft diameter. Engineers don't invent them, they look them up. Like the joke from the lecture: the mathematician computes the ball's volume with a formula, the physicist dunks it in a bucket, the engineer looks it up in the catalogue.

## Woodruff key

A key shaped like a segment of a disc, sitting in a deep round seat cut by a disc cutter. **No collar needed**: the hub sits on the **tapered** end of the shaft. Handy on tapers, but the deep seat weakens the shaft.

## Taper key

Driven in on a slope and **wedges** the hub. That's already **force locking**.

## Splined joint

A shaft with several lengthwise **splines** (teeth), and matching grooves in the hub. Like many keys at once: carries big torque, and the hub can also **slide** along the shaft (gearboxes).

- Profiles: **parallel-sided**, **involute**, triangular.
- Centring: on the minor diameter, the major diameter or the flanks.
- At the end of the splines there is a **tool runout**, so the active length is shorter.
- The hub is broached straight through; a blind hole is harder.
- **Drawn simplified**: major diameter wide, minor **narrow** (on the shaft) or the other way round (in the hub), like a thread. The end view shows **one or two teeth**, the rest as circles. Typical seminar 6 mistake: drawing every tooth, or swapping wide and narrow lines.

## Pins, clamps, polygons

| Joint | How it holds | Locking |
|---|---|---|
| **Radial taper pin** | Pin across the shaft through the hub; the taper is self-locking | Form |
| **Tangent taper pin** | Pin along a tangent, half in the shaft, half in the hub | Form and force |
| **Clamping ring** | A slotted hub squeezed by a bolt | Force |
| **Polygon** | Shaft with flats (a polygon), matching hole | Form |
| **Set screw with pinned end** | A screw in the hub pushes its tip into a dimple on the shaft | Form |

## Axial locking

To stop the pulley sliding off, after it you fit:

- **End washer + bolt into the shaft end.** The bolt is locked by a **tab washer** with a bent tab. The bent tab is a rib and isn't cut in section.
- **Castle nut + cotter pin** on a threaded shaft end.
- **Slotted bearing locknut + lockwasher.** The washer's inner tooth sits in a groove on the shaft, an outer tab is bent into a slot of the nut. Tooth and tabs aren't cut in section.
- **Retaining ring (circlip, Seeger ring)** in a groove. External for shafts, internal for bores. Fitted with special pliers. Quick and cheap, but it can't take a big axial load.

## Homework 2

An assembly drawing of the pulley mounting: **torque transmission type** A, B, C or D (feather key, Woodruff key, etc.), **axial locking** a or b, and the **bolted joint** in the pulley itself 1, 2, 3 or 4. Your variant comes from your Neptun code. Order: freehand sketches of every part, freehand assembly, then the constructed drawing on A3 with the parts list.

Example from the lecture, type B + b: Woodruff key, castle nut with cotter pin. From the table F1 = 22 mm, F2 = M16, F5 = 200 mm; by calculation F3 = F1 + 6 = 28 mm, F4 = 1.6 × F1 = 35.2 → **35 mm** (rounded to a standard number).

## Videos

```video
https://www.youtube.com/watch?v=F3c6GPAFZMI | Types of shaft keys, with animation
https://www.youtube.com/watch?v=ebQlUd2gVC4 | Manufacturing keyways for feather and Woodruff keys
https://www.youtube.com/watch?v=TXI2BIz495w | Set screws, keyways, splines and fitting hubs
https://www.youtube.com/watch?v=ldTHRAV3ikk | How to remove and install retaining rings
```

## Check yourself

```quiz
? Which faces of a feather key carry the load?
- the top
+ the sides
- the bottom
> There is a gap between its top and the hub.

? What's the advantage of a Woodruff key?
+ no collar needed, the hub sits on a taper
- the seat is shallow and doesn't weaken the shaft
- it carries the most torque

? A clamping joint holds by
- form
+ friction (force)
- glue
```

```cards
Form-locking torque joints :: key, splines, polygon
Force-locking torque joints :: clamp, taper key
What the hub on a feather key sits against :: the shaft collar
Woodruff key :: half-moon key, hub on a taper
Splines in the end view :: draw one or two teeth
Retaining ring :: Seeger/circlip in a groove
Bent tab of a washer in section :: not cut
```
