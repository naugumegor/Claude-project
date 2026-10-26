"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { deadlines, timetable } from "@/db/schema";
import { requireAdmin } from "@/lib/session";
import { geocode, saveSettings } from "@/lib/dashboard";
import { TIME_RE, type ClassKind, type WeekParity } from "@/lib/dashboard-shared";

// The owner's dashboard: deadlines, timetable and settings. Only the admin may call these.

type Result = { ok: true } | { ok: false; error: string };

export async function addDeadline(input: { title: string; note: string; dueAt: string }): Promise<Result> {
  await requireAdmin();
  const title = input.title.trim().slice(0, 200);
  const dueAt = new Date(input.dueAt);
  if (!title) return { ok: false, error: "needTitle" };
  if (Number.isNaN(dueAt.getTime())) return { ok: false, error: "badDate" };
  await db.insert(deadlines).values({ title, note: input.note.trim().slice(0, 500), dueAt });
  return { ok: true };
}

export async function setDeadlineDone(id: number, done: boolean): Promise<Result> {
  await requireAdmin();
  await db.update(deadlines).set({ doneAt: done ? new Date() : null }).where(eq(deadlines.id, id));
  return { ok: true };
}

export async function deleteDeadline(id: number): Promise<Result> {
  await requireAdmin();
  await db.delete(deadlines).where(eq(deadlines.id, id));
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
  await requireAdmin();
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
  if (input.id) await db.update(timetable).set(values).where(eq(timetable.id, input.id));
  else await db.insert(timetable).values(values);
  return { ok: true };
}

export async function deleteClass(id: number): Promise<Result> {
  await requireAdmin();
  await db.delete(timetable).where(eq(timetable.id, id));
  return { ok: true };
}

export async function setCity(name: string, locale: string): Promise<Result> {
  await requireAdmin();
  const query = name.trim().slice(0, 100);
  if (!query) return { ok: false, error: "cityNotFound" };
  const hit = await geocode(query, locale === "en" ? "en" : "ru").catch(() => null);
  if (!hit) return { ok: false, error: "cityNotFound" };
  await saveSettings(hit);
  return { ok: true };
}

export async function setSemesterStart(day: string): Promise<Result> {
  await requireAdmin();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || Number.isNaN(Date.parse(day))) return { ok: false, error: "badDate" };
  await saveSettings({ semesterStart: day });
  return { ok: true };
}
