---
title: Limits and continuity without pain
excerpt: What a limit is, intuitively and rigorously, the two famous limits, equivalent infinitesimals and types of discontinuity.
---

## Why limits matter

Almost everything in calculus (derivative, integral, series) is defined through a **limit**: the value a function approaches as the argument gets close to a point, *without necessarily reaching it*.

Example: $f(x) = \dfrac{\sin x}{x}$ is undefined at zero ($0/0$), yet its values approach 1, so $\lim\limits_{x\to 0} \dfrac{\sin x}{x} = 1$.

## The ε–δ definition

$A$ is the limit of $f(x)$ as $x \to a$ if

$$\forall \varepsilon > 0\ \exists \delta > 0:\ 0 < |x - a| < \delta \Rightarrow |f(x) - A| < \varepsilon.$$

However narrow a band $\varepsilon$ you draw around $A$, there is a neighbourhood $\delta$ of $a$ where the graph stays inside it.

## Computing limits in practice

1. **Substitute.** A number means you are done (for continuous functions).
2. An **indeterminate form** ($0/0$, $\infty/\infty$, $\infty - \infty$, $0\cdot\infty$, $1^\infty$, $0^0$, $\infty^0$)? Transform it: factor and cancel, multiply by the conjugate, divide by the highest power, replace by **equivalent** infinitesimals, or use L'Hôpital's rule $\lim f/g = \lim f'/g'$.

## The famous limits

$$\lim_{x\to 0}\frac{\sin x}{x} = 1, \qquad \lim_{x\to\infty}\left(1 + \frac{1}{x}\right)^x = e.$$

## Equivalents as $x \to 0$

| Function | Equivalent to |
|---|---|
| $\sin x$, $\tan x$, $\arcsin x$, $\arctan x$ | $x$ |
| $1 - \cos x$ | $x^2/2$ |
| $e^x - 1$, $\ln(1+x)$ | $x$ |
| $(1+x)^k - 1$ | $kx$ |

> Replace only **factors**, never terms of a sum: $\tan x - \sin x \sim x^3/2$, not $0$.

## Continuity

$f$ is **continuous** at $a$ if $\lim\limits_{x\to a} f(x) = f(a)$.

- **Removable** discontinuity: the limit exists but differs from $f(a)$.
- **Jump** (first kind): one-sided limits are finite but different.
- **Essential** (second kind): a one-sided limit is infinite or does not exist.

In engineering, the jump of the shear force diagram under a point load is a first-kind discontinuity, and convergence of numerical methods is stated as a limit: error $\to 0$ as step $h \to 0$.

## Flashcards

```cards
First famous limit :: $\lim_{x\to0} \sin x / x = 1$
Second famous limit :: $\lim_{x\to\infty} (1 + 1/x)^x = e$
$1 - \cos x$ as $x \to 0$ :: $x^2/2$
Continuity at $a$ :: $\lim_{x\to a} f(x) = f(a)$
```

## Quiz

```quiz
? $\lim_{x\to0} \dfrac{e^{2x} - 1}{x}$ = ?
- 1
+ 2
- $e$
> $e^{2x} - 1 \sim 2x$.

? What kind of discontinuity does $1/x$ have at zero?
- removable
- jump
+ essential (second kind)
```
