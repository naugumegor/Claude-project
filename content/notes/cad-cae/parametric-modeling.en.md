---
title: "Parametric CAD modelling: rules that save your sanity"
excerpt: How to build models in SolidWorks, Inventor, Fusion, Onshape or FreeCAD so they stay easy to change. Sketches, the feature tree, assemblies, configurations, drawings and exchange formats.
---

## The goal

A parametric model is sketches + dimensions + relations + features. A good one **rebuilds predictably** when design intent changes.

## Sketches

Anchor the first sketch to the origin; fully define every sketch; add relations before dimensions; keep sketches simple (fillets, chamfers, holes and patterns as features); use centre lines and symmetry; dimension from datums the way the part will be inspected.

## Feature tree

Follow manufacturing logic: base body, major cuts, details, fillets and chamfers last. Name important features. Reference stable geometry (planes, axes, sketches), not edges that may vanish. Drive key parameters with global variables and equations. Use patterns. Flex-test by changing main dimensions ±30%.

## Assemblies

Fix the first part, mate on datums, leave only real degrees of freedom, use subassemblies like the real build, take fasteners and bearings from libraries, check interference. Top-down design with a skeleton works but watch external references.

## Configurations and drawings

Design tables for part families. Drawings are associative; add what 3D lacks: tolerances, roughness, GD&T, notes, title block.

## Exchange formats

STEP for solids, Parasolid/ACIS as kernel formats, IGES legacy surfaces, STL/3MF meshes for printing, DXF/DWG for 2D and laser cutting.

## Flashcards

```cards
Neutral solid exchange format :: STEP
Where fillets go in the tree :: at the end
Relations or dimensions first :: relations
Flex test :: change key dimensions and check the rebuild
```
