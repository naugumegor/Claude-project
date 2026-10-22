"use client";

import { useActionState, useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { ArrowRight, Eye, EyeOff, Loader2, Lock, Mail, UserRound } from "lucide-react";
import type { Dictionary } from "@/dictionaries";
import { signIn, signUp, type FormState } from "@/app/[lang]/account/actions";

type Mode = "signin" | "signup";
const spring = { type: "spring", stiffness: 420, damping: 34 } as const;

export function AuthForm({
  dict,
  next,
  initialMode,
  initialError,
}: {
  dict: Dictionary["auth"];
  next: string;
  initialMode: Mode;
  initialError?: string;
}) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [inState, inAction, inPending] = useActionState<FormState, FormData>(signIn, undefined);
  const [upState, upAction, upPending] = useActionState<FormState, FormData>(signUp, undefined);
  const [showPassword, setShowPassword] = useState(false);

  const signup = mode === "signup";
  const pending = signup ? upPending : inPending;
  const errorCode = (signup ? upState : inState)?.error ?? initialError;
  const error = errorCode ? (dict.errors[errorCode as keyof typeof dict.errors] ?? errorCode) : null;

  return (
    <motion.div
      layout
      transition={spring}
      className="relative overflow-hidden rounded-3xl border border-line bg-surface p-6 shadow-[0_30px_80px_-40px_rgba(35,38,43,0.45)] sm:p-8"
    >
      {/* Soft coloured blob that slides between the two modes. */}
      <motion.div
        aria-hidden
        animate={{ x: signup ? "55%" : "-25%" }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
        className="pointer-events-none absolute -top-24 left-0 size-64 rounded-full bg-accent-soft blur-3xl"
      />

      <LayoutGroup id="auth-mode">
        <div className="relative grid grid-cols-2 gap-1 rounded-2xl bg-surface-2 p-1">
          {(["signin", "signup"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`relative rounded-xl py-2.5 text-sm font-semibold transition-colors ${
                mode === m ? "text-ink" : "text-muted hover:text-ink"
              }`}
            >
              {mode === m && (
                <motion.span
                  layoutId="auth-pill"
                  transition={spring}
                  className="absolute inset-0 rounded-xl bg-surface shadow-[0_4px_14px_-8px_rgba(35,38,43,0.5)]"
                />
              )}
              <span className="relative">{m === "signin" ? dict.signIn : dict.signUp}</span>
            </button>
          ))}
        </div>
      </LayoutGroup>

      <p className="relative mt-5 text-sm leading-relaxed text-muted">{dict.lead}</p>

      <form action={signup ? upAction : inAction} className="relative mt-6 grid gap-3">
        <input type="hidden" name="next" value={next} />
        <AnimatePresence initial={false}>
          {signup && (
            <motion.div
              key="name"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <IconInput icon={UserRound} name="name" placeholder={dict.name} autoComplete="name" required />
            </motion.div>
          )}
        </AnimatePresence>
        <IconInput icon={Mail} name="email" type="email" placeholder={dict.email} autoComplete="email" required />
        <div className="relative">
          <IconInput
            icon={Lock}
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder={signup ? `${dict.password} · ${dict.passwordHint}` : dict.password}
            autoComplete={signup ? "new-password" : "current-password"}
            minLength={signup ? 8 : undefined}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={dict.password}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-muted transition-colors hover:text-accent"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        <AnimatePresence>
          {error && (
            <motion.p
              key={error}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: [0, -6, 6, -3, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="rounded-xl bg-rose-soft px-3 py-2 text-sm text-rose"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        <motion.button
          whileTap={{ scale: 0.97 }}
          disabled={pending}
          className="group mt-1 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-accent font-semibold text-accent-ink shadow-[0_10px_24px_-12px_var(--accent)] transition-opacity disabled:opacity-60"
        >
          {pending ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <>
              {signup ? dict.submitUp : dict.submitIn}
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </>
          )}
        </motion.button>
      </form>

      <div className="relative my-5 flex items-center gap-3 text-xs uppercase tracking-wider text-muted">
        <span className="h-px flex-1 bg-line" />
        {dict.or}
        <span className="h-px flex-1 bg-line" />
      </div>

      <a
        href={`/api/auth/login?next=${encodeURIComponent(next)}`}
        className="group relative flex h-12 items-center justify-center gap-2.5 rounded-xl border border-line bg-surface font-medium transition-all hover:-translate-y-0.5 hover:border-ink hover:shadow-[0_10px_24px_-14px_rgba(35,38,43,0.6)]"
      >
        <GithubMark className="size-5 transition-transform duration-300 group-hover:rotate-[360deg]" />
        {dict.github}
      </a>
    </motion.div>
  );
}

function IconInput({
  icon: Icon,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { icon: React.ComponentType<{ size?: number; className?: string }> }) {
  return (
    <label className="group flex h-12 items-center gap-2.5 rounded-xl border border-line bg-bg/40 px-3 transition-[border-color,box-shadow] focus-within:border-accent focus-within:bg-surface focus-within:shadow-[0_0_0_4px_var(--accent-soft)]">
      <Icon size={18} className="shrink-0 text-muted transition-colors group-focus-within:text-accent" />
      <input {...props} className="h-full w-full bg-transparent pr-8 outline-none placeholder:text-muted/80" />
    </label>
  );
}

/** GitHub's logo (lucide dropped brand icons). */
export function GithubMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M12 .5C5.65.5.5 5.65.5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.37-3.87-1.37-.53-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.7 5.4-5.26 5.69.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  );
}
