"use client";

import { useActionState } from "react";
import { CheckCircle2, LoaderCircle, MailCheck, Send } from "lucide-react";
import { sendMagicLinkAction } from "@/app/login/actions";

export function MagicLinkForm() {
  const [state, formAction, pending] = useActionState(sendMagicLinkAction, null);

  if (state?.sent) {
    return (
      <div className="rounded-xl bg-leaf/10 px-4 py-5 text-center animate-fade-in">
        <MailCheck className="mx-auto size-7 text-leaf" strokeWidth={1.75} />
        <p className="mt-3 text-sm font-semibold text-espresso">Check your inbox</p>
        <p className="mt-1 text-xs leading-relaxed text-bark/70">
          We sent a sign-in link to your email. Click it to finish signing in — no password
          needed.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-espresso">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          className="w-full rounded-xl border border-sand bg-paper px-3.5 py-2.5 text-sm text-espresso placeholder:text-bark/40 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25"
        />
      </div>

      {state?.error && (
        <p className="rounded-xl bg-red-900/5 px-4 py-3 text-sm font-medium text-red-900 dark:bg-red-400/10 dark:text-red-300">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-dark disabled:opacity-50"
      >
        {pending ? (
          <LoaderCircle className="size-4 animate-spin" strokeWidth={2} />
        ) : (
          <Send className="size-4" strokeWidth={2} />
        )}
        {pending ? "Sending link..." : "Email me a sign-in link"}
      </button>

      <p className="flex items-start gap-2 text-xs leading-relaxed text-bark/60">
        <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-leaf" strokeWidth={2} />
        No password required. New emails automatically get an account. We never post anything
        on your behalf.
      </p>
    </form>
  );
}
