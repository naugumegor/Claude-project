---
title: "SQL для аналитика: SELECT, JOIN, GROUP BY и оконные функции"
excerpt: Язык запросов к базам данных с нуля. Выборка и фильтры, сортировка, соединение таблиц, группировка и агрегаты, HAVING, подзапросы и CTE, оконные функции для накопительных итогов и динамики. Все запросы можно править и запускать прямо на странице.
tags: sql, базы данных, аналитика, join, group by
date: 2026-10-22
---

## Зачем аналитику SQL

Данные компании живут в **базах данных**: заказы, клиенты, склад, платежи. Excel выдерживает миллион строк и тормозит уже на сотне тысяч, а база данных спокойно отвечает на вопросы по миллиардам. **SQL** это язык, на котором эти вопросы задают. Его синтаксис почти одинаков в PostgreSQL, MySQL, SQLite, ClickHouse и BigQuery.

Данные лежат в **таблицах**: строки это записи, столбцы это поля. Таблицы связаны **ключами**: `orders.customer_id` указывает на `customers.id`.

Наша учебная база, магазин промышленных комплектующих:
- `customers` (id, name, city, segment): клиенты;
- `products` (id, title, category, price, cost): товары с ценой и себестоимостью;
- `orders` (id, customer_id, product_id, qty, order_date): заказы.

Создание таблиц спрятано под спойлер в каждом блоке. Меняй запрос и жми «Запустить», сломать ничего нельзя.

## SELECT: выборка и фильтр

```sql
CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT, city TEXT, segment TEXT);
INSERT INTO customers VALUES
 (1, 'Завод Прогресс', 'Самара', 'завод'),
 (2, 'ООО Ремтех', 'Казань', 'ремонт'),
 (3, 'Агрохолдинг Нива', 'Самара', 'агро'),
 (4, 'ИП Котов', 'Москва', 'ремонт'),
 (5, 'Станкомаш', 'Москва', 'завод');
CREATE TABLE products (id INTEGER PRIMARY KEY, title TEXT, category TEXT, price REAL, cost REAL);
INSERT INTO products VALUES
 (1, 'Подшипник 6205', 'подшипники', 450, 270),
 (2, 'Подшипник 6310', 'подшипники', 1900, 1200),
 (3, 'Болт М12×60 (100 шт)', 'крепёж', 1600, 900),
 (4, 'Ремень SPA 1250', 'приводы', 1100, 600),
 (5, 'Муфта упругая МУВП-32', 'приводы', 5200, 3300);
CREATE TABLE orders (id INTEGER PRIMARY KEY, customer_id INTEGER, product_id INTEGER, qty INTEGER, order_date TEXT);
INSERT INTO orders VALUES
 (1, 1, 1, 40, '2026-01-15'),
 (2, 1, 5, 2, '2026-01-20'),
 (3, 2, 2, 10, '2026-02-03'),
 (4, 3, 4, 25, '2026-02-10'),
 (5, 3, 1, 60, '2026-03-01'),
 (6, 4, 3, 3, '2026-03-05'),
 (7, 5, 5, 6, '2026-03-12'),
 (8, 5, 2, 8, '2026-03-20'),
 (9, 2, 4, 12, '2026-04-02'),
 (10, 1, 3, 5, '2026-04-18');
-- query
SELECT title, category, price, price - cost AS margin
FROM products
WHERE category = 'подшипники' OR price > 2000
ORDER BY price DESC;
```

- `SELECT` какие столбцы (можно вычислять: `price - cost`), `AS` даёт имя.
- `FROM` из какой таблицы.
- `WHERE` фильтр строк: `=`, `<>`, `>`, `BETWEEN 100 AND 500`, `IN ('Самара', 'Казань')`, `LIKE 'Подшипник%'`, `IS NULL`.
- `ORDER BY ... DESC` сортировка по убыванию, `LIMIT 10` первые 10.

Порядок **написания**: SELECT, FROM, WHERE, GROUP BY, HAVING, ORDER BY, LIMIT. Порядок **выполнения** другой: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT. Поэтому в WHERE нельзя использовать псевдоним из SELECT.

## JOIN и GROUP BY: выручка по клиентам

```sql
CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT, city TEXT, segment TEXT);
INSERT INTO customers VALUES
 (1, 'Завод Прогресс', 'Самара', 'завод'),
 (2, 'ООО Ремтех', 'Казань', 'ремонт'),
 (3, 'Агрохолдинг Нива', 'Самара', 'агро'),
 (4, 'ИП Котов', 'Москва', 'ремонт'),
 (5, 'Станкомаш', 'Москва', 'завод');
CREATE TABLE products (id INTEGER PRIMARY KEY, title TEXT, category TEXT, price REAL, cost REAL);
INSERT INTO products VALUES
 (1, 'Подшипник 6205', 'подшипники', 450, 270),
 (2, 'Подшипник 6310', 'подшипники', 1900, 1200),
 (3, 'Болт М12×60 (100 шт)', 'крепёж', 1600, 900),
 (4, 'Ремень SPA 1250', 'приводы', 1100, 600),
 (5, 'Муфта упругая МУВП-32', 'приводы', 5200, 3300);
CREATE TABLE orders (id INTEGER PRIMARY KEY, customer_id INTEGER, product_id INTEGER, qty INTEGER, order_date TEXT);
INSERT INTO orders VALUES
 (1, 1, 1, 40, '2026-01-15'),
 (2, 1, 5, 2, '2026-01-20'),
 (3, 2, 2, 10, '2026-02-03'),
 (4, 3, 4, 25, '2026-02-10'),
 (5, 3, 1, 60, '2026-03-01'),
 (6, 4, 3, 3, '2026-03-05'),
 (7, 5, 5, 6, '2026-03-12'),
 (8, 5, 2, 8, '2026-03-20'),
 (9, 2, 4, 12, '2026-04-02'),
 (10, 1, 3, 5, '2026-04-18');
-- query
SELECT c.name, c.city, COUNT(*) AS orders, SUM(o.qty * p.price) AS revenue
FROM orders o
JOIN customers c ON c.id = o.customer_id
JOIN products p ON p.id = o.product_id
GROUP BY c.id
HAVING revenue > 20000
ORDER BY revenue DESC;
```

**JOIN** склеивает строки разных таблиц по условию `ON`. `o`, `c`, `p` это короткие псевдонимы таблиц.

**GROUP BY** схлопывает строки с одинаковым ключом в одну, а **агрегатные функции** считают по группе: `COUNT(*)`, `SUM()`, `AVG()`, `MIN()`, `MAX()`.

**HAVING** это фильтр **после** группировки (по агрегатам). WHERE фильтрует строки **до** неё.

Это ровно то, что делает сводная таблица в Excel.

## Маржа по категориям

```sql
CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT, city TEXT, segment TEXT);
INSERT INTO customers VALUES
 (1, 'Завод Прогресс', 'Самара', 'завод'),
 (2, 'ООО Ремтех', 'Казань', 'ремонт'),
 (3, 'Агрохолдинг Нива', 'Самара', 'агро'),
 (4, 'ИП Котов', 'Москва', 'ремонт'),
 (5, 'Станкомаш', 'Москва', 'завод');
CREATE TABLE products (id INTEGER PRIMARY KEY, title TEXT, category TEXT, price REAL, cost REAL);
INSERT INTO products VALUES
 (1, 'Подшипник 6205', 'подшипники', 450, 270),
 (2, 'Подшипник 6310', 'подшипники', 1900, 1200),
 (3, 'Болт М12×60 (100 шт)', 'крепёж', 1600, 900),
 (4, 'Ремень SPA 1250', 'приводы', 1100, 600),
 (5, 'Муфта упругая МУВП-32', 'приводы', 5200, 3300);
CREATE TABLE orders (id INTEGER PRIMARY KEY, customer_id INTEGER, product_id INTEGER, qty INTEGER, order_date TEXT);
INSERT INTO orders VALUES
 (1, 1, 1, 40, '2026-01-15'),
 (2, 1, 5, 2, '2026-01-20'),
 (3, 2, 2, 10, '2026-02-03'),
 (4, 3, 4, 25, '2026-02-10'),
 (5, 3, 1, 60, '2026-03-01'),
 (6, 4, 3, 3, '2026-03-05'),
 (7, 5, 5, 6, '2026-03-12'),
 (8, 5, 2, 8, '2026-03-20'),
 (9, 2, 4, 12, '2026-04-02'),
 (10, 1, 3, 5, '2026-04-18');
-- query
SELECT p.category,
       SUM(o.qty * p.price) AS revenue,
       SUM(o.qty * (p.price - p.cost)) AS gross_profit,
       ROUND(100.0 * SUM(o.qty * (p.price - p.cost)) / SUM(o.qty * p.price), 1) AS margin_pct
FROM orders o JOIN products p ON p.id = o.product_id
GROUP BY p.category
ORDER BY gross_profit DESC;
```

Обрати внимание на `100.0`: в SQL деление целых чисел даёт целое (`7/2 = 3`), и проценты превратятся в ноль. Одно дробное число в выражении это лечит.

## Виды JOIN

- `INNER JOIN` (просто `JOIN`): только строки, у которых есть пара в обеих таблицах.
- `LEFT JOIN`: **все** строки левой таблицы, а где пары нет, справа будет `NULL`.
- `RIGHT JOIN` и `FULL JOIN`: зеркально и «всё со всех сторон».

Классическая задача: **кто из клиентов ничего не заказывал с апреля**. Обычный JOIN таких клиентов просто потеряет, LEFT JOIN покажет с нулём:

```sql
CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT, city TEXT, segment TEXT);
INSERT INTO customers VALUES
 (1, 'Завод Прогресс', 'Самара', 'завод'),
 (2, 'ООО Ремтех', 'Казань', 'ремонт'),
 (3, 'Агрохолдинг Нива', 'Самара', 'агро'),
 (4, 'ИП Котов', 'Москва', 'ремонт'),
 (5, 'Станкомаш', 'Москва', 'завод');
CREATE TABLE products (id INTEGER PRIMARY KEY, title TEXT, category TEXT, price REAL, cost REAL);
INSERT INTO products VALUES
 (1, 'Подшипник 6205', 'подшипники', 450, 270),
 (2, 'Подшипник 6310', 'подшипники', 1900, 1200),
 (3, 'Болт М12×60 (100 шт)', 'крепёж', 1600, 900),
 (4, 'Ремень SPA 1250', 'приводы', 1100, 600),
 (5, 'Муфта упругая МУВП-32', 'приводы', 5200, 3300);
CREATE TABLE orders (id INTEGER PRIMARY KEY, customer_id INTEGER, product_id INTEGER, qty INTEGER, order_date TEXT);
INSERT INTO orders VALUES
 (1, 1, 1, 40, '2026-01-15'),
 (2, 1, 5, 2, '2026-01-20'),
 (3, 2, 2, 10, '2026-02-03'),
 (4, 3, 4, 25, '2026-02-10'),
 (5, 3, 1, 60, '2026-03-01'),
 (6, 4, 3, 3, '2026-03-05'),
 (7, 5, 5, 6, '2026-03-12'),
 (8, 5, 2, 8, '2026-03-20'),
 (9, 2, 4, 12, '2026-04-02'),
 (10, 1, 3, 5, '2026-04-18');
-- query
SELECT c.name, COUNT(o.id) AS orders_since_april
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id AND o.order_date >= '2026-04-01'
GROUP BY c.id
ORDER BY orders_since_april;
```

Тонкость: условие по дате стоит в `ON`, а не в `WHERE`. Если перенести его в WHERE, строки с `NULL` отфильтруются, и LEFT JOIN превратится в обычный.

## CTE и оконные функции: динамика по месяцам

```sql
CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT, city TEXT, segment TEXT);
INSERT INTO customers VALUES
 (1, 'Завод Прогресс', 'Самара', 'завод'),
 (2, 'ООО Ремтех', 'Казань', 'ремонт'),
 (3, 'Агрохолдинг Нива', 'Самара', 'агро'),
 (4, 'ИП Котов', 'Москва', 'ремонт'),
 (5, 'Станкомаш', 'Москва', 'завод');
CREATE TABLE products (id INTEGER PRIMARY KEY, title TEXT, category TEXT, price REAL, cost REAL);
INSERT INTO products VALUES
 (1, 'Подшипник 6205', 'подшипники', 450, 270),
 (2, 'Подшипник 6310', 'подшипники', 1900, 1200),
 (3, 'Болт М12×60 (100 шт)', 'крепёж', 1600, 900),
 (4, 'Ремень SPA 1250', 'приводы', 1100, 600),
 (5, 'Муфта упругая МУВП-32', 'приводы', 5200, 3300);
CREATE TABLE orders (id INTEGER PRIMARY KEY, customer_id INTEGER, product_id INTEGER, qty INTEGER, order_date TEXT);
INSERT INTO orders VALUES
 (1, 1, 1, 40, '2026-01-15'),
 (2, 1, 5, 2, '2026-01-20'),
 (3, 2, 2, 10, '2026-02-03'),
 (4, 3, 4, 25, '2026-02-10'),
 (5, 3, 1, 60, '2026-03-01'),
 (6, 4, 3, 3, '2026-03-05'),
 (7, 5, 5, 6, '2026-03-12'),
 (8, 5, 2, 8, '2026-03-20'),
 (9, 2, 4, 12, '2026-04-02'),
 (10, 1, 3, 5, '2026-04-18');
-- query
WITH monthly AS (
  SELECT substr(o.order_date, 1, 7) AS month, SUM(o.qty * p.price) AS revenue
  FROM orders o JOIN products p ON p.id = o.product_id
  GROUP BY month
)
SELECT month, revenue,
       SUM(revenue) OVER (ORDER BY month) AS cumulative,
       ROUND(100.0 * (revenue - LAG(revenue) OVER (ORDER BY month)) / LAG(revenue) OVER (ORDER BY month), 1) AS growth_pct
FROM monthly;
```

**CTE** (`WITH имя AS (...)`) это именованный подзапрос: длинный запрос читается сверху вниз по шагам.

**Оконные функции** (`... OVER (...)`) считают по «окну» строк, **не схлопывая** их, в отличие от GROUP BY:
- `SUM(x) OVER (ORDER BY month)`: накопительный итог;
- `LAG(x)` / `LEAD(x)`: значение из предыдущей / следующей строки, для динамики месяц к месяцу;
- `ROW_NUMBER() OVER (PARTITION BY city ORDER BY revenue DESC)`: нумерация внутри группы, например топ-3 клиента в каждом городе;
- `AVG(x) OVER (ORDER BY month ROWS 2 PRECEDING)`: скользящее среднее за 3 месяца.

## Упражнения

Попробуй сам в любом блоке выше:
1. Средний чек по сегментам клиентов (`segment`).
2. Самый продаваемый товар в штуках.
3. Выручка по городам только за первый квартал.
4. Доля каждой категории в общей выручке (подсказка: `SUM(...) OVER ()`).

## Карточки

```cards
Порядок выполнения запроса :: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT
WHERE против HAVING :: WHERE фильтрует строки до группировки, HAVING группы после
LEFT JOIN :: все строки левой таблицы, NULL там, где нет пары
Почему 100.0, а не 100 :: деление целых в SQL целочисленное
CTE :: именованный подзапрос WITH ... AS (...)
Оконная функция :: считает по окну строк, не схлопывая их
LAG :: значение из предыдущей строки окна
Накопительный итог :: SUM(x) OVER (ORDER BY ...)
```

## Проверь себя

```quiz
? Нужны все товары, включая те, что ни разу не продавались. Какой JOIN от products к orders?
- INNER JOIN
+ LEFT JOIN
- никакой, хватит WHERE

? Почему запрос `SELECT city, SUM(qty) AS s FROM ... WHERE s > 10 GROUP BY city` не работает?
+ WHERE выполняется до группировки и не видит s, нужен HAVING
- нельзя использовать SUM с GROUP BY
- city надо писать в кавычках

? Что вернёт ROW_NUMBER() OVER (PARTITION BY city ORDER BY revenue DESC)?
- общую выручку города
+ место клиента по выручке внутри своего города
- число клиентов в городе
```
