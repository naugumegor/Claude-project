# Ingenium

Личная база знаний: конспекты лекций, полезные ссылки и фото. Через год на этой же базе вырастет магазин.

## Стек

- **Next.js 16** (App Router, Cache Components) + TypeScript
- **Tailwind CSS 4** — палитра задана токенами в `src/app/globals.css`
- **Motion** — анимации (поиск, карточки, фильтры, переключатели)
- **i18n** — встроенный роутинг Next.js: `/ru/...` и `/en/...`, словари в `src/dictionaries`
- **react-markdown + KaTeX** — конспекты в Markdown с формулами
- **Neon Postgres + Drizzle ORM** — база (локально без настроек — встроенный PGlite в `.data/`)
- **Vercel Blob** — фото, загруженные через админку
- **Вход через GitHub** — в админку пускает только `naugumegor`

## Запуск

```bash
npm install
npm run dev      # http://localhost:3000 — миграции + демо-данные применятся сами
npm run build    # миграции + продакшн-сборка
npm run lint
npm run db:generate   # после правки src/db/schema.ts — создать новую миграцию
```

Локально без `GITHUB_CLIENT_ID` вход в админку (`/ru/admin`) пускает сразу, без GitHub.
Локальный PGlite однопользовательский: не запускай `build` и `start`/`dev` одновременно.

### Переменные окружения (Vercel)

| Переменная | Откуда |
|---|---|
| `DATABASE_URL` | интеграция Neon |
| `BLOB_READ_WRITE_TOKEN` | Blob-хранилище `ingenium-media` |
| `AUTH_SECRET` | случайная строка, подписывает cookie сессии |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | GitHub OAuth App (callback: `/api/auth/callback`) |

## Где что лежит

| Путь | Что там |
|---|---|
| `src/app/[lang]/` | страницы: главная, `materials`, `materials/[slug]` |
| `src/proxy.ts` | редирект `/` → `/ru` или `/en` по языку браузера |
| `src/dictionaries/` | переводы интерфейса |
| `src/lib/content.ts` | модель материала (тип, язык, переводы, теги) |
| `src/db/schema.ts` | таблицы: материалы, тексты RU/EN, темы, теги, медиа |
| `drizzle/` | SQL-миграции |
| `scripts/migrate.ts` | применяет миграции и заливает демо-данные в пустую базу |
| `src/lib/materials.ts` | кэшированные чтения для публичных страниц |
| `src/app/[lang]/admin/` | админка и Server Actions (сохранение, удаление, загрузка фото, превью ссылок) |
| `src/app/api/auth/` | вход через GitHub OAuth (и клиенты, и владелец; админ = GitHub-логин владельца) |
| `src/app/[lang]/login`, `src/app/[lang]/account` | вход/регистрация по почте и паролю, личный кабинет, избранное |
| `src/lib/session.ts`, `src/lib/password.ts` | подписанная cookie-сессия, хэши паролей (scrypt), защита от перебора |
| `src/app/api/upload` | выдаёт браузеру админа токен для прямой загрузки PDF/HTML в Blob (до 100 МБ) |
| `src/app/api/files/[id]` | отдаёт документы: PDF inline, HTML в CSP-песочнице без доступа к сайту |
| `src/db/search.ts`, `src/app/api/search` | полнотекстовый поиск Postgres |
| `src/lib/og.tsx`, `assets/fonts` | картинки-превью для соцсетей |
| `src/components/` | шапка, поиск, карточки, сетка с фильтрами |

Аналитика: `@vercel/analytics` в `src/app/[lang]/layout.tsx`; данные смотреть во вкладке Analytics проекта на Vercel (там же её надо один раз включить).

## Этапы

1. ✅ Каркас, дизайн, RU/EN, анимации, деплой на Vercel
2. ✅ База (Neon Postgres + Drizzle), фото в Vercel Blob, вход через GitHub, админка
3. ✅ Полнотекстовый поиск (RU/EN морфология), теги, похожие материалы, подсветка кода, SEO (sitemap, robots, canonical, OG-картинки, JSON-LD)
4. ✅ Документы (PDF, HTML) с просмотром на странице, аккаунты клиентов (почта+пароль, GitHub), избранное
5. ✅ Учёба: время чтения и «продолжить с места», режим «Проверь себя», карточки (` ```cards `) и мини-тесты (` ```quiz `) прямо в Markdown, озвучка, помодоро с фоновым шумом, тёмная тема, фокус-режим, оглавление, шпора на А4, экспорт в .md и Anki (`src/components/study/`, `src/lib/study.ts`)
6. Магазин: каталог, корзина, оплата, сброс пароля по почте
