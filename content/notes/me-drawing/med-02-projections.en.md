---
title: "Drawing 02. Projections: turning 3D into a flat picture"
excerpt: "Lectures 1–2 and seminars 1–2. Central and parallel projection, oblique and axonometric (isometric), first-angle (European) versus third-angle (US) projection, the six views, choosing the front view, and drawing an isometric of a bent wire."
---

## The whole topic in a minute

- The part is 3D, the sheet is flat, so you need a **projection**.
- **Central (perspective)** is like a photo: nice to look at, but sizes lie. **Parallel (orthographic)** is like a shadow under the noon sun: sizes are honest.
- **Axonometric (isometric)** gives a 3D-looking picture to understand the shape, but you can't measure from it.
- Europe and BME use **first-angle projection**: the part sits **between** you and the sheet. The top view goes **below** the front view, the left view goes on the **right**.
- The US does the opposite (third angle). The symbol in the title block tells you which one.

## Kinds of projection

![Perspective, oblique, isometric and orthographic projection of a cube](/drawing/projection-kinds.svg "The same cube in four projections")

| Projection | How it works | True sizes? |
|---|---|---|
| Central (perspective) | All rays meet at the eye | No. Far things shrink, like rails meeting at the horizon |
| Oblique | Rays are parallel but hit the sheet at an angle | Only the face parallel to the sheet |
| Axonometric | Rays are perpendicular to the sheet, the part is turned | No, but the shape reads at a glance |
| Orthographic | Rays parallel and perpendicular to the sheet | **Yes**, which is why drawings use it |

Analogy: perspective is a phone photo; orthographic is the shadow of an object on a wall when the light hits the wall dead square.

## Isometric

A special axonometric: the three axes X, Y, Z are **120°** apart. Vertical edges stay vertical, horizontal ones run at 30° to the horizon. Lengths along the axes are drawn full size. Circles become ellipses.

In seminar 2 you drew an isometric of a bent wire from its front and top views. The trick: walk along the wire one segment at a time and lay each one along one of the three axes.

## First-angle projection

![Where the views go in first-angle projection](/drawing/first-angle.svg "First angle: top view below the front, left view on the right")

Picture the part inside a glass box. You look at it from one side and its "shadow" falls on the box wall **behind** the part. Then you unfold the box flat, like a paper pattern.

So, the rule to learn by heart:

- **Front view** is the main one, in the middle.
- **Top view** goes **below** it.
- **Left view** goes on the **right** of the front view.
- **Right view** goes on the **left**.
- **Bottom view** above the front, **rear view** to the right of the left view.

It feels backwards, but the logic is simple: the shadow falls on the side opposite you. Look from the left, the shadow lands on the right wall.

| | First angle (Europe, ISO E) | Third angle (US, ISO A) |
|---|---|---|
| Where the part is | Between eye and sheet | Behind the sheet, the sheet is a window |
| Top view | Below the front view | Above the front view |
| Left view | On the right | On the left |

The **projection symbol** in the title block is a truncated cone: a trapezoid from the side and two circles next to it. In first angle the circles sit on the **right** of the trapezoid.

The views are locked together: height is the same in the front and side views, width the same in the front and top views, depth the same in the top and side views. Thin construction lines carry those sizes across.

## Choosing the front view

1. It shows **the most** of the part's shape.
2. It has **the fewest** hidden lines.
3. The part sits in its working position or the way it is clamped on the machine. Shafts are usually drawn horizontally.
4. Use **as many views as needed**, no more. A turned part often needs only one view with the Ø sign.

## Videos

```video
https://www.youtube.com/watch?v=heIobpUVZqc | First vs third angle, animation (ADTW Study)
https://www.youtube.com/watch?v=aTpZqCwSjas | Orthographic projection: first angle
https://www.youtube.com/watch?v=Gbj7CfoA_sk | First Angle vs. Third Angle (GD&T Basics)
https://www.youtube.com/watch?v=8j7l1OWhMlE | Isometric projection from orthographic views
```

## Check yourself

```quiz
? First angle. Where does the left view go?
- left of the front view
+ right of the front view
- above the front view
> You look from the left, the shadow falls on the right wall of the box.

? Where is the top view in first angle?
+ below the front view
- above the front view
- right of the front view

? Which projection keeps true sizes?
- perspective
- isometric
+ orthographic
```

```cards
Projection method in Europe :: first angle (part between eye and sheet)
Top view in first angle :: below the front view
Left view in first angle :: right of the front view
Angle between isometric axes :: 120°
First-angle symbol :: trapezoid with the circles on its right
```
