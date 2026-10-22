-- Demo of the study blocks on the seeded Newton note (only if it hasn't got them yet).
UPDATE "material_texts"
SET "body" = "body" || $md$

## Карточки

```cards
Второй закон Ньютона :: $F = ma$
Сила трения скольжения :: $F_{\text{тр}} = μN$
Проекция $mg$ на ось вдоль плоскости :: $mg\sin α$
Ускорение бруска на наклонной :: $a = g(\sin α − μ\cos α)$
```

## Проверь себя

```quiz
? Чему равна сила реакции опоры на наклонной плоскости?
- $mg$
+ $mg\cos α$
- $mg\sin α$
> Вдоль оси Y ускорения нет, поэтому $N$ уравновешивает проекцию $mg$ на эту ось.

? Брусок не едет. Что это значит?
+ $\tan α \le μ$
- $μ = 0$
- $α = 90°$
```$md$
WHERE "locale" = 'ru'
  AND "material_id" = (SELECT "id" FROM "materials" WHERE "slug" = 'newton-laws')
  AND "body" NOT LIKE '%```cards%';
