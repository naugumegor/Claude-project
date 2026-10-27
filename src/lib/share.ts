// Short links and pastes: limits and checks shared by the account forms and the server.

export const LINK_MAX_URL = 2048;
export const PASTE_MAX_BYTES = 200 * 1024;
export const PASTE_MAX_TITLE = 120;
/** Per reader: how many may be made in an hour, and kept in total. The admin has no limits. */
export const LINK_LIMITS = { perHour: 30, total: 500 };
export const PASTE_LIMITS = { perHour: 20, total: 200 };

/** Languages offered for pastes; all are in lowlight's "common" set. */
export const PASTE_LANGUAGES = [
  "auto",
  "plaintext",
  "python",
  "c",
  "cpp",
  "csharp",
  "java",
  "javascript",
  "typescript",
  "go",
  "rust",
  "kotlin",
  "php",
  "ruby",
  "lua",
  "r",
  "swift",
  "sql",
  "bash",
  "json",
  "yaml",
  "ini",
  "xml",
  "css",
  "markdown",
  "diff",
] as const;
export type PasteLanguage = (typeof PASTE_LANGUAGES)[number];
export const isPasteLanguage = (value: string): value is PasteLanguage =>
  (PASTE_LANGUAGES as readonly string[]).includes(value);

/** Paste lifetimes in hours; 0 = keep forever. */
export const PASTE_EXPIRY = [0, 1, 24, 24 * 7, 24 * 30] as const;

/** A custom short code: 3–40 of a-z, 0-9, "-" and "_", not starting with a dash. */
export const CUSTOM_CODE = /^[a-z0-9_][a-z0-9_-]{2,39}$/;

// Codes that would read as part of the site, or that we may want for routes one day.
const RESERVED = new Set(["admin", "api", "login", "account", "ru", "en", "new", "edit", "raw", "go", "p", "s", "ingenium"]);

export function checkCustomCode(value: string): "ok" | "badCode" {
  return CUSTOM_CODE.test(value) && !RESERVED.has(value) ? "ok" : "badCode";
}

/**
 * Only plain http(s) links to a public host name. No javascript:/data:/file: and friends, no
 * user:password@ (used to disguise the real host), no IPs or localhost, and no links to our own
 * /s/, which could chain into loops. Returns the normalised URL or an error code.
 */
export function checkLinkUrl(raw: string, ownHost?: string): { url: string } | { error: "badUrl" | "selfLink" } {
  const value = raw.trim();
  if (!value || value.length > LINK_MAX_URL || /\s/.test(value)) return { error: "badUrl" };
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return { error: "badUrl" };
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return { error: "badUrl" };
  if (url.username || url.password) return { error: "badUrl" };
  const host = url.hostname.toLowerCase();
  if (
    !host.includes(".") ||
    host.endsWith(".") ||
    host.endsWith(".localhost") ||
    host.endsWith(".local") ||
    host.endsWith(".internal") ||
    /^[\d.]+$/.test(host) ||
    host.startsWith("[")
  ) {
    return { error: "badUrl" };
  }
  if (ownHost && host === ownHost.toLowerCase() && /^\/s(\/|$)/.test(url.pathname)) return { error: "selfLink" };
  return { url: url.href };
}
