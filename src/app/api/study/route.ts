import { NextResponse, type NextRequest } from "next/server";
import { getUser } from "@/lib/session";
import { addDays, DAY } from "@/lib/streaks";
import { countOn, lastSessionAt, recordSession } from "@/db/study";

const FOCUS_MINUTES = 25;

/** Accepts a reader's date only if it can be "today" somewhere on Earth (UTC−12 … UTC+14). */
function plausibleDay(day: string) {
  if (!DAY.test(day)) return false;
  const utc = new Date().toISOString().slice(0, 10);
  return day >= addDays(utc, -1) && day <= addDays(utc, 1);
}

// GET /api/study?day=YYYY-MM-DD → { count } pomodoros on that day; 401 for guests.
export async function GET(request: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const day = request.nextUrl.searchParams.get("day") ?? "";
  if (!plausibleDay(day)) return NextResponse.json({ error: "Bad day" }, { status: 400 });
  return NextResponse.json({ count: await countOn(user.id, day) });
}

// POST /api/study { day } → logs one finished 25-minute focus period, returns that day's count.
export async function POST(request: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  // Same-site only: the cookie is SameSite=Lax already, this also stops same-site forms on other subdomains.
  const origin = request.headers.get("origin");
  if (origin && new URL(origin).host !== request.headers.get("host")) {
    return NextResponse.json({ error: "Bad origin" }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as { day?: unknown } | null;
  const day = typeof body?.day === "string" ? body.day : "";
  if (!plausibleDay(day)) return NextResponse.json({ error: "Bad day" }, { status: 400 });

  // A focus period lasts 25 minutes, so two can't finish closer than that. Also stops double
  // logging when the timer is open in two tabs.
  const last = await lastSessionAt(user.id);
  if (last && Date.now() - last.getTime() < (FOCUS_MINUTES - 2) * 60_000) {
    return NextResponse.json({ error: "Too soon", count: await countOn(user.id, day) }, { status: 429 });
  }

  await recordSession(user.id, day, FOCUS_MINUTES);
  return NextResponse.json({ count: await countOn(user.id, day) });
}
