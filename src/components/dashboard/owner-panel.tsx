import type { Dictionary } from "@/dictionaries";
import type { Locale } from "@/lib/i18n";
import { getAdmin, getUser } from "@/lib/session";
import { loadDashboard } from "@/lib/dashboard";
import { OwnerDashboard } from "./owner-dashboard";

/** The owner's dashboard on the home page. Renders nothing for anyone else. Put it inside <Suspense>. */
export async function OwnerPanel({ labels, locale }: { labels: Dictionary["dashboard"]; locale: Locale }) {
  const [admin, user] = await Promise.all([getAdmin(), getUser()]);
  if (!admin) return null;
  const data = await loadDashboard();
  const name = (user?.name || admin).split(" ")[0];
  return <OwnerDashboard data={data} labels={labels} locale={locale} name={name} />;
}
