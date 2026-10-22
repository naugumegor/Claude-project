import "server-only";
import { db } from "./index";
import { users } from "./schema";

/** Finds or creates the account behind a GitHub identity and keeps its login fresh. */
export async function upsertGithubUser(gh: { id: string; login: string; name?: string | null }) {
  const [row] = await db
    .insert(users)
    .values({ githubId: gh.id, githubLogin: gh.login, name: gh.name?.trim() || gh.login })
    .onConflictDoUpdate({ target: users.githubId, set: { githubLogin: gh.login } })
    .returning();
  return row;
}
