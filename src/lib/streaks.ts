// Calendar-day helpers for the study tracker. Days are "YYYY-MM-DD" strings in the reader's own time zone.

export const DAY = /^\d{4}-\d{2}-\d{2}$/;

/** The local calendar date of `date` as YYYY-MM-DD. */
export function localDay(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Shifts a YYYY-MM-DD date by `n` days (UTC arithmetic, so DST never skips a day). */
export function addDays(day: string, n: number) {
  const t = new Date(`${day}T00:00:00Z`);
  t.setUTCDate(t.getUTCDate() + n);
  return t.toISOString().slice(0, 10);
}

/**
 * Days in a row with at least one pomodoro. The current streak survives until the end of today:
 * if nothing is logged today yet, it counts back from yesterday.
 */
export function streaks(active: Set<string>, today: string) {
  let current = 0;
  for (let d = active.has(today) ? today : addDays(today, -1); active.has(d); d = addDays(d, -1)) current++;

  let longest = 0;
  for (const day of active) {
    if (active.has(addDays(day, -1))) continue; // not the start of a run
    let len = 0;
    for (let d = day; active.has(d); d = addDays(d, 1)) len++;
    longest = Math.max(longest, len);
  }
  return { current, longest };
}
