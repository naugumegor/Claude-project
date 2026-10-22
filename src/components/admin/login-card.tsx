import { LogIn, ShieldX } from "lucide-react";
import type { Dictionary } from "@/dictionaries";

/** Shown on admin pages to anyone who isn't the site owner. */
export function LoginCard({
  dict,
  next,
  denied = false,
}: {
  dict: Dictionary["admin"];
  next: string;
  /** Signed in, but with somebody else's account. */
  denied?: boolean;
}) {
  return (
    <div className="mx-auto mt-10 max-w-md rounded-2xl border border-line bg-surface p-8 text-center">
      {denied && <ShieldX size={40} className="mx-auto mb-3 text-rose" />}
      <h1 className="font-display text-2xl font-bold">{denied ? dict.denied : dict.title}</h1>
      <p className="mt-2 text-muted">{denied ? dict.deniedText : dict.loginLead}</p>
      {denied ? (
        // Signing out first, so the GitHub button below starts a fresh sign-in.
        <form action="/api/auth/logout" method="post" className="mt-6">
          <input type="hidden" name="next" value={next} />
          <button className="group inline-flex items-center gap-2 rounded-xl bg-ink px-5 py-3 font-medium text-bg transition-transform hover:-translate-y-0.5">
            <LogIn size={18} className="transition-transform group-hover:translate-x-0.5" />
            {dict.switch}
          </button>
        </form>
      ) : (
        <a
          href={`/api/auth/login?next=${encodeURIComponent(next)}`}
          className="group mt-6 inline-flex items-center gap-2 rounded-xl bg-ink px-5 py-3 font-medium text-bg transition-transform hover:-translate-y-0.5"
        >
          <LogIn size={18} className="transition-transform group-hover:translate-x-0.5" />
          {dict.login}
        </a>
      )}
    </div>
  );
}

export function AdminSkeleton() {
  return (
    <div className="mt-10 space-y-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-16 animate-pulse rounded-2xl bg-surface-2" />
      ))}
    </div>
  );
}
