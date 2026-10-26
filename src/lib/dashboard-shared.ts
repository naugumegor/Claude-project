// Types and pure helpers of the owner's dashboard, shared by the server and the browser.

export type DashboardSettings = {
  city: string;
  lat: number;
  lon: number;
  /** IANA time zone of the city, e.g. "Europe/Moscow". */
  timezone: string;
  /** "YYYY-MM-DD": the first day of the semester, week 1 for odd/even weeks. */
  semesterStart: string;
};

export type Weather = {
  temp: number;
  feels: number;
  humidity: number;
  wind: number;
  code: number;
  isDay: boolean;
  days: { date: string; code: number; max: number; min: number; rain: number | null }[];
};

export type Rates = { date: string; items: { code: string; value: number; previous: number }[] };

export type ClassKind = "lecture" | "practice" | "lab" | "other";
export type WeekParity = "every" | "odd" | "even";

export type ClassRow = {
  id: number;
  weekday: number;
  starts: string;
  ends: string;
  title: string;
  room: string;
  teacher: string;
  kind: ClassKind;
  parity: WeekParity;
};

export type DeadlineRow = { id: number; title: string; note: string; dueAt: string; done: boolean };

export type DashboardData = {
  settings: DashboardSettings;
  weather: Weather | null;
  rates: Rates | null;
  classes: ClassRow[];
  deadlines: DeadlineRow[];
};

/** Wall-clock parts of `date` in time zone `tz`: ISO weekday, "YYYY-MM-DD" and minutes since midnight. */
export function zonedParts(date: Date, tz: string) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      weekday: "short",
      hourCycle: "h23",
    })
      .formatToParts(date)
      .map((p) => [p.type, p.value]),
  );
  const weekday = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(parts.weekday) + 1;
  return {
    weekday,
    day: `${parts.year}-${parts.month}-${parts.day}`,
    minutes: Number(parts.hour) * 60 + Number(parts.minute),
  };
}

export const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

/** Semester week number (1, 2, …) of calendar day `day`; weeks start on Monday. */
export function semesterWeek(day: string, semesterStart: string) {
  const monday = (d: string) => {
    const t = new Date(`${d}T00:00:00Z`);
    return t.getTime() - ((t.getUTCDay() + 6) % 7) * 86_400_000;
  };
  return Math.floor((monday(day) - monday(semesterStart)) / (7 * 86_400_000)) + 1;
}

/** The classes held on ISO weekday `weekday` of semester week `week`, in order. */
export function classesOn(classes: ClassRow[], weekday: number, week: number) {
  const parity = week % 2 === 0 ? "even" : "odd";
  return classes
    .filter((c) => c.weekday === weekday && (c.parity === "every" || c.parity === parity))
    .sort((a, b) => toMinutes(a.starts) - toMinutes(b.starts));
}

export const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
