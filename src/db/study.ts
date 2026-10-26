import "server-only";
import { and, count, desc, eq, gte, sql, sum } from "drizzle-orm";
import { db } from "@/db";
import { studySessions } from "@/db/schema";

export type StudyDay = { day: string; count: number; minutes: number };

/** Pomodoros per day from `since` on (the reader's own dates), oldest first. */
export async function getStudyDays(userId: number, since: string): Promise<StudyDay[]> {
  const rows = await db
    .select({ day: studySessions.day, count: count(), minutes: sum(studySessions.minutes) })
    .from(studySessions)
    .where(and(eq(studySessions.userId, userId), gte(studySessions.day, since)))
    .groupBy(studySessions.day)
    .orderBy(studySessions.day);
  return rows.map((r) => ({ day: r.day, count: r.count, minutes: Number(r.minutes ?? 0) }));
}

/** All-time totals, including days older than the heat map shows. */
export async function getStudyTotals(userId: number) {
  const [row] = await db
    .select({ count: count(), minutes: sum(studySessions.minutes), days: sql<number>`count(distinct ${studySessions.day})::int` })
    .from(studySessions)
    .where(eq(studySessions.userId, userId));
  return { count: row.count, minutes: Number(row.minutes ?? 0), days: row.days };
}

export async function lastSessionAt(userId: number) {
  const [row] = await db
    .select({ at: studySessions.createdAt })
    .from(studySessions)
    .where(eq(studySessions.userId, userId))
    .orderBy(desc(studySessions.createdAt))
    .limit(1);
  return row?.at ?? null;
}

export async function recordSession(userId: number, day: string, minutes: number) {
  await db.insert(studySessions).values({ userId, day, minutes });
}

export async function countOn(userId: number, day: string) {
  const [row] = await db
    .select({ count: count() })
    .from(studySessions)
    .where(and(eq(studySessions.userId, userId), eq(studySessions.day, day)));
  return row.count;
}
