import type { Locale } from "./i18n";
import type { CaseItem, GanttSource, ProcessSource } from "./business-blocks";

// Example data for the /tools page: one of each business block, ready to play with.

export const SAMPLE_SQL_SETUP = `
CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT, city TEXT, joined DATE);
CREATE TABLE products (id INTEGER PRIMARY KEY, title TEXT, category TEXT, price REAL);
CREATE TABLE orders (id INTEGER PRIMARY KEY, customer_id INTEGER, product_id INTEGER, qty INTEGER, day DATE);
INSERT INTO customers VALUES
  (1,'Анна','Москва','2026-01-14'),(2,'Борис','Казань','2026-02-03'),(3,'Вера','Москва','2026-02-20'),
  (4,'Глеб','Пермь','2026-03-09'),(5,'Дина','Казань','2026-04-01'),(6,'Егор','Москва','2026-05-17');
INSERT INTO products VALUES
  (1,'Подшипник 6204','Детали',320),(2,'Штангенциркуль','Инструмент',1450),(3,'Курс «Сопромат»','Обучение',4900),
  (4,'Набор свёрл','Инструмент',890),(5,'Вал Ø25 h6','Детали',2100);
INSERT INTO orders VALUES
  (1,1,2,1,'2026-03-01'),(2,1,1,10,'2026-03-01'),(3,2,3,1,'2026-03-12'),(4,3,4,2,'2026-04-02'),
  (5,4,5,3,'2026-04-15'),(6,5,1,25,'2026-05-03'),(7,2,2,1,'2026-05-20'),(8,6,3,1,'2026-06-01'),
  (9,3,5,1,'2026-06-11'),(10,1,3,1,'2026-07-08'),(11,5,4,1,'2026-07-19'),(12,6,1,4,'2026-08-02');
`.trim();

export const SAMPLE_SQL_QUERY = `-- Выручка по категориям / revenue by category
SELECT p.category,
       COUNT(*)              AS orders,
       SUM(o.qty * p.price)  AS revenue
FROM orders o
JOIN products p ON p.id = o.product_id
GROUP BY p.category
ORDER BY revenue DESC;`;

export const SAMPLE_GANTT: Record<Locale, GanttSource> = {
  ru: {
    title: "Запуск интернет-магазина",
    start: "2026-11-02",
    tasks: [
      { name: "Исследование рынка", start: "1", days: 5, done: 100 },
      { name: "Каталог и цены", start: "после 1", days: 6, done: 60 },
      { name: "Дизайн витрины", start: "после 1", days: 8, done: 30 },
      { name: "Оплата и доставка", start: "после 2", days: 5, done: 0 },
      { name: "Тестирование", start: "после 3,4", days: 4, done: 0 },
      { name: "Запуск рекламы", start: "после 5", days: 3, done: 0 },
    ],
  },
  en: {
    title: "Online store launch",
    start: "2026-11-02",
    tasks: [
      { name: "Market research", start: "1", days: 5, done: 100 },
      { name: "Catalogue and prices", start: "after 1", days: 6, done: 60 },
      { name: "Storefront design", start: "after 1", days: 8, done: 30 },
      { name: "Payments and delivery", start: "after 2", days: 5, done: 0 },
      { name: "Testing", start: "after 3,4", days: 4, done: 0 },
      { name: "Ad campaign", start: "after 5", days: 3, done: 0 },
    ],
  },
};

export const SAMPLE_FUNNEL: Record<Locale, ProcessSource> = {
  ru: {
    type: "funnel",
    title: "Воронка продаж интернет-магазина",
    steps: [
      { title: "Визиты", metric: "12 000", value: 12000, description: "Все, кто зашёл на сайт за месяц: реклама, поиск, соцсети.", link: "" },
      { title: "Карточка товара", metric: "4 800", value: 4800, description: "Посетитель нашёл товар и открыл его страницу. Тут решают фото, цена и отзывы.", link: "" },
      { title: "Корзина", metric: "960", value: 960, description: "Положили в корзину. Низкая конверсия здесь часто значит неясную доставку или цену.", link: "" },
      { title: "Оформление", metric: "430", value: 430, description: "Начали оформление. Лишние поля и обязательная регистрация режут этот шаг.", link: "" },
      { title: "Оплата", metric: "310", value: 310, description: "Заплатили. Выручка = 310 × средний чек.", link: "" },
    ],
  },
  en: {
    type: "funnel",
    title: "Online store sales funnel",
    steps: [
      { title: "Visits", metric: "12,000", value: 12000, description: "Everyone who came to the site this month: ads, search, social.", link: "" },
      { title: "Product page", metric: "4,800", value: 4800, description: "Found a product and opened its page. Photos, price and reviews decide here.", link: "" },
      { title: "Cart", metric: "960", value: 960, description: "Added to cart. Low conversion here often means unclear delivery or price.", link: "" },
      { title: "Checkout", metric: "430", value: 430, description: "Started checkout. Extra fields and forced sign-up hurt this step.", link: "" },
      { title: "Payment", metric: "310", value: 310, description: "Paid. Revenue = 310 × average order value.", link: "" },
    ],
  },
};

export const SAMPLE_FLOW: Record<Locale, ProcessSource> = {
  ru: {
    type: "flow",
    title: "От заказа до денег (order-to-cash)",
    steps: [
      { title: "Заказ", metric: "CRM", description: "Клиент оформляет заказ, менеджер проверяет наличие и условия.", value: NaN, link: "" },
      { title: "Счёт", metric: "1С", description: "Выставляем счёт; для юрлиц — с отсрочкой платежа.", value: NaN, link: "" },
      { title: "Отгрузка", metric: "склад", description: "Комплектация, упаковка, передача в доставку. Здесь же списание со склада.", value: NaN, link: "" },
      { title: "Оплата", metric: "банк", description: "Поступление денег и сверка с счётом. Дебиторка — всё, что ещё не пришло.", value: NaN, link: "" },
      { title: "Закрытие", metric: "отчёт", description: "Закрывающие документы, выручка в отчётности, обратная связь от клиента.", value: NaN, link: "" },
    ],
  },
  en: {
    type: "flow",
    title: "Order to cash",
    steps: [
      { title: "Order", metric: "CRM", description: "The customer places an order; a manager checks stock and terms.", value: NaN, link: "" },
      { title: "Invoice", metric: "ERP", description: "We issue the invoice; business customers may pay later.", value: NaN, link: "" },
      { title: "Shipping", metric: "warehouse", description: "Picking, packing and handing over to delivery. Stock is written off here.", value: NaN, link: "" },
      { title: "Payment", metric: "bank", description: "Money arrives and is matched to the invoice. Receivables are what hasn't come yet.", value: NaN, link: "" },
      { title: "Close", metric: "report", description: "Closing documents, revenue in the books, customer feedback.", value: NaN, link: "" },
    ],
  },
};

export const SAMPLE_CASES: Record<Locale, CaseItem[]> = {
  ru: [
    {
      id: "c1",
      situation: "Продажи упали на 20 % за квартал. Конкурент снизил цену на 15 %. Ваша маржа 35 %. Что делаете первым делом?",
      options: [
        { text: "Сразу снижаю цену на 15 %", verdict: "bad", why: "Маржа упадёт с 35 % до ~24 %: чтобы сохранить прибыль, продажи в штуках должны вырасти в 1,75 раза (маржа с единицы 0,35 → 0,20)." },
        { text: "Выясняю, почему ушли клиенты: цена или что-то ещё", verdict: "good", why: "Сначала диагноз. Падение могло совпасть с уходом менеджера, сезоном или проблемами качества." },
        { text: "Запускаю акцию «2 по цене 1» на месяц", verdict: "partial", why: "Вернёт часть трафика, но это та же скидка в 50 % и приучает ждать акций." },
      ],
    },
    {
      id: "c2",
      situation: "LTV клиента 9 000 ₽, CAC 6 000 ₽, отток 8 % в месяц. Инвестор предлагает удвоить рекламный бюджет.",
      options: [
        { text: "Удваиваю: каждый клиент окупается", verdict: "partial", why: "LTV/CAC = 1,5 — тонкий запас. При росте бюджета CAC обычно растёт, и экономика уйдёт в минус." },
        { text: "Сначала снижаю отток, потом масштабирую рекламу", verdict: "good", why: "Отток 8 % → 5 % поднимет LTV на 60 %. Масштабировать стоит при LTV/CAC ≥ 3." },
        { text: "Отказываюсь от рекламы совсем", verdict: "bad", why: "Без привлечения нет роста; задача — сделать его выгодным, а не остановить." },
      ],
    },
    {
      id: "c3",
      situation: "Проект: вложения 1 млн ₽, NPV при ставке 12 % = +40 тыс. ₽, IRR = 13,5 %. Ставка по кредиту может вырасти до 15 %.",
      options: [
        { text: "Запускаю: NPV положительный", verdict: "partial", why: "Сейчас да, но IRR 13,5 % ниже возможной ставки 15 % — при росте ставки NPV станет отрицательным." },
        { text: "Считаю сценарии и ищу, как поднять IRR или зафиксировать ставку", verdict: "good", why: "Запас между IRR и стоимостью капитала всего 1,5 п.п. — нужна чувствительность и защита от риска ставки." },
        { text: "Отклоняю любой проект с IRR ниже 20 %", verdict: "bad", why: "Произвольный порог отсекает проекты, которые создают стоимость. Сравнивать надо с WACC." },
      ],
    },
  ],
  en: [
    {
      id: "c1",
      situation: "Sales fell 20 % this quarter. A competitor cut prices by 15 %. Your margin is 35 %. What do you do first?",
      options: [
        { text: "Cut my price by 15 % right away", verdict: "bad", why: "Margin drops from 35 % to ~24 %: unit sales must grow 1.75× just to keep profit (unit margin 0.35 → 0.20)." },
        { text: "Find out why customers left: price or something else", verdict: "good", why: "Diagnose first. The drop may come from a lost salesperson, the season or quality issues." },
        { text: "Run a buy-one-get-one promo for a month", verdict: "partial", why: "It brings some traffic back, but it is a 50 % discount and teaches customers to wait for deals." },
      ],
    },
    {
      id: "c2",
      situation: "Customer LTV is 9,000, CAC is 6,000, churn is 8 % a month. An investor suggests doubling the ad budget.",
      options: [
        { text: "Double it: every customer pays back", verdict: "partial", why: "LTV/CAC = 1.5 is a thin margin. CAC usually rises with spend and the economics turn negative." },
        { text: "Cut churn first, then scale ads", verdict: "good", why: "Churn from 8 % to 5 % raises LTV by 60 %. Scale when LTV/CAC ≥ 3." },
        { text: "Stop advertising altogether", verdict: "bad", why: "No acquisition, no growth; the job is to make it profitable, not to stop it." },
      ],
    },
    {
      id: "c3",
      situation: "A project: 1 M investment, NPV at 12 % = +40 k, IRR = 13.5 %. The loan rate may rise to 15 %.",
      options: [
        { text: "Go: NPV is positive", verdict: "partial", why: "For now, but the 13.5 % IRR is below a possible 15 % rate, so NPV would turn negative." },
        { text: "Run scenarios and look for ways to raise IRR or fix the rate", verdict: "good", why: "Only 1.5 pp between IRR and the cost of capital: you need sensitivity analysis and rate protection." },
        { text: "Reject any project with IRR under 20 %", verdict: "bad", why: "An arbitrary hurdle rejects projects that create value. Compare with WACC." },
      ],
    },
  ],
};

/** Excel / Google Sheets functions worth knowing, with Russian and English names. */
export const EXCEL_FUNCTIONS: {
  ru: string;
  en: string;
  syntax: string;
  what: Record<Locale, string>;
  example: string;
  /** Shown only for examples whose result doesn't depend on a sheet. */
  result: string;
}[] = [
  { ru: "СУММЕСЛИ", en: "SUMIF", syntax: "SUMIF(range; criteria; [sum_range])", what: { ru: "Сумма по условию", en: "Sum by condition" }, example: '=SUMIF(B2:B13;"Москва";D2:D13)', result: "" },
  { ru: "СЧЁТЕСЛИМН", en: "COUNTIFS", syntax: "COUNTIFS(range1; crit1; range2; crit2…)", what: { ru: "Количество строк по нескольким условиям", en: "Count rows by several conditions" }, example: '=COUNTIFS(B:B;"Казань";C:C;">1000")', result: "" },
  { ru: "ВПР", en: "VLOOKUP", syntax: "VLOOKUP(value; table; col; FALSE)", what: { ru: "Найти значение в первом столбце и вернуть из соседнего", en: "Find in the first column, return from another" }, example: "=VLOOKUP(5;A2:D6;4;FALSE)", result: "" },
  { ru: "ПРОСМОТРX", en: "XLOOKUP", syntax: "XLOOKUP(value; lookup; return; [if_not_found])", what: { ru: "Современная замена ВПР: в любую сторону, с запасным значением", en: "Modern VLOOKUP: any direction, with a fallback" }, example: '=XLOOKUP("Вал*";B:B;D:D;"нет";2)', result: "" },
  { ru: "ИНДЕКС + ПОИСКПОЗ", en: "INDEX + MATCH", syntax: "INDEX(return; MATCH(value; lookup; 0))", what: { ru: "Поиск, который не ломается при вставке столбцов", en: "Lookup that survives inserted columns" }, example: '=INDEX(D:D;MATCH("Набор свёрл";B:B;0))', result: "" },
  { ru: "ЕСЛИ / ЕСЛИМН", en: "IF / IFS", syntax: "IFS(cond1; value1; cond2; value2…)", what: { ru: "Ветвление по условиям", en: "Branch on conditions" }, example: '=IFS(E2>=3;"ок";E2>=1;"риск";TRUE;"минус")', result: "" },
  { ru: "СУММПРОИЗВ", en: "SUMPRODUCT", syntax: "SUMPRODUCT(array1; array2)", what: { ru: "Сумма попарных произведений: выручка = Σ цена × кол-во", en: "Sum of products: revenue = Σ price × qty" }, example: "=SUMPRODUCT(C2:C13;D2:D13)", result: "" },
  { ru: "ЧПС", en: "NPV", syntax: "NPV(rate; CF1; CF2…) + CF0", what: { ru: "Чистая приведённая стоимость (CF0 добавляется отдельно!)", en: "Net present value (add CF0 separately!)" }, example: "=NPV(12%;300;400;500;200)-1000", result: "69,73" },
  { ru: "ВСД", en: "IRR", syntax: "IRR(values)", what: { ru: "Внутренняя норма доходности", en: "Internal rate of return" }, example: "=IRR({-1000;300;400;500;200})", result: "15,3 %" },
  { ru: "ПЛТ", en: "PMT", syntax: "PMT(rate; nper; pv)", what: { ru: "Платёж по кредиту (аннуитет)", en: "Loan payment (annuity)" }, example: "=PMT(1%;12;-1000)", result: "88,85" },
  { ru: "СВОДНАЯ ТАБЛИЦА", en: "PIVOT TABLE", syntax: "Insert → PivotTable", what: { ru: "Группировка и суммы без формул, аналог GROUP BY", en: "Grouping and totals without formulas, like GROUP BY" }, example: "Rows: category · Values: SUM(revenue)", result: "" },
  { ru: "ТЕКСТ", en: "TEXT", syntax: 'TEXT(value; "format")', what: { ru: "Число или дату в текст по формату", en: "Number or date to text with a format" }, example: '=TEXT(A2;"ДД.ММ.ГГГГ")', result: "" },
];
