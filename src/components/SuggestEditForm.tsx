"use client";

import { useActionState } from "react";
import { CheckCircle2, LoaderCircle, Pencil } from "lucide-react";
import { submitEditSuggestion } from "@/app/actions";

export function SuggestEditForm({ cafeId }: { cafeId: string }) {
  const [state, formAction, pending] = useActionState(
    (prev: { error?: string; sent?: boolean } | null, formData: FormData) =>
      submitEditSuggestion(cafeId, prev, formData),
    null
  );

  if (state?.sent) {
    return (
      <p className="flex items-center gap-2 rounded-xl bg-leaf/10 px-4 py-3 text-sm font-medium text-leaf animate-fade-in">
        <CheckCircle2 className="size-4 shrink-0" strokeWidth={2} />
        Thanks! A moderator will review your correction.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label
            htmlFor="edit-field"
            className="mb-1 block text-xs font-semibold text-bark"
          >
            What needs fixing?
          </label>
          <select
            id="edit-field"
            name="field"
            required
            defaultValue=""
            className="w-full rounded-lg border border-sand bg-paper px-3 py-2 text-sm text-espresso focus:border-brand focus:outline-none"
          >
            <option value="" disabled>
              Choose...
            </option>
            <option value="opening_hours">Opening hours</option>
            <option value="website">Website</option>
            <option value="phone">Phone number</option>
            <option value="address">Address</option>
            <option value="closed">This cafe has closed</option>
            <option value="other">Something else</option>
          </select>
        </div>
        <div>
          <label
            htmlFor="suggested_value"
            className="mb-1 block text-xs font-semibold text-bark"
          >
            Correct information
          </label>
          <input
            id="suggested_value"
            name="suggested_value"
            type="text"
            maxLength={200}
            placeholder="e.g. Mon-Sat 08:00-21:00"
            className="w-full rounded-lg border border-sand bg-paper px-3 py-2 text-sm text-espresso focus:border-brand focus:outline-none"
          />
        </div>
      </div>
      <div>
        <label htmlFor="edit-note" className="mb-1 block text-xs font-semibold text-bark">
          Details (required)
        </label>
        <textarea
          id="edit-note"
          name="note"
          rows={2}
          minLength={5}
          maxLength={500}
          required
          placeholder="How do you know? e.g. 'I visited yesterday and it was closed'"
          className="w-full resize-y rounded-lg border border-sand bg-paper px-3 py-2 text-sm text-espresso focus:border-brand focus:outline-none"
        />
      </div>

      {state?.error && (
        <p className="text-xs font-medium text-red-700 dark:text-red-400">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-1.5 rounded-full border border-sand bg-paper px-4 py-2 text-xs font-semibold text-bark transition hover:border-brand hover:text-brand-dark disabled:opacity-50"
      >
        {pending ? (
          <LoaderCircle className="size-3.5 animate-spin" strokeWidth={2} />
        ) : (
          <Pencil className="size-3.5" strokeWidth={2} />
        )}
        Send correction
      </button>
    </form>
  );
}
