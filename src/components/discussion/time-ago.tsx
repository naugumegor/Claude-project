"use client";

import { useEffect, useState } from "react";
import { timeAgo } from "@/lib/discussion-shared";

/** "5 мин назад" for cached pages: the server renders a plain date, the browser swaps in the relative time. */
export function TimeAgo({ iso, locale }: { iso: string; locale: string }) {
  const [label, setLabel] = useState(() =>
    new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(iso)),
  );
  useEffect(() => {
    const tick = () => setLabel(timeAgo(iso, locale));
    tick();
    const timer = setInterval(tick, 60_000);
    return () => clearInterval(timer);
  }, [iso, locale]);
  return <time dateTime={iso}>{label}</time>;
}
