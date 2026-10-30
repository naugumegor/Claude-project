---
title: "Drawing 07. Screw threads: what they are, how they're made, how they're drawn"
excerpt: "Lecture 5. The helix and the right-hand rule, major, minor and pitch diameter, pitch and lead, multi-start threads, designations M20, M20×1.5, Tr, G, LH, how threads are cut (die, tap, lathe tool, rolling) and the main thing: drawing external and internal threads, the ¾ circle, and hatching up to the wide line."
---

## The whole topic in a minute

- A thread is a profile (triangle, trapezoid) **wrapped along a helix** around a cylinder.
- **External** on a bolt, **internal** in a nut or a hole.
- **M20** means metric, major diameter 20, coarse (standard) pitch. **M20×1.5** is fine pitch. **LH** is left-hand.
- It's drawn simplified, **with no turns**. The key rule: **wide line where the material ends**. A bolt has a wide major diameter; a hole has a wide minor diameter.
- In the end view, the narrow diameter is drawn as **¾ of a circle**.
- In section, hatching always runs **up to the wide line**.

## What a thread is

Take a right triangle cut from paper and wrap it round a pencil. The hypotenuse lies along a **helix**. Run a groove of triangular profile along it and you have a thread.

**Right-hand thread** (the normal one): your right thumb points where the bolt travels, the fingers show the turning direction. "Righty tighty, lefty loosey". **Left-hand** threads go where rotation could undo a normal one: the left bicycle pedal, some gas bottles.

## Parameters

| Parameter | What it is | Analogy |
|---|---|---|
| Major diameter d, D | Over the crests of a bolt | The bolt's width measured with a caliper |
| Minor (root) diameter d₁, D₁ | At the roots | The bolt's "core" |
| Pitch P | Distance between neighbouring crests | Step spacing on a spiral staircase |
| Lead | How far the bolt travels in one turn | Equals the pitch for a single start |
| Number of starts | How many threads run side by side | A two-start bottle cap screws on faster |
| Thread angle β | Angle of the profile | 60° metric, 55° Whitworth and pipe, 30° trapezoidal |

Lead = pitch × number of starts. A two-start thread with pitch 2 travels 4 mm per turn.

## Designations

| Thread | Example | Where |
|---|---|---|
| Metric coarse | M20 | Almost all fasteners |
| Metric fine | M20×1.5 | Thin walls, adjusters, bearing nuts |
| Whitworth | W1" | Old British machinery |
| Pipe | G1" | Pipes, plumbing |
| Trapezoidal (ACME) | Tr14×3 | Machine lead screws, jacks |
| Buttress | S70×10 | Load in one direction (vices, presses) |
| Round | Rd10×1/10" | Dirt and knocks (fire-hose couplings) |
| Left-hand | M20 LH | Against self-loosening |

Coarse pitches worth knowing: M6 1, M8 1.25, M10 1.5, M12 1.75, M16 2, M20 2.5, M24 3, M30 3.5. The tap drill is roughly **d − P**: 8.5 mm for M10.

## How threads are made

- **Die:** external thread by hand, turned with a holder over a bar of diameter d.
- **Tap:** internal thread. Drill the tap hole first, then tap it. The tap's tip is tapered so it starts easily.
- **Lathe tool:** a tool ground to the thread profile moves along the part at **P per revolution**. The end needs a **run-off groove** so the tool can get out.
- **Rolling:** the thread is pressed in by rollers or flat dies, no chips. Mass-produced fasteners are made this way, and the thread comes out stronger.
- **Cold heading:** bolt heads and nuts are pressed from wire.

## How to draw it

![How external and internal threads are drawn](/drawing/threads.svg "External (left) and internal in section (right)")

The rule that fixes 90% of mistakes: **wide line where the material is**, narrow line where the "air" between turns is.

**External thread (bolt):**
- major diameter **wide** (it's the bolt's outline);
- minor diameter **narrow**, along the whole thread length;
- end of the full thread: a **wide** line across;
- end view: a **wide** circle for the major diameter and a **narrow ¾ circle** for the minor. The chamfer may be left out of the end view if it coincides with the ¾ circle.

**Internal thread (hole):**
- minor diameter (the hole) **wide**;
- major diameter **narrow**;
- end of thread: a **wide** line;
- end view: a **wide** circle for the hole and a **narrow ¾** for the major diameter;
- in section, **hatching runs up to the wide line**, i.e. right to the hole, across the narrow lines;
- a blind hole ends in the drill's **120°** cone, and the drilled part is longer than the threaded part.

Also:
- **Every thread starts with a chamfer.**
- The wide lines of an internal thread run up to the chamfer outline.
- Give the standard designation (M12) and the **length**. The run-out needn't be shown, except on studs.

> Trick: imagine a bolt covered in soot rolled across paper. The crests (major diameter) leave a bold mark, the roots a thin one. For a hole it's the other way round: bold where the metal is, which is the minor diameter.

## Videos

```video
https://www.youtube.com/watch?v=r_wOPys5qCw | How to draw a bolt and nut in a sectional view
https://www.youtube.com/watch?v=Gdvtw0pTAOs | How to identify thread pitch and size (Swagelok)
https://www.youtube.com/watch?v=C9QxwItzGls | 60 second cold heading: how screws are made
https://www.youtube.com/watch?v=3kxcw08p_oY | How It's Made: nuts and bolts (lecture 5)
```

## Check yourself

```quiz
? Which line shows a bolt's minor diameter?
- wide
+ narrow
- dashed

? In a section of a tapped hole the hatching goes
+ up to the wide line, i.e. the minor diameter
- up to the narrow major-diameter line
- nowhere, it isn't hatched
> The wide line is the material boundary.

? What does M16×1.5 LH mean?
- pitch 16, diameter 1.5
+ metric Ø16, fine pitch 1.5, left-hand
- a pipe thread
```

```cards
Metric thread angle :: 60°
Pitch of M10 :: 1.5 mm
Tap drill for M10 :: about 8.5 mm (d − P)
Lead of a two-start thread :: 2 × pitch
End view of a thread :: narrow ¾ circle
Why a run-off groove :: so the tool can leave at the end of the thread
Right-hand thread :: tightens clockwise
```
