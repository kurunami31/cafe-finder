"use client";

import { useActionState, useState } from "react";
import { CheckCircle2, KeyRound, LoaderCircle, UserRound } from "lucide-react";
import {
  updateDisplayNameAction,
  updatePasswordAction,
} from "@/app/account/actions";
import { AvatarUploader } from "@/components/account/AvatarUploader";

export function AccountProfile({
  email,
  initialName,
  avatarUrl,
}: {
  email: string;
  initialName: string;
  avatarUrl: string | null;
}) {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-latte bg-paper p-6">
        <h2 className="font-display text-lg font-semibold text-espresso">
          Profile picture
        </h2>
        <p className="mb-4 mt-1 text-xs text-bark/60">
          Shown next to your reviews and in the account menu.
        </p>
        <AvatarUploader email={email} initialUrl={avatarUrl} />
      </section>

      <section className="rounded-2xl border border-latte bg-paper p-6">
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-espresso">
          <UserRound className="size-5 text-brand-dark" strokeWidth={1.75} />
          Profile
        </h2>
        <p className="mt-1 mb-4 text-xs text-bark/60">
          Signed in as <span className="font-semibold text-bark">{email}</span>
        </p>
        <DisplayNameForm initialName={initialName} />
      </section>

      <section className="rounded-2xl border border-latte bg-paper p-6">
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-espresso">
          <KeyRound className="size-5 text-brand-dark" strokeWidth={1.75} />
          Password
        </h2>
        <p className="mt-1 mb-4 text-xs text-bark/60">
          Set a password to sign in with your email and password instead of a magic link.
        </p>
        <PasswordForm />
      </section>
    </div>
  );
}

function DisplayNameForm({ initialName }: { initialName: string }) {
  const [state, formAction, pending] = useActionState(
    updateDisplayNameAction,
    null
  );
  const [value, setValue] = useState(initialName);

  return (
    <form action={formAction} className="space-y-3">
      <label
        htmlFor="display_name"
        className="block text-sm font-semibold text-espresso"
      >
        Display name{" "}
        <span className="font-normal text-bark/50">(shown on your reviews)</span>
      </label>
      <input
        id="display_name"
        name="display_name"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        minLength={2}
        maxLength={40}
        required
        className="w-full rounded-xl border border-sand bg-paper px-3.5 py-2.5 text-sm text-espresso focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25"
      />
      {state?.saved && (
        <p className="flex items-center gap-1.5 text-xs font-medium text-leaf">
          <CheckCircle2 className="size-3.5" strokeWidth={2} />
          Name saved.
        </p>
      )}
      {state?.error && (
        <p className="text-xs font-medium text-red-700 dark:text-red-400">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending || value.trim().length < 2}
        className="inline-flex items-center gap-1.5 rounded-full bg-espresso px-5 py-2 text-xs font-semibold text-cream transition hover:bg-bark disabled:opacity-50"
      >
        {pending && (
          <LoaderCircle className="size-3.5 animate-spin" strokeWidth={2} />
        )}
        Save name
      </button>
    </form>
  );
}

function PasswordForm() {
  const [state, formAction, pending] = useActionState(
    updatePasswordAction,
    null
  );

  return (
    <form action={formAction} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label
            htmlFor="password"
            className="mb-1 block text-sm font-semibold text-espresso"
          >
            New password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="w-full rounded-xl border border-sand bg-paper px-3.5 py-2.5 text-sm text-espresso focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25"
          />
        </div>
        <div>
          <label
            htmlFor="confirm"
            className="mb-1 block text-sm font-semibold text-espresso"
          >
            Confirm password
          </label>
          <input
            id="confirm"
            name="confirm"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="w-full rounded-xl border border-sand bg-paper px-3.5 py-2.5 text-sm text-espresso focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25"
          />
        </div>
      </div>
      {state?.saved && (
        <p className="flex items-center gap-1.5 text-xs font-medium text-leaf">
          <CheckCircle2 className="size-3.5" strokeWidth={2} />
          Password updated — you can now sign in with email + password.
        </p>
      )}
      {state?.error && (
        <p className="text-xs font-medium text-red-700 dark:text-red-400">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-1.5 rounded-full bg-brand px-5 py-2 text-xs font-semibold text-white transition hover:bg-brand-dark disabled:opacity-50"
      >
        {pending && (
          <LoaderCircle className="size-3.5 animate-spin" strokeWidth={2} />
        )}
        Update password
      </button>
    </form>
  );
}
