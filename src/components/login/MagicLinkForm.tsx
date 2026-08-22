"use client";

import { useActionState, useState } from "react";
import {
  CheckCircle2,
  KeyRound,
  LoaderCircle,
  MailCheck,
  Send,
} from "lucide-react";
import {
  sendMagicLinkAction,
  signInWithPasswordAction,
} from "@/app/login/actions";

type Mode = "magic" | "password";

export function MagicLinkForm() {
  const [mode, setMode] = useState<Mode>("magic");

  return (
    <div>
      <div className="mb-5 grid grid-cols-2 gap-1 rounded-full border border-sand bg-paper p-1">
        {(
          [
            { key: "magic", label: "Magic link" },
            { key: "password", label: "Password" },
          ] as const
        ).map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setMode(t.key)}
            aria-pressed={mode === t.key}
            className={`rounded-full py-1.5 text-xs font-semibold transition ${
              mode === t.key
                ? "bg-espresso text-cream shadow-sm"
                : "text-bark hover:text-espresso"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {mode === "magic" ? <MagicLinkMode /> : <PasswordMode />}
    </div>
  );
}

function MagicLinkMode() {
  const [state, formAction, pending] = useActionState(sendMagicLinkAction, null);

  if (state?.sent) {
    return (
      <div className="rounded-xl bg-leaf/10 px-4 py-5 text-center animate-fade-in">
        <MailCheck className="mx-auto size-7 text-leaf" strokeWidth={1.75} />
        <p className="mt-3 text-sm font-semibold text-espresso">Check your inbox</p>
        <p className="mt-1 text-xs leading-relaxed text-bark/70">
          We sent a sign-in link to your email. Click it to finish signing in — no
          password needed.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <EmailField id="magic-email" />
      {state?.error && (
        <p className="rounded-xl bg-red-900/5 px-4 py-3 text-sm font-medium text-red-900 dark:bg-red-400/10 dark:text-red-300">
          {state.error}
        </p>
      )}
      <SubmitButton icon={<Send className="size-4" strokeWidth={2} />} pendingLabel="Sending link..." pending={pending}>
        Email me a sign-in link
      </SubmitButton>
      <p className="flex items-start gap-2 text-xs leading-relaxed text-bark/60">
        <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-leaf" strokeWidth={2} />
        No password required. New emails automatically get an account.
      </p>
    </form>
  );
}

function PasswordMode() {
  const [state, formAction, pending] = useActionState(
    signInWithPasswordAction,
    null
  );

  return (
    <form action={formAction} className="space-y-4">
      <EmailField id="pw-email" />
      <div>
        <label
          htmlFor="pw-password"
          className="mb-1 block text-sm font-semibold text-espresso"
        >
          Password
        </label>
        <input
          id="pw-password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full rounded-xl border border-sand bg-paper px-3.5 py-2.5 text-sm text-espresso focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25"
        />
      </div>
      {state?.error && (
        <p className="rounded-xl bg-red-900/5 px-4 py-3 text-sm font-medium text-red-900 dark:bg-red-400/10 dark:text-red-300">
          {state.error}
        </p>
      )}
      <SubmitButton icon={<KeyRound className="size-4" strokeWidth={2} />} pendingLabel="Signing in..." pending={pending}>
        Sign in
      </SubmitButton>
      <p className="text-xs leading-relaxed text-bark/60">
        First time using a password? Set one from My account after signing in with a
        magic link once.
      </p>
    </form>
  );
}

function EmailField({ id }: { id: string }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-espresso">
        Email
      </label>
      <input
        id={id}
        name="email"
        type="email"
        required
        autoComplete="email"
        placeholder="you@example.com"
        className="w-full rounded-xl border border-sand bg-paper px-3.5 py-2.5 text-sm text-espresso placeholder:text-bark/40 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25"
      />
    </div>
  );
}

function SubmitButton({
  icon,
  pending,
  pendingLabel,
  children,
}: {
  icon: React.ReactNode;
  pending: boolean;
  pendingLabel: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-dark disabled:opacity-50"
    >
      {pending ? (
        <LoaderCircle className="size-4 animate-spin" strokeWidth={2} />
      ) : (
        icon
      )}
      {pending ? pendingLabel : children}
    </button>
  );
}
