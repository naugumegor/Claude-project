// Limits and names shared by the comment forms (client) and the server actions that enforce them.

export const COMMENT_MAX = 2000;
/** Minimum gap between two comments of one reader. */
export const COMMENT_GAP_MS = 20_000;
export const COMMENTS_PER_DAY = 30;
export const COMMENT_MAX_LINKS = 2;
/** Accounts younger than this may not post links at all. */
export const LINKS_AFTER_MS = 24 * 60 * 60 * 1000;
/** The author may edit a comment this long after posting it. */
export const EDIT_WINDOW_MS = 15 * 60 * 1000;
/** A reader's first comments wait for the admin; after this many approved ones they go out at once. */
export const TRUSTED_AFTER = 2;
/** Reports from this many different readers send a comment back to review. */
export const REPORTS_TO_HIDE = 3;

export const REACTIONS = [
  { kind: "useful", emoji: "👍" },
  { kind: "fire", emoji: "🔥" },
  { kind: "hard", emoji: "🤯" },
  { kind: "unclear", emoji: "❓" },
] as const;
export type ReactionKind = (typeof REACTIONS)[number]["kind"];

export type TargetType = "material" | "doc" | "news";
export type Target = { type: TargetType; id: number };

export type CommentError =
  | "signIn"
  | "banned"
  | "empty"
  | "tooLong"
  | "tooFast"
  | "dailyLimit"
  | "tooManyLinks"
  | "noLinksYet"
  | "tooLate"
  | "notFound";

export function countLinks(text: string) {
  return (text.match(/\bhttps?:\/\/|\bwww\.[a-z0-9-]+\.[a-z]/gi) ?? []).length;
}

/** "5 мин назад", "2 h ago", or a date for anything older than a week. */
export function timeAgo(iso: string, locale: string, now = Date.now()) {
  const seconds = Math.round((new Date(iso).getTime() - now) / 1000);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  const abs = Math.abs(seconds);
  if (abs < 60) return rtf.format(0, "second");
  if (abs < 3600) return rtf.format(Math.round(seconds / 60), "minute");
  if (abs < 86400) return rtf.format(Math.round(seconds / 3600), "hour");
  if (abs < 7 * 86400) return rtf.format(Math.round(seconds / 86400), "day");
  return new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" }).format(new Date(iso));
}
