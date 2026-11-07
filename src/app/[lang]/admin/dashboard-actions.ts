"use server";

import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { deadlines, timetable } from "@/db/schema";
import { requireAdmin, requireUser } from "@/lib/session";
import { geocode, saveSettings } from "@/lib/dashboard";
import { TIME_RE, type ClassKind, type WeekParity } from "@/lib/dashboard-shared";

// An admin's own dashboard: deadlines, timetable and settings. Only admins may call these, and
// each one reads and changes only his own rows (matched by user id), never another admin's.

/** The signed-in admin's user id. */
async function me() {
  await requireAdmin();
  return (await requireUser()).id;
}

type Result = { ok: true } | { ok: false; error: string };

export async function addDeadline(input: { title: string; note: string; dueAt: string }): Promise<Result> {
  const userId = await me();
  const title = input.title.trim().slice(0, 200);
  const dueAt = new Date(input.dueAt);
  if (!title) return { ok: false, error: "needTitle" };
  if (Number.isNaN(dueAt.getTime())) return { ok: false, error: "badDate" };
  await db.insert(deadlines).values({ userId, title, note: input.note.trim().slice(0, 500), dueAt });
  return { ok: true };
}

export async function setDeadlineDone(id: number, done: boolean): Promise<Result> {
  const userId = await me();
  await db
    .update(deadlines)
    .set({ doneAt: done ? new Date() : null })
    .where(and(eq(deadlines.id, id), eq(deadlines.userId, userId)));
  return { ok: true };
}

export async function deleteDeadline(id: number): Promise<Result> {
  const userId = await me();
  await db.delete(deadlines).where(and(eq(deadlines.id, id), eq(deadlines.userId, userId)));
  return { ok: true };
}

export type ClassInput = {
  id?: number;
  weekday: number;
  starts: string;
  ends: string;
  title: string;
  room: string;
  teacher: string;
  kind: ClassKind;
  parity: WeekParity;
};

const KINDS: ClassKind[] = ["lecture", "practice", "lab", "other"];
const PARITIES: WeekParity[] = ["every", "odd", "even"];

export async function saveClass(input: ClassInput): Promise<Result> {
  const userId = await me();
  const title = input.title.trim().slice(0, 200);
  if (!title) return { ok: false, error: "needTitle" };
  if (!TIME_RE.test(input.starts) || !TIME_RE.test(input.ends) || input.ends <= input.starts) {
    return { ok: false, error: "badTime" };
  }
  if (!Number.isInteger(input.weekday) || input.weekday < 1 || input.weekday > 7) return { ok: false, error: "badTime" };
  const values = {
    weekday: input.weekday,
    starts: input.starts,
    ends: input.ends,
    title,
    room: input.room.trim().slice(0, 100),
    teacher: input.teacher.trim().slice(0, 100),
    kind: KINDS.includes(input.kind) ? input.kind : "other",
    parity: PARITIES.includes(input.parity) ? input.parity : "every",
  };
  if (input.id) {
    await db
      .update(timetable)
      .set(values)
      .where(and(eq(timetable.id, input.id), eq(timetable.userId, userId)));
  } else await db.insert(timetable).values({ ...values, userId });
  return { ok: true };
}

export async function deleteClass(id: number): Promise<Result> {
  const userId = await me();
  await db.delete(timetable).where(and(eq(timetable.id, id), eq(timetable.userId, userId)));
  return { ok: true };
}

export async function setCity(name: string, locale: string): Promise<Result> {
  const userId = await me();
  const query = name.trim().slice(0, 100);
  if (!query) return { ok: false, error: "cityNotFound" };
  const hit = await geocode(query, locale === "en" ? "en" : "ru").catch(() => null);
  if (!hit) return { ok: false, error: "cityNotFound" };
  await saveSettings(userId, hit);
  return { ok: true };
}

export async function setSemesterStart(day: string): Promise<Result> {
  const userId = await me();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || Number.isNaN(Date.parse(day))) return { ok: false, error: "badDate" };
  await saveSettings(userId, { semesterStart: day });
  return { ok: true };
}
