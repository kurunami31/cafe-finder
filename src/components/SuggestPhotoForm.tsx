"use client";

import { useActionState } from "react";
import { Camera, LoaderCircle } from "lucide-react";
import { submitPhoto } from "@/app/actions";

export function SuggestPhotoForm({ cafeId }: { cafeId: string }) {
  const [state, formAction, pending] = useActionState(
    (prev: { error?: string } | null, formData: FormData) =>
      submitPhoto(cafeId, prev, formData),
    null
  );

  if (state && !state.error) {
    return (
      <p className="rounded-xl bg-leaf/10 px-4 py-3 text-sm font-medium text-leaf">
        Thanks! Your photo was submitted and will appear once approved.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-3">
      <label className="block text-sm font-semibold text-espresso" htmlFor={`photo-${cafeId}`}>
        Suggest a photo
      </label>
      <input
        id={`photo-${cafeId}`}
        type="file"
        name="photo"
        accept="image/jpeg,image/png,image/webp"
        required
        className="block w-full cursor-pointer text-xs text-bark file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-latte file:px-4 file:py-2 file:text-xs file:font-semibold file:text-bark hover:file:bg-sand"
      />
      {state?.error && (
        <p className="text-xs font-medium text-red-700 dark:text-red-400">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-1.5 rounded-full border border-sand bg-paper px-5 py-2 text-xs font-semibold text-bark transition hover:border-brand hover:text-brand-dark disabled:opacity-50"
      >
        {pending ? (
          <LoaderCircle className="size-3.5 animate-spin" strokeWidth={2} />
        ) : (
          <Camera className="size-3.5" strokeWidth={2} />
        )}
        {pending ? "Uploading..." : "Submit photo for review"}
      </button>
    </form>
  );
}
