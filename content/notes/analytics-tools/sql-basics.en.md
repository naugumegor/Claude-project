---
title: "SQL for analysts: SELECT, JOIN, GROUP BY and window functions"
excerpt: Database queries from scratch. Selecting and filtering, sorting, joins, grouping and aggregates, HAVING, subqueries and CTEs, window functions for running totals and growth. Every query can be edited and run on the page.
---

## Why SQL

Company data lives in databases; SQL asks the questions. Tables hold rows (records) and columns (fields), linked by keys: `orders.customer_id` → `customers.id`. Our sample shop has `customers`, `products` (price, cost) and `orders` (qty, order_date).

## SELECT and WHERE

```sql
CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT, city TEXT, segment TEXT);
INSERT INTO customers VALUES
 (1, 'Progress Plant', 'Samara', 'plant'),
 (2, 'Remtech Ltd', 'Kazan', 'repair'),
 (3, 'Niva Agro', 'Samara', 'agro'),
 (4, 'Kotov Repairs', 'Moscow', 'repair'),
 (5, 'Stankomash', 'Moscow', 'plant');
CREATE TABLE products (id INTEGER PRIMARY KEY, title TEXT, category TEXT, price REAL, cost REAL);
INSERT INTO products VALUES
 (1, 'Bearing 6205', 'bearings', 450, 270),
 (2, 'Bearing 6310', 'bearings', 1900, 1200),
 (3, 'Bolt M12x60 (100 pcs)', 'fasteners', 1600, 900),
 (4, 'Belt SPA 1250', 'drives', 1100, 600),
 (5, 'Flexible coupling 32', 'drives', 5200, 3300);
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
WHERE category = 'bearings' OR price > 2000
ORDER BY price DESC;
```

Written order: SELECT, FROM, WHERE, GROUP BY, HAVING, ORDER BY, LIMIT. Executed order: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT.

## JOIN and GROUP BY

```sql
CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT, city TEXT, segment TEXT);
INSERT INTO customers VALUES
 (1, 'Progress Plant', 'Samara', 'plant'),
 (2, 'Remtech Ltd', 'Kazan', 'repair'),
 (3, 'Niva Agro', 'Samara', 'agro'),
 (4, 'Kotov Repairs', 'Moscow', 'repair'),
 (5, 'Stankomash', 'Moscow', 'plant');
CREATE TABLE products (id INTEGER PRIMARY KEY, title TEXT, category TEXT, price REAL, cost REAL);
INSERT INTO products VALUES
 (1, 'Bearing 6205', 'bearings', 450, 270),
 (2, 'Bearing 6310', 'bearings', 1900, 1200),
 (3, 'Bolt M12x60 (100 pcs)', 'fasteners', 1600, 900),
 (4, 'Belt SPA 1250', 'drives', 1100, 600),
 (5, 'Flexible coupling 32', 'drives', 5200, 3300);
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

HAVING filters groups, WHERE filters rows. `LEFT JOIN` keeps every left row with NULLs where there is no match; put conditions on the right table in `ON`, not `WHERE`. Use `100.0` to avoid integer division.

## CTEs and window functions

```sql
CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT, city TEXT, segment TEXT);
INSERT INTO customers VALUES
 (1, 'Progress Plant', 'Samara', 'plant'),
 (2, 'Remtech Ltd', 'Kazan', 'repair'),
 (3, 'Niva Agro', 'Samara', 'agro'),
 (4, 'Kotov Repairs', 'Moscow', 'repair'),
 (5, 'Stankomash', 'Moscow', 'plant');
CREATE TABLE products (id INTEGER PRIMARY KEY, title TEXT, category TEXT, price REAL, cost REAL);
INSERT INTO products VALUES
 (1, 'Bearing 6205', 'bearings', 450, 270),
 (2, 'Bearing 6310', 'bearings', 1900, 1200),
 (3, 'Bolt M12x60 (100 pcs)', 'fasteners', 1600, 900),
 (4, 'Belt SPA 1250', 'drives', 1100, 600),
 (5, 'Flexible coupling 32', 'drives', 5200, 3300);
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

Window functions compute over rows without collapsing them: running totals, `LAG`/`LEAD`, `ROW_NUMBER() OVER (PARTITION BY …)`, moving averages.

## Flashcards

```cards
Execution order :: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY
WHERE vs HAVING :: rows before grouping vs groups after
LEFT JOIN :: all left rows, NULL where unmatched
Running total :: SUM(x) OVER (ORDER BY …)
LAG :: value from the previous row
```
