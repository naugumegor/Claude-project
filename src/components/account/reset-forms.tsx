"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, Eye, EyeOff, Loader2, Lock, Mail, MailCheck } from "lucide-react";
import type { Dictionary } from "@/dictionaries";
import type { Locale } from "@/lib/i18n";
import { requestPasswordReset, resetPassword, type FormState } from "@/app/[lang]/account/actions";
import { IconInput } from "./auth-form";

type Props = { dict: Dictionary["auth"]; locale: Locale };

function Card({ title, lead, children }: { title: string; lead: string; children: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-line bg-surface p-6 shadow-[0_30px_80px_-40px_rgba(35,38,43,0.45)] sm:p-8">
      <div aria-hidden className="pointer-events-none absolute -top-24 -left-16 size-64 rounded-full bg-accent-soft blur-3xl" />
      <h1 className="relative font-display text-2xl font-extrabold tracking-tight">{title}</h1>
      <p className="relative mt-2 text-sm leading-relaxed text-muted">{lead}</p>
      <div className="relative mt-6">{children}</div>
    </div>
  );
}

function ErrorLine({ dict, code }: { dict: Dictionary["auth"]; code?: string }) {
  const text = code ? (dict.errors[code as keyof typeof dict.errors] ?? code) : null;
  return (
    <AnimatePresence>
      {text && (
        <motion.p
          key={text}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: [0, -6, 6, -3, 0] }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-xl bg-rose-soft px-3 py-2 text-sm text-rose"
        >
          {text}
        </motion.p>
      )}
    </AnimatePresence>
  );
}

function Submit({ pending, label }: { pending: boolean; label: string }) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      disabled={pending}
      className="group mt-1 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-accent font-semibold text-accent-ink shadow-[0_10px_24px_-12px_var(--accent)] transition-opacity disabled:opacity-60"
    >
      {pending ? (
        <Loader2 size={18} className="animate-spin" />
      ) : (
        <>
          {label}
          <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
        </>
      )}
    </motion.button>
  );
}

function BackLink({ dict, locale }: Props) {
  return (
    <Link
      href={`/${locale}/login`}
      className="mt-5 inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-accent"
    >
      <ArrowLeft size={14} />
      {dict.reset.back}
    </Link>
  );
}

/** "Forgot password": asks for the email and sends a one-time link. */
export function ForgotForm({ dict, locale }: Props) {
  const [state, action, pending] = useActionState<FormState, FormData>(requestPasswordReset, undefined);
  return (
    <Card title={dict.reset.title} lead={dict.reset.lead}>
      {state?.ok ? (
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-2.5 rounded-xl bg-accent-soft px-3 py-3 text-sm text-accent"
        >
          <MailCheck size={18} className="mt-0.5 shrink-0" />
          {dict.reset.sent}
        </motion.p>
      ) : (
        <form action={action} className="grid gap-3">
          <input type="hidden" name="lang" value={locale} />
          <IconInput icon={Mail} name="email" type="email" placeholder={dict.email} autoComplete="email" required />
          <ErrorLine dict={dict} code={state?.error} />
          <Submit pending={pending} label={dict.reset.send} />
        </form>
      )}
      <BackLink dict={dict} locale={locale} />
    </Card>
  );
}

/** Opened from the emailed (or admin-issued) link: sets the new password. */
export function NewPasswordForm({ dict, locale, token }: Props & { token: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(resetPassword, undefined);
  const [show, setShow] = useState(false);
  return (
    <Card title={dict.reset.newTitle} lead={dict.reset.newLead}>
      <form action={action} className="grid gap-3">
        <input type="hidden" name="lang" value={locale} />
        <input type="hidden" name="token" value={token} />
        <div className="relative">
          <IconInput
            icon={Lock}
            name="password"
            type={show ? "text" : "password"}
            placeholder={`${dict.password} · ${dict.passwordHint}`}
            autoComplete="new-password"
            minLength={8}
            required
          />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            aria-label={dict.password}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-muted transition-colors hover:text-accent"
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        <ErrorLine dict={dict} code={state?.error} />
        <Submit pending={pending} label={dict.reset.save} />
      </form>
      <BackLink dict={dict} locale={locale} />
    </Card>
  );
}

/** The link was used, expired or replaced. */
export function DeadLink({ dict, locale }: Props) {
  return (
    <Card title={dict.reset.newTitle} lead={dict.reset.dead}>
      <Link
        href={`/${locale}/reset`}
        className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-accent font-semibold text-accent-ink shadow-[0_10px_24px_-12px_var(--accent)]"
      >
        {dict.reset.again}
        <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
      </Link>
      <BackLink dict={dict} locale={locale} />
    </Card>
  );
}
