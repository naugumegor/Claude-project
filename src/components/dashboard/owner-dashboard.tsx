"use client";

import { useState, useSyncExternalStore, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Banknote,
  CalendarClock,
  Check,
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudMoon,
  CloudRain,
  CloudRainWind,
  CloudSnow,
  CloudSun,
  Droplets,
  GraduationCap,
  Loader2,
  MapPin,
  Moon,
  Plus,
  Settings2,
  Sun,
  Trash2,
  TrendingDown,
  TrendingUp,
  Wind,
  type LucideIcon,
} from "lucide-react";
import type { Dictionary } from "@/dictionaries";
import type { Locale } from "@/lib/i18n";
import { classesOn, semesterWeek, toMinutes, zonedParts, type ClassRow, type DashboardData } from "@/lib/dashboard-shared";
import { addDeadline, deleteDeadline, setCity, setDeadlineDone } from "@/app/[lang]/admin/dashboard-actions";

type Labels = Dictionary["dashboard"];

// The clock ticks every 10 s. On the server (and during hydration) it's 0, so everything that
// depends on the current time renders only in the browser, in the owner's own time zone.
const TICK = 10_000;
const subscribe = (cb: () => void) => {
  const t = setInterval(cb, TICK);
  return () => clearInterval(t);
};
const useNow = () =>
  useSyncExternalStore(
    subscribe,
    () => Math.floor(Date.now() / TICK) * TICK,
    () => 0,
  );

const browserZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;
const fill = (s: string, key: string, value: string | number) => s.replace(`{${key}}`, String(value));

/** "3 дн", "5 ч 20 мин", "12 мин". */
function span(ms: number, u: Labels["units"]) {
  const min = Math.max(1, Math.round(Math.abs(ms) / 60_000));
  if (min < 60) return `${min} ${u.m}`;
  const h = Math.floor(min / 60);
  if (h < 48) return min % 60 && h < 10 ? `${h} ${u.h} ${min % 60} ${u.m}` : `${h} ${u.h}`;
  return `${Math.round(h / 24)} ${u.d}`;
}

const weatherKinds: [number[], keyof Labels["codes"], LucideIcon, LucideIcon?][] = [
  [[0], "clear", Sun, Moon],
  [[1, 2], "partly", CloudSun, CloudMoon],
  [[3], "cloudy", Cloud],
  [[45, 48], "fog", CloudFog],
  [[51, 53, 55, 56, 57], "drizzle", CloudDrizzle],
  [[61, 63, 65, 66, 67], "rain", CloudRain],
  [[71, 73, 75, 77, 85, 86], "snow", CloudSnow],
  [[80, 81, 82], "showers", CloudRainWind],
  [[95, 96, 99], "storm", CloudLightning],
];
function weatherOf(code: number, isDay = true) {
  const [, key, day, night] = weatherKinds.find(([codes]) => codes.includes(code)) ?? weatherKinds[2];
  return { key, Icon: !isDay && night ? night : day };
}

const CARD = "min-w-0 rounded-2xl border border-line bg-surface p-5";
const HEAD = "mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted";

export function OwnerDashboard({ data, labels, locale, name }: { data: DashboardData; labels: Labels; locale: Locale; name: string }) {
  const now = useNow();
  const zone = now ? browserZone() : "UTC";
  const today = now ? zonedParts(new Date(now), zone) : null;
  const hour = today ? Math.floor(today.minutes / 60) : 12;
  const hello = labels.hello[hour < 5 ? "night" : hour < 12 ? "morning" : hour < 18 ? "day" : "evening"];
  const week = today ? semesterWeek(today.day, data.settings.semesterStart) : null;

  return (
    <section className="mx-auto max-w-6xl px-4 pt-10 sm:px-6">
      <div className="rounded-3xl border border-line bg-surface-2/60 p-4 sm:p-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-accent">
              {labels.title} · {labels.only}
            </p>
            <h2 className="mt-1 font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
              {hello}, {name}
              <span className="text-accent">.</span>
            </h2>
          </div>
          <div className="sm:text-right">
            <p className="font-display text-3xl font-bold tabular-nums" suppressHydrationWarning>
              {now ? new Date(now).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" }) : "--:--"}
            </p>
            <p className="text-sm text-muted">
              {now ? new Date(now).toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long" }) : " "}
              {week !== null && week > 0 && (
                <>
                  {" · "}
                  {fill(labels.week, "n", week)}, {week % 2 ? labels.odd : labels.even}
                </>
              )}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <WeatherCard data={data} labels={labels} locale={locale} className="lg:col-span-4" />
          <RatesCard data={data} labels={labels} locale={locale} className="lg:col-span-3" />
          <ClassesCard classes={data.classes} today={today} week={week} labels={labels} locale={locale} className="lg:col-span-5" />
          <DeadlinesCard data={data} now={now} labels={labels} locale={locale} className="lg:col-span-12" />
        </div>
      </div>
    </section>
  );
}

function WeatherCard({ data, labels, locale, className }: { data: DashboardData; labels: Labels; locale: Locale; className: string }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [city, setCityValue] = useState("");
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  const w = data.weather;
  const current = w && weatherOf(w.code, w.isDay);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    start(async () => {
      const res = await setCity(city, locale);
      if (!res.ok) return setError(labels.cityNotFound);
      setEditing(false);
      setError("");
      router.refresh();
    });
  };

  return (
    <div className={`${CARD} group relative overflow-hidden ${className}`}>
      <span className="pointer-events-none absolute -right-10 -top-10 size-36 rounded-full bg-ochre-soft opacity-70 transition-transform duration-700 group-hover:scale-125" />
      <div className={`${HEAD} relative`}>
        <MapPin size={15} className="text-ochre" />
        <span className="truncate normal-case tracking-normal text-ink">{data.settings.city}</span>
        <button
          type="button"
          onClick={() => setEditing((v) => !v)}
          title={labels.changeCity}
          className="ml-auto rounded-lg p-1 text-muted transition-colors hover:bg-surface hover:text-ink"
        >
          <Settings2 size={15} />
        </button>
      </div>
      {editing && (
        <form onSubmit={submit} className="relative mb-3 flex gap-2">
          <input
            autoFocus
            value={city}
            onChange={(e) => setCityValue(e.target.value)}
            placeholder={labels.cityPlaceholder}
            className="min-w-0 flex-1 rounded-xl border border-line bg-surface px-3 py-1.5 text-sm outline-none focus:border-accent"
          />
          <button className="rounded-xl bg-ink px-3 text-sm font-medium text-bg" disabled={pending}>
            {pending ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
          </button>
        </form>
      )}
      {error && <p className="relative mb-2 text-xs text-rose">{error}</p>}
      {w && current ? (
        <div className="relative">
          <div className="flex items-center gap-4">
            <current.Icon size={52} strokeWidth={1.5} className="animate-[float_5s_ease-in-out_infinite] text-ochre" />
            <div>
              <p className="font-display text-4xl font-extrabold tabular-nums">{Math.round(w.temp)}°</p>
              <p className="text-sm text-muted">
                {labels.codes[current.key]}, {labels.feels} {Math.round(w.feels)}°
              </p>
            </div>
          </div>
          <div className="mt-3 flex gap-4 text-xs text-muted">
            <span className="flex items-center gap-1">
              <Wind size={13} /> {w.wind.toFixed(1)} {labels.wind}
            </span>
            <span className="flex items-center gap-1">
              <Droplets size={13} /> {labels.humidity} {w.humidity}%
            </span>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {w.days.map((d) => {
              const { key, Icon } = weatherOf(d.code);
              return (
                <div key={d.date} title={labels.codes[key]} className="rounded-xl bg-surface-2/70 px-2 py-2 text-center">
                  <p className="text-xs capitalize text-muted">
                    {new Date(`${d.date}T12:00:00`).toLocaleDateString(locale, { weekday: "short" })}
                  </p>
                  <Icon size={20} className="mx-auto my-1 text-muted" />
                  <p className="text-xs font-semibold tabular-nums">
                    {Math.round(d.max)}° <span className="font-normal text-muted">{Math.round(d.min)}°</span>
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <p className="relative text-sm text-muted">{labels.noData}</p>
      )}
    </div>
  );
}

function RatesCard({ data, labels, locale, className }: { data: DashboardData; labels: Labels; locale: Locale; className: string }) {
  const r = data.rates;
  const fmt = new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return (
    <div className={`${CARD} ${className}`}>
      <div className={HEAD}>
        <Banknote size={15} className="text-accent" />
        {labels.rates}
      </div>
      {r ? (
        <>
          <ul className="grid grid-cols-1 gap-2">
            {r.items.map((c) => {
              const diff = c.value - c.previous;
              const up = diff >= 0;
              const Trend = up ? TrendingUp : TrendingDown;
              return (
                <li key={c.code} className="group flex items-center gap-3 rounded-xl px-2 py-1.5 transition-colors hover:bg-surface-2/70">
                  <span className="w-10 font-display text-sm font-bold text-muted">{c.code}</span>
                  <span className="flex-1 font-display text-xl font-bold tabular-nums">{fmt.format(c.value)} ₽</span>
                  <span className={`flex items-center gap-1 text-xs tabular-nums ${up ? "text-rose" : "text-accent"}`}>
                    <Trend size={14} className="transition-transform group-hover:scale-125" />
                    {up ? "+" : "−"}
                    {fmt.format(Math.abs(diff))}
                  </span>
                </li>
              );
            })}
          </ul>
          <p className="mt-3 text-xs text-muted">
            {fill(labels.ratesOn, "date", new Date(r.date).toLocaleDateString(locale, { day: "numeric", month: "long" }))}
          </p>
        </>
      ) : (
        <p className="text-sm text-muted">{labels.noData}</p>
      )}
    </div>
  );
}

const kindTone: Record<ClassRow["kind"], string> = {
  lecture: "bg-accent-soft text-accent",
  practice: "bg-ochre-soft text-ochre",
  lab: "bg-plum-soft text-plum",
  other: "bg-rose-soft text-rose",
};

function ClassesCard({
  classes,
  today,
  week,
  labels,
  locale,
  className,
}: {
  classes: ClassRow[];
  today: ReturnType<typeof zonedParts> | null;
  week: number | null;
  labels: Labels;
  locale: Locale;
  className: string;
}) {
  const todays = today && week !== null ? classesOn(classes, today.weekday, week) : [];
  const over = today !== null && todays.length > 0 && todays.every((c) => toMinutes(c.ends) <= today.minutes);
  // After the last class (or on a free day) the card looks ahead to tomorrow.
  const tomorrowDay = today ? (today.weekday % 7) + 1 : 1;
  const tomorrowWeek = week !== null && today?.weekday === 7 ? week + 1 : week;
  const tomorrow = today && tomorrowWeek !== null && (over || todays.length === 0) ? classesOn(classes, tomorrowDay, tomorrowWeek) : [];

  return (
    <div className={`${CARD} ${className}`}>
      <div className={HEAD}>
        <GraduationCap size={15} className="text-plum" />
        {labels.today}
        <Link
          href={`/${locale}/admin/schedule`}
          className="ml-auto rounded-lg px-2 py-0.5 text-xs normal-case tracking-normal text-muted transition-colors hover:bg-surface-2 hover:text-ink"
        >
          {labels.editSchedule} →
        </Link>
      </div>
      {!today ? (
        <div className="h-24 animate-pulse rounded-xl bg-surface-2/70" />
      ) : todays.length === 0 ? (
        <p className="text-sm text-muted">{labels.noClasses}</p>
      ) : (
        <ol className="grid grid-cols-1 gap-2">
          {todays.map((c) => {
            const s = toMinutes(c.starts);
            const e = toMinutes(c.ends);
            const live = today.minutes >= s && today.minutes < e;
            const past = today.minutes >= e;
            const progress = live ? ((today.minutes - s) / (e - s)) * 100 : 0;
            return (
              <li
                key={c.id}
                className={`relative overflow-hidden rounded-xl border px-3 py-2 transition-colors ${
                  live ? "border-accent bg-accent-soft/50" : "border-line"
                } ${past ? "opacity-50" : ""}`}
              >
                {live && <span className="absolute inset-y-0 left-0 bg-accent/10" style={{ width: `${progress}%` }} />}
                <div className="relative flex items-center gap-3">
                  <span className="w-[5.5rem] shrink-0 text-xs tabular-nums text-muted">
                    {c.starts}–{c.ends}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{c.title}</span>
                    <span className="block truncate text-xs text-muted">
                      {[c.room, c.teacher].filter(Boolean).join(" · ")}
                    </span>
                  </span>
                  {live ? (
                    <span className="shrink-0 rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-accent-ink">
                      {fill(labels.left, "t", span((e - today.minutes) * 60_000, labels.units))}
                    </span>
                  ) : !past && s - today.minutes <= 120 ? (
                    <span className="shrink-0 text-xs text-muted">{fill(labels.next, "t", span((s - today.minutes) * 60_000, labels.units))}</span>
                  ) : (
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${kindTone[c.kind]}`}>{labels.kinds[c.kind]}</span>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}
      {over && <p className="mt-3 text-sm font-medium text-accent">{labels.dayOver}</p>}
      {tomorrow.length > 0 && (
        <div className="mt-3 border-t border-line pt-3">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted">{labels.tomorrow}</p>
          <p className="text-sm">
            {tomorrow.map((c) => (
              <span key={c.id} className="mr-3 inline-block">
                <span className="tabular-nums text-muted">{c.starts}</span> {c.title}
              </span>
            ))}
          </p>
        </div>
      )}
    </div>
  );
}

function DeadlinesCard({ data, now, labels, locale, className }: { data: DashboardData; now: number; labels: Labels; locale: Locale; className: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [due, setDue] = useState("");
  const [error, setError] = useState("");
  const [showDone, setShowDone] = useState(false);
  const [pending, start] = useTransition();
  const open = data.deadlines.filter((d) => !d.done);
  const done = data.deadlines.filter((d) => d.done);

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) =>
    start(async () => {
      const res = await fn();
      if (!res.ok) return setError(labels[(res.error ?? "badDate") as "needTitle" | "badDate"]);
      setError("");
      router.refresh();
    });

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    // datetime-local is wall-clock time in the browser's zone; send it as an exact instant.
    const dueAt = due ? new Date(due).toISOString() : "";
    run(async () => {
      const res = await addDeadline({ title, note: "", dueAt });
      if (res.ok) {
        setTitle("");
        setDue("");
      }
      return res;
    });
  };

  return (
    <div className={`${CARD} ${className}`}>
      <div className={HEAD}>
        <CalendarClock size={15} className="text-rose" />
        {labels.deadlines}
        {pending && <Loader2 size={14} className="animate-spin" />}
      </div>
      <form onSubmit={add} className="mb-4 flex flex-wrap gap-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={labels.titlePlaceholder}
          className="min-w-48 flex-1 rounded-xl border border-line bg-surface px-3 py-2 text-sm outline-none transition-colors focus:border-accent"
        />
        <input
          type="datetime-local"
          value={due}
          onChange={(e) => setDue(e.target.value)}
          className="rounded-xl border border-line bg-surface px-3 py-2 text-sm outline-none transition-colors focus:border-accent"
        />
        <button
          disabled={pending}
          className="group inline-flex items-center gap-1.5 rounded-xl bg-ink px-4 py-2 text-sm font-medium text-bg transition-transform hover:-translate-y-0.5"
        >
          <Plus size={16} className="transition-transform group-hover:rotate-90" />
          {labels.add}
        </button>
      </form>
      {error && <p className="-mt-2 mb-3 text-xs text-rose">{error}</p>}
      {open.length === 0 ? (
        <p className="text-sm text-muted">{labels.noDeadlines}</p>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {open.map((d) => {
            const left = now ? new Date(d.dueAt).getTime() - now : null;
            const tone =
              left === null
                ? "bg-surface-2 text-muted"
                : left < 24 * 3600_000
                  ? "bg-rose-soft text-rose"
                  : left < 72 * 3600_000
                    ? "bg-ochre-soft text-ochre"
                    : "bg-accent-soft text-accent";
            return (
              <li key={d.id} className="group flex items-center gap-3 rounded-xl border border-line px-3 py-2 transition-colors hover:border-accent">
                <button
                  type="button"
                  onClick={() => run(() => setDeadlineDone(d.id, true))}
                  className="flex size-5 shrink-0 items-center justify-center rounded-md border border-line text-transparent transition-colors hover:border-accent hover:text-accent"
                >
                  <Check size={13} />
                </button>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{d.title}</span>
                  <span className="block text-xs text-muted" suppressHydrationWarning>
                    {now ? new Date(d.dueAt).toLocaleString(locale, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : " "}
                  </span>
                </span>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums ${tone}`}>
                  {left === null ? "…" : left < 0 ? labels.overdue : fill(labels.in, "t", span(left, labels.units))}
                </span>
                <button
                  type="button"
                  title={labels.delete}
                  onClick={() => run(() => deleteDeadline(d.id))}
                  className="shrink-0 text-muted opacity-0 transition-opacity hover:text-rose group-hover:opacity-100 focus:opacity-100"
                >
                  <Trash2 size={15} />
                </button>
              </li>
            );
          })}
        </ul>
      )}
      {done.length > 0 && (
        <div className="mt-3">
          <button type="button" onClick={() => setShowDone((v) => !v)} className="text-xs text-muted hover:text-ink">
            {fill(labels.doneShow, "n", done.length)} {showDone ? "▴" : "▾"}
          </button>
          {showDone && (
            <ul className="mt-2 flex flex-wrap gap-2">
              {done.map((d) => (
                <li key={d.id}>
                  <button
                    type="button"
                    onClick={() => run(() => setDeadlineDone(d.id, false))}
                    className="rounded-full border border-line px-3 py-1 text-xs text-muted line-through transition-colors hover:border-accent hover:text-ink"
                  >
                    {d.title}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
