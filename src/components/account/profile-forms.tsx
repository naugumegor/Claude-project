"use client";

import { useActionState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, KeyRound, Loader2, MonitorSmartphone, Trash2, UserRound } from "lucide-react";
import type { Dictionary } from "@/dictionaries";
import type { Locale } from "@/lib/i18n";
import {
  changePassword,
  deleteAccount,
  signOutEverywhere,
  updateProfile,
  type FormState,
} from "@/app/[lang]/account/actions";

export function ProfileForms({
  dict,
  errors,
  labels,
  name,
  hasPassword,
  viaGithub,
  locale,
  canDelete,
}: {
  dict: Dictionary["account"];
  errors: Dictionary["auth"]["errors"];
  labels: { name: string; email: string; forgot: string };
  name: string;
  hasPassword: boolean;
  viaGithub: boolean;
  locale: Locale;
  /** False for the site owner, whose account holds the admin rights. */
  canDelete: boolean;
}) {
  const [profile, profileAction, profilePending] = useActionState<FormState, FormData>(updateProfile, undefined);
  const [password, passwordAction, passwordPending] = useActionState<FormState, FormData>(
    changePassword,
    undefined,
  );
  const [removal, removeAction, removePending] = useActionState<FormState, FormData>(deleteAccount, undefined);

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
          {hasPassword && (
            <a href={`/${locale}/reset`} className="justify-self-start text-xs text-muted transition-colors hover:text-accent">
              {labels.forgot}
            </a>
          )}
          <Status message={say(password)} />
        </form>
      </Card>

      <details className="rounded-2xl border border-line bg-surface p-5">
        <summary className="flex cursor-pointer list-none items-center gap-2 text-sm text-muted transition-colors hover:text-accent">
          <MonitorSmartphone size={15} />
          {dict.logoutAll}
        </summary>
        <form action={signOutEverywhere} className="mt-4 grid gap-3">
          <p className="text-sm leading-relaxed text-muted">{dict.logoutAllHint}</p>
          <input type="hidden" name="lang" value={locale} />
          <motion.button
            whileTap={{ scale: 0.97 }}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-line px-4 text-sm font-medium transition-colors hover:border-accent hover:text-accent"
          >
            {dict.logoutAll}
          </motion.button>
        </form>
      </details>

      {canDelete && (
        <details className="group/del rounded-2xl border border-line bg-surface p-5">
          <summary className="flex cursor-pointer list-none items-center gap-2 text-sm text-muted transition-colors hover:text-rose">
            <Trash2 size={15} />
            {dict.deleteTitle}
          </summary>
          <form action={removeAction} className="mt-4 grid gap-3">
            <p className="text-sm leading-relaxed text-muted">{dict.deleteLead}</p>
            <input type="hidden" name="lang" value={locale} />
            <input name="confirm" autoComplete="off" placeholder={dict.deleteWord} required className={inputClass} />
            <motion.button
              whileTap={{ scale: 0.97 }}
              disabled={removePending}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-rose px-4 text-sm font-medium text-rose transition-colors hover:bg-rose-soft disabled:opacity-60"
            >
              {removePending ? <Loader2 size={16} className="animate-spin" /> : dict.deleteButton}
            </motion.button>
            <Status message={say(removal)} />
          </form>
        </details>
      )}
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
