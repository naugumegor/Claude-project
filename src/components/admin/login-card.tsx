import { LogIn } from "lucide-react";
import type { Dictionary } from "@/dictionaries";

export function LoginCard({ dict, next }: { dict: Dictionary["admin"]; next: string }) {
  return (
    <div className="mx-auto mt-10 max-w-md rounded-2xl border border-line bg-surface p-8 text-center">
      <h1 className="font-display text-2xl font-bold">{dict.title}</h1>
      <p className="mt-2 text-muted">{dict.loginLead}</p>
      <a
        href={`/api/auth/login?next=${encodeURIComponent(next)}`}
        className="group mt-6 inline-flex items-center gap-2 rounded-xl bg-ink px-5 py-3 font-medium text-bg transition-transform hover:-translate-y-0.5"
      >
        <LogIn size={18} className="transition-transform group-hover:translate-x-0.5" />
        {dict.login}
      </a>
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
