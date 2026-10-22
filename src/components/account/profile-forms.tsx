"use client";

import { useActionState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, KeyRound, Loader2, UserRound } from "lucide-react";
import type { Dictionary } from "@/dictionaries";
import { changePassword, updateProfile, type FormState } from "@/app/[lang]/account/actions";

export function ProfileForms({
  dict,
  errors,
  labels,
  name,
  hasPassword,
  viaGithub,
}: {
  dict: Dictionary["account"];
  errors: Dictionary["auth"]["errors"];
  labels: { name: string; email: string };
  name: string;
  hasPassword: boolean;
  viaGithub: boolean;
}) {
  const [profile, profileAction, profilePending] = useActionState<FormState, FormData>(updateProfile, undefined);
  const [password, passwordAction, passwordPending] = useActionState<FormState, FormData>(
    changePassword,
    undefined,
  );

  const say = (state: FormState) =>
    state?.error
      ? { tone: "error" as const, text: errors[state.error as keyof typeof errors] ?? state.error }
      : state?.ok
        ? { tone: "ok" as const, text: dict[state.ok as "saved" | "changed"] }
        : null;

  return (
    <div className="grid gap-5">
      <Card icon={UserRound} title={dict.profile}>
        <form action={profileAction} className="grid gap-3">
          <input name="name" defaultValue={name} placeholder={labels.name} required maxLength={80} className={inputClass} />
          <Submit pending={profilePending} label={dict.save} />
          <Status message={say(profile)} />
        </form>
      </Card>

      <Card icon={KeyRound} title={dict.passwordTitle}>
        {!hasPassword && viaGithub && <p className="mb-3 text-sm text-muted">{dict.viaGithub}</p>}
        <form action={passwordAction} className="grid gap-3">
          {hasPassword ? (
            <input
              name="current"
              type="password"
              autoComplete="current-password"
              placeholder={dict.current}
              required
              className={inputClass}
            />
          ) : (
            <input name="email" type="email" autoComplete="email" placeholder={labels.email} required className={inputClass} />
          )}
          <input
            name="newPassword"
            type="password"
            autoComplete="new-password"
            minLength={8}
            placeholder={dict.newPassword}
            required
            className={inputClass}
          />
          <Submit pending={passwordPending} label={hasPassword ? dict.save : dict.setPassword} />
          <Status message={say(password)} />
        </form>
      </Card>
    </div>
  );
}

const inputClass =
  "h-11 w-full rounded-xl border border-line bg-bg/40 px-3 text-sm outline-none transition-[border-color,box-shadow] placeholder:text-muted/80 focus:border-accent focus:bg-surface focus:shadow-[0_0_0_4px_var(--accent-soft)]";

function Card({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="group rounded-2xl border border-line bg-surface p-5 transition-shadow hover:shadow-[0_18px_40px_-28px_rgba(35,38,43,0.5)]">
      <h3 className="mb-4 flex items-center gap-2 font-display font-bold">
        <span className="flex size-8 items-center justify-center rounded-lg bg-accent-soft text-accent transition-transform group-hover:-rotate-6 group-hover:scale-110">
          <Icon size={16} />
        </span>
        {title}
      </h3>
      {children}
    </section>
  );
}

function Submit({ pending, label }: { pending: boolean; label: string }) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      disabled={pending}
      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-accent px-4 text-sm font-medium text-accent-ink transition-opacity disabled:opacity-60"
    >
      {pending ? <Loader2 size={16} className="animate-spin" /> : label}
    </motion.button>
  );
}

function Status({ message }: { message: { tone: "ok" | "error"; text: string } | null }) {
  return (
    <AnimatePresence mode="wait">
      {message && (
        <motion.p
          key={message.text}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className={`flex items-center gap-1.5 text-sm ${message.tone === "ok" ? "text-accent" : "text-rose"}`}
        >
          {message.tone === "ok" && <Check size={15} />}
          {message.text}
        </motion.p>
      )}
    </AnimatePresence>
  );
}
