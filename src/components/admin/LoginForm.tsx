"use client";

import { useActionState } from "react";
import { LogIn } from "lucide-react";
import { signInAction } from "@/app/admin/actions";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(signInAction, null);

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
          className="w-full rounded-xl border border-sand bg-paper px-3.5 py-2.5 text-sm text-espresso focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25"
        />
      </div>
      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-espresso">
          Password
        </label>
        <input
          id="password"
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

      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-espresso px-6 py-2.5 text-sm font-semibold text-cream transition hover:bg-bark disabled:opacity-50"
      >
        <LogIn className="size-4" strokeWidth={2} />
        {pending ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
