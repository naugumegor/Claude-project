---
title: "FEA and CFD: what to know before you press Solve"
excerpt: How the finite element method works, element types, meshes and convergence, boundary conditions, singularities and result checks; CFD basics with near-wall meshing, y+, turbulence models and residuals; a pre-run checklist.
---

## Rule one

The software always produces a pretty picture. Estimate the answer by hand first and compare afterwards.

## How FEA works

Mesh the body into elements and nodes, approximate displacement with shape functions, assemble $[K]\{u\} = \{F\}$, solve for nodal displacements, then derive strains and stresses. Displacements are the most accurate; stresses (derivatives) less so.

Elements: solids (use quadratic 10-node tets; linear tets are too stiff), shells for thin walls, beams for frames.

## Mesh and convergence

Refine at stress raisers (3–4 elements across a fillet) and run a **mesh convergence study** until the result changes by less than 5%. Check element quality.

## Boundary conditions

Fixed faces over-stiffen and create false peaks. Remove all six rigid-body motions. Use symmetry with normal-displacement constraints. Spread loads over real areas. Contacts are nonlinear and slow.

## Singularities

Sharp re-entrant corners and point loads give infinite theoretical stress that never converges. Model the real fillet or read stresses away from the point.

## Checks

Deformed shape makes sense; reactions equal loads; order of magnitude matches hand calcs; peak not at a singularity; linear results below yield; consistent units.

## CFD basics

Finite volume solution of Navier–Stokes. Domain size (external flow: 5–10 body lengths upstream, 15–20 downstream), inflation layers at walls, **y+** ≈ 30–300 with wall functions or ≈ 1 for k-ω SST low-Re, choose k-ω SST as the default turbulence model, outlet far from separation, steady vs transient. Converged when residuals drop 3–4 orders, monitored quantities plateau, mass balances, and results are mesh independent.

## Flashcards

```cards
FEA equation :: $[K]\{u\} = \{F\}$
Most accurate FEA output :: displacements
Singularity :: infinite stress at a sharp corner or point load
Default turbulence model :: k-ω SST
y+ for resolved viscous sublayer :: ≈ 1
```
