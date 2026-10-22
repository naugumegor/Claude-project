import Link from "next/link";
import { Heart } from "lucide-react";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { favorites } from "@/db/schema";
import { getUser } from "@/lib/session";
import { FavoriteToggle } from "./favorite-toggle";

type Labels = { favorite: string; favorited: string; loginToSave: string };

/** Heart button on a material page. Reads the session, so render it inside <Suspense>. */
export async function Favorite({
  materialId,
  path,
  locale,
  labels,
}: {
  materialId: number;
  /** Current page, to come back here after signing in. */
  path: string;
  locale: string;
  labels: Labels;
}) {
  const loginHref = `/${locale}/login?next=${encodeURIComponent(path)}`;
  const user = await getUser();
  if (!user) {
    return (
      <Link
        href={loginHref}
        title={labels.loginToSave}
        className="group inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-sm font-medium text-muted transition-colors hover:border-rose hover:text-rose"
      >
        <Heart size={16} className="transition-transform group-hover:scale-110" />
        {labels.favorite}
      </Link>
    );
  }

  const [row] = await db
    .select({ id: favorites.materialId })
    .from(favorites)
    .where(and(eq(favorites.userId, user.id), eq(favorites.materialId, materialId)))
    .limit(1);
  return <FavoriteToggle materialId={materialId} initial={Boolean(row)} labels={labels} loginHref={loginHref} />;
}

export function FavoriteSkeleton() {
  return <span className="inline-block h-9 w-36 animate-pulse rounded-full bg-surface-2" />;
}
