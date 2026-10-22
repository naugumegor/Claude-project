---
title: Matrices and linear systems
excerpt: Matrix operations, determinant, inverse, Gaussian elimination, rank and the Rouché–Capelli theorem, and where they live in FEA and statics.
---

## Matrices

A matrix is best seen as a **linear transformation**. Product $c_{ij} = \sum_k a_{ik}b_{kj}$ ("row times column") requires matching sizes and is **not commutative**. $(AB)^T = B^TA^T$.

## Determinant

$2\times2$: $ad - bc$. $|\det A|$ is the **volume scale factor**; $\det A = 0$ means the space collapses and there is no inverse. Row swap flips the sign, adding a multiple of a row changes nothing, $\det(AB) = \det A\det B$.

## Inverse

Exists iff $\det A \ne 0$. For $2\times2$: $\frac{1}{ad-bc}\begin{pmatrix}d & -b\\ -c & a\end{pmatrix}$.

## Solving $A\vec x = \vec b$

**Gaussian elimination**: reduce $(A|\vec b)$ to row echelon form, then back-substitute. Cost $\sim n^3/3$; FEA solvers do the same as an LU factorization. Cramer's rule is elegant but impractical for $n > 3$.

**Rank** = number of nonzero rows in echelon form. **Rouché–Capelli**: the system is consistent iff $\operatorname{rank}A = \operatorname{rank}(A|\vec b)$; unique if the rank equals the number of unknowns.

## Engineering

- Truss joint equilibrium is a linear system; rank deficiency means a statically indeterminate structure or a mechanism.
- FEA solves $[K]\{u\} = \{F\}$; an unconstrained model gives a singular $K$.
- Kirchhoff's laws for circuits.

```python
import numpy as np
A = np.array([[1.0, 0.6, 0.0], [0.0, 0.8, 0.0], [0.0, -0.6, 1.0]])
b = np.array([0.0, 10.0, 0.0])
print(np.linalg.solve(A, b), np.linalg.matrix_rank(A))
```

## Flashcards

```cards
$(AB)^T$ :: $B^T A^T$
$2\times2$ determinant :: $ad - bc$
Inverse exists when :: $\det A \ne 0$
Rouché–Capelli :: consistent iff $\operatorname{rank} A = \operatorname{rank}(A|b)$
```
