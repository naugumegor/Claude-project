import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { asc } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import { getDictionary, getLocale, type Dictionary } from "@/dictionaries";
import type { Locale } from "@/lib/i18n";
import { db } from "@/db";
import { timetable } from "@/db/schema";
import { getSettings } from "@/lib/dashboard";
import { getAdmin, getUser } from "@/lib/session";
import { AdminSkeleton, LoginCard } from "@/components/admin/login-card";
import { ScheduleEditor } from "@/components/dashboard/schedule-editor";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: dict.dashboard.schedule.title, robots: { index: false } };
}

export default async function SchedulePage() {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  return (
    <section className="mx-auto max-w-5xl px-4 pt-12 sm:px-6">
      <Suspense fallback={<AdminSkeleton />}>
        <Editor dict={dict} locale={locale} />
      </Suspense>
    </section>
  );
}

async function Editor({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  const [admin, user] = await Promise.all([getAdmin(), getUser()]);
  if (!admin) return <LoginCard dict={dict.admin} next={`/${locale}/admin/schedule`} denied={Boolean(user)} />;
  const [classes, settings] = await Promise.all([
    db.select().from(timetable).orderBy(asc(timetable.weekday), asc(timetable.starts)),
    getSettings(),
  ]);
  const labels = dict.dashboard;

  return (
    <>
      <Link
        href={`/${locale}`}
        className="group mb-6 inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-accent"
      >
        <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
        {labels.schedule.back}
      </Link>
      <h1 className="font-display text-3xl font-extrabold tracking-tight">{labels.schedule.title}</h1>
      <p className="mb-8 mt-2 max-w-2xl text-muted">{labels.schedule.lead}</p>
      <ScheduleEditor classes={classes} semesterStart={settings.semesterStart} labels={labels} />
    </>
  );
}
