---
title: "Eigenvalues and eigenvectors: principal stresses and natural frequencies"
excerpt: What eigenvectors are, how to find them, and why principal stresses, principal axes and vibration modes are all eigenproblems.
---

## Definition

$A\vec v = \lambda\vec v$: the transformation only stretches $\vec v$. Find $\lambda$ from $\det(A - \lambda E) = 0$, then each $\vec v$ from $(A - \lambda E)\vec v = 0$.

Example: $A = \begin{pmatrix}4 & 1\\ 2 & 3\end{pmatrix}$ gives $\lambda^2 - 7\lambda + 10 = 0$, $\lambda = 5$ with $(1, 1)$ and $\lambda = 2$ with $(1, -2)$. Checks: $\sum\lambda = \operatorname{tr}A$, $\prod\lambda = \det A$.

## Symmetric matrices

Real eigenvalues, orthogonal eigenvectors, diagonalizable by a rotation. Mechanics is full of them.

## Applications

- **Principal stresses** are eigenvalues of the stress tensor: $\sigma_{1,2} = \frac{\sigma_x + \sigma_y}{2} \pm \sqrt{\left(\frac{\sigma_x - \sigma_y}{2}\right)^2 + \tau_{xy}^2}$. Mohr's circle is the graphical version.
- **Principal axes of inertia** diagonalize the inertia tensor.
- **Natural frequencies**: $M\ddot x + Kx = 0$ leads to $\det(K - \omega^2 M) = 0$; eigenvectors are mode shapes. This is what modal analysis in FEA computes.
- **Stability**: $\dot x = Ax$ decays if all $\operatorname{Re}\lambda < 0$; Euler buckling loads are eigenvalues too.

```python
import numpy as np
S = np.array([[80, 40], [40, -20]])
print(np.linalg.eigh(S)[0][::-1])  # principal stresses, MPa
```

## Flashcards

```cards
Eigenvector definition :: $A\vec v = \lambda\vec v$
Characteristic equation :: $\det(A - \lambda E) = 0$
Sum of eigenvalues :: trace
Natural frequencies :: $\det(K - \omega^2 M) = 0$
```
