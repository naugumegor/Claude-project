# Ingenium

Личная база знаний: конспекты лекций, полезные ссылки и фото. Через год на этой же базе вырастет магазин.

## Стек

- **Next.js 16** (App Router, Cache Components) + TypeScript
- **Tailwind CSS 4** — палитра задана токенами в `src/app/globals.css`
- **Motion** — анимации (поиск, карточки, фильтры, переключатели)
- **i18n** — встроенный роутинг Next.js: `/ru/...` и `/en/...`, словари в `src/dictionaries`
- **react-markdown + KaTeX** — конспекты в Markdown с формулами

## Запуск

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # продакшн-сборка
npm run lint
```

## Где что лежит

| Путь | Что там |
|---|---|
| `src/app/[lang]/` | страницы: главная, `materials`, `materials/[slug]` |
| `src/proxy.ts` | редирект `/` → `/ru` или `/en` по языку браузера |
| `src/dictionaries/` | переводы интерфейса |
| `src/lib/content.ts` | модель материала (тип, язык, переводы, теги) |
| `src/lib/materials.ts` | слой доступа к данным — на этапе 2 тут появится база |
| `src/content/mock.ts` | демо-материалы до подключения базы |
| `src/components/` | шапка, поиск, карточки, сетка с фильтрами |

## Этапы

1. ✅ Каркас, дизайн, RU/EN, анимации, деплой на Vercel
2. База (Neon Postgres + Drizzle), фото в Vercel Blob, вход через GitHub, админка
3. Полнотекстовый поиск, теги, SEO
4. Магазин: каталог, корзина, оплата
