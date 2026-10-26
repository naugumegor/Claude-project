"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import type { Dictionary } from "@/dictionaries";
import type { ClassKind, ClassRow, WeekParity } from "@/lib/dashboard-shared";
import { deleteClass, saveClass, setSemesterStart, type ClassInput } from "@/app/[lang]/admin/dashboard-actions";

type Labels = Dictionary["dashboard"];

const FIELD = "w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm outline-none transition-colors focus:border-accent";
const KINDS: ClassKind[] = ["lecture", "practice", "lab", "other"];
const PARITIES: WeekParity[] = ["every", "odd", "even"];
const kindTone: Record<ClassKind, string> = {
  lecture: "bg-accent-soft text-accent",
  practice: "bg-ochre-soft text-ochre",
  lab: "bg-plum-soft text-plum",
  other: "bg-rose-soft text-rose",
};

const blank = (weekday: number): ClassInput => ({
  weekday,
  starts: "09:00",
  ends: "10:30",
  title: "",
  room: "",
  teacher: "",
  kind: "lecture",
  parity: "every",
});

/** The owner's weekly timetable: one column per weekday, add / edit / delete classes in place. */
export function ScheduleEditor({ classes, semesterStart, labels }: { classes: ClassRow[]; semesterStart: string; labels: Labels }) {
  const router = useRouter();
  const t = labels.schedule;
  const [form, setForm] = useState<ClassInput | null>(null);
  const [start, setStart] = useState(semesterStart);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, run] = useTransition();

  const act = (fn: () => Promise<{ ok: boolean; error?: string }>, after?: () => void) =>
    run(async () => {
      const res = await fn();
      if (!res.ok) {
        const key = res.error as "badTime" | "needTitle" | "badDate";
        setMessage({ ok: false, text: key === "badTime" ? t.badTime : labels[key] ?? String(res.error) });
        return;
      }
      setMessage({ ok: true, text: t.saved });
      after?.();
      router.refresh();
    });

  const set = <K extends keyof ClassInput>(k: K, v: ClassInput[K]) => setForm((f) => f && { ...f, [k]: v });

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end gap-3">
        <label className="grid gap-1 text-sm">
          <span className="text-muted">{t.semesterStart}</span>
          <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className={FIELD} />
        </label>
        <button
          type="button"
          disabled={pending || start === semesterStart}
          onClick={() => act(() => setSemesterStart(start))}
          className="rounded-xl bg-ink px-4 py-2 text-sm font-medium text-bg transition-opacity disabled:opacity-40"
        >
          {t.save}
        </button>
        {pending && <Loader2 size={18} className="mb-2 animate-spin text-muted" />}
        {message && <span className={`mb-2 text-sm ${message.ok ? "text-accent" : "text-rose"}`}>{message.text}</span>}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {labels.weekdays.map((dayName, i) => {
          const weekday = i + 1;
          const rows = classes.filter((c) => c.weekday === weekday);
          const editingHere = form?.weekday === weekday;
          return (
            <div key={weekday} className="min-w-0 rounded-2xl border border-line bg-surface p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-display text-lg font-bold">{dayName}</h2>
                <button
                  type="button"
                  title={t.add}
                  onClick={() => setForm(blank(weekday))}
                  className="group rounded-lg p-1 text-muted transition-colors hover:bg-surface-2 hover:text-accent"
                >
                  <Plus size={18} className="transition-transform group-hover:rotate-90" />
                </button>
              </div>
              {rows.length === 0 && !editingHere && <p className="text-sm text-muted">{t.empty}</p>}
              <ul className="grid grid-cols-1 gap-2">
                {rows.map((c) =>
                  form?.id === c.id ? null : (
                    <li key={c.id} className="group flex items-start gap-2 rounded-xl border border-line px-3 py-2">
                      <span className="min-w-0 flex-1">
                        <span className="block text-xs tabular-nums text-muted">
                          {c.starts}–{c.ends}
                          {c.parity !== "every" && <> · {labels.parity[c.parity]}</>}
                        </span>
                        <span className="block font-semibold leading-snug">{c.title}</span>
                        <span className="block truncate text-xs text-muted">{[c.room, c.teacher].filter(Boolean).join(" · ")}</span>
                      </span>
                      <span className={`mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-xs ${kindTone[c.kind]}`}>{labels.kinds[c.kind]}</span>
                      <span className="flex shrink-0 flex-col gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                        <button type="button" title={t.edit} onClick={() => setForm({ ...c })} className="text-muted hover:text-accent">
                          <Pencil size={14} />
                        </button>
                        <button type="button" title={labels.delete} onClick={() => act(() => deleteClass(c.id))} className="text-muted hover:text-rose">
                          <Trash2 size={14} />
                        </button>
                      </span>
                    </li>
                  ),
                )}
              </ul>
              {editingHere && form && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    act(() => saveClass(form), () => setForm(null));
                  }}
                  className="mt-2 grid gap-2 rounded-xl border border-accent bg-accent-soft/30 p-3"
                >
                  <input autoFocus required placeholder={t.subject} value={form.title} onChange={(e) => set("title", e.target.value)} className={FIELD} />
                  <div className="grid grid-cols-2 gap-2">
                    <input type="time" aria-label={t.starts} value={form.starts} onChange={(e) => set("starts", e.target.value)} className={FIELD} />
                    <input type="time" aria-label={t.ends} value={form.ends} onChange={(e) => set("ends", e.target.value)} className={FIELD} />
                    <input placeholder={t.room} value={form.room} onChange={(e) => set("room", e.target.value)} className={FIELD} />
                    <input placeholder={t.teacher} value={form.teacher} onChange={(e) => set("teacher", e.target.value)} className={FIELD} />
                    <select aria-label={t.kind} value={form.kind} onChange={(e) => set("kind", e.target.value as ClassKind)} className={FIELD}>
                      {KINDS.map((k) => (
                        <option key={k} value={k}>
                          {labels.kinds[k]}
                        </option>
                      ))}
                    </select>
                    <select aria-label={t.parity} value={form.parity} onChange={(e) => set("parity", e.target.value as WeekParity)} className={FIELD}>
                      {PARITIES.map((p) => (
                        <option key={p} value={p}>
                          {labels.parity[p]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => setForm(null)} className="inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-sm text-muted hover:text-ink">
                      <X size={15} /> {t.cancel}
                    </button>
                    <button disabled={pending} className="inline-flex items-center gap-1 rounded-xl bg-ink px-3 py-1.5 text-sm font-medium text-bg">
                      <Check size={15} /> {t.save}
                    </button>
                  </div>
                </form>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
