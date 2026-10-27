import "server-only";
import { cacheLife } from "next/cache";
import { asc, eq, gt, isNull, or } from "drizzle-orm";
import { db } from "@/db";
import { deadlines, ownerSettings, timetable } from "@/db/schema";
import type { DashboardData, DashboardSettings, Rates, Weather } from "@/lib/dashboard-shared";

// The owner's personal dashboard: weather (Open-Meteo, no key needed), exchange rates (the
// Central Bank of Russia's daily rates via cbr-xml-daily.ru) and the owner's own deadlines and
// timetable from the database. Outside data is cached on the server, so a page view doesn't hit
// the APIs; when an API is down the widget just says "no data" instead of breaking the page.

export const DEFAULT_SETTINGS: DashboardSettings = {
  city: "Будапешт",
  lat: 47.4979,
  lon: 19.0402,
  timezone: "Europe/Budapest",
  // BME autumn semester 2026; odd/even weeks of the timetable are counted from here.
  semesterStart: "2026-09-07",
};

export async function getSettings(): Promise<DashboardSettings> {
  const [row] = await db.select().from(ownerSettings).where(eq(ownerSettings.key, "dashboard")).limit(1);
  return { ...DEFAULT_SETTINGS, ...((row?.value as Partial<DashboardSettings>) ?? {}) };
}

export async function saveSettings(patch: Partial<DashboardSettings>) {
  const value = { ...(await getSettings()), ...patch };
  await db
    .insert(ownerSettings)
    .values({ key: "dashboard", value })
    .onConflictDoUpdate({ target: ownerSettings.key, set: { value, updatedAt: new Date() } });
  return value;
}

async function getJson(url: string) {
  const res = await fetch(url, { signal: AbortSignal.timeout(5000), headers: { accept: "application/json" } });
  if (!res.ok) throw new Error(`${url}: ${res.status}`);
  return res.json();
}

// API failures are caught inside the cached functions, so a "no data" answer is cached only
// for a minute. Nothing outside may catch their rejections: when Next abandons a prerender pass it
// rejects pending "use cache" calls on purpose, and React handles that silently.

async function fetchWeather(lat: number, lon: number): Promise<Weather | null> {
  "use cache";
  try {
    const weather = await loadWeather(lat, lon);
    cacheLife({ stale: 300, revalidate: 900, expire: 3600 });
    return weather;
  } catch (err) {
    console.error("dashboard: weather", err);
    cacheLife("minutes");
    return null;
  }
}

async function fetchRates(): Promise<Rates | null> {
  "use cache";
  try {
    const rates = await loadRates();
    cacheLife("hours");
    return rates;
  } catch (err) {
    console.error("dashboard: rates", err);
    cacheLife("minutes");
    return null;
  }
}

async function loadWeather(lat: number, lon: number): Promise<Weather> {
  const q = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current: "temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,is_day",
    daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max",
    timezone: "auto",
    forecast_days: "4",
    wind_speed_unit: "ms",
  });
  const j = await getJson(`https://api.open-meteo.com/v1/forecast?${q}`);
  return {
    temp: j.current.temperature_2m,
    feels: j.current.apparent_temperature,
    humidity: j.current.relative_humidity_2m,
    wind: j.current.wind_speed_10m,
    code: j.current.weather_code,
    isDay: j.current.is_day === 1,
    // Today is already shown big, so the strip starts tomorrow.
    days: (j.daily.time as string[]).slice(1).map((date, i) => ({
      date,
      code: j.daily.weather_code[i + 1],
      max: j.daily.temperature_2m_max[i + 1],
      min: j.daily.temperature_2m_min[i + 1],
      rain: j.daily.precipitation_probability_max?.[i + 1] ?? null,
    })),
  };
}

async function loadRates(): Promise<Rates> {
  const j = await getJson("https://www.cbr-xml-daily.ru/daily_json.js");
  return {
    date: j.Date,
    items: ["USD", "EUR", "CNY"].flatMap((code) => {
      const v = j.Valute?.[code];
      return v ? [{ code, value: v.Value / v.Nominal, previous: v.Previous / v.Nominal }] : [];
    }),
  };
}

/** Finds a city by name with Open-Meteo's geocoder. */
export async function geocode(name: string, locale: string) {
  const q = new URLSearchParams({ name, count: "1", language: locale, format: "json" });
  const j = await getJson(`https://geocoding-api.open-meteo.com/v1/search?${q}`);
  const hit = j.results?.[0];
  if (!hit) return null;
  return { city: String(hit.name), lat: Number(hit.latitude), lon: Number(hit.longitude), timezone: String(hit.timezone) };
}

export async function loadDashboard(): Promise<DashboardData> {
  const settings = await getSettings();
  const weekAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000);
  const [deadlineRows, classes, weather, rates] = await Promise.all([
    db
      .select()
      .from(deadlines)
      .where(or(isNull(deadlines.doneAt), gt(deadlines.doneAt, weekAgo)))
      .orderBy(asc(deadlines.dueAt)),
    db.select().from(timetable).orderBy(asc(timetable.weekday), asc(timetable.starts)),
    fetchWeather(settings.lat, settings.lon),
    fetchRates(),
  ]);
  return {
    settings,
    weather,
    rates,
    classes,
    deadlines: deadlineRows.map((d) => ({
      id: d.id,
      title: d.title,
      note: d.note,
      dueAt: d.dueAt.toISOString(),
      done: d.doneAt !== null,
    })),
  };
}
