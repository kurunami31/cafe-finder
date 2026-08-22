"use client";

import { useActionState } from "react";
import Image from "next/image";
import { Camera, LoaderCircle } from "lucide-react";
import { uploadAvatarAction, type AvatarResult } from "@/app/account/actions";

export function AvatarUploader({
  email,
  initialUrl,
}: {
  email: string;
  initialUrl: string | null;
}) {
  const [state, formAction, pending] = useActionState<AvatarResult | null, FormData>(
    (_prev, formData) => uploadAvatarAction(_prev, formData),
    null
  );

  const url = state?.url ?? initialUrl;
  const initial = email[0]?.toUpperCase() ?? "?";

  return (
    <div className="flex items-center gap-4">
      <div className="relative size-20 shrink-0 overflow-hidden rounded-full border border-latte bg-latte/50">
        {url ? (
          <Image
            key={url}
            src={url}
            alt="Your avatar"
            fill
            sizes="80px"
            className="object-cover"
            unoptimized
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-2xl font-bold text-bark">
            {initial}
          </span>
        )}
        {pending && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/40">
            <LoaderCircle className="size-6 animate-spin text-white" strokeWidth={2} />
          </span>
        )}
      </div>

      <form action={formAction} className="space-y-2">
        <input
          type="file"
          name="avatar"
          accept="image/jpeg,image/png,image/webp"
          required
          className="block max-w-full cursor-pointer text-xs text-bark file:mr-2 file:cursor-pointer file:rounded-full file:border-0 file:bg-espresso file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-cream"
        />
        <p className="text-[11px] text-bark/50">JPG, PNG or WebP · max 2 MB</p>
        {state?.error && (
          <p className="text-xs font-medium text-red-700 dark:text-red-400">{state.error}</p>
        )}
        {!state?.error && (
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center gap-1.5 rounded-full border border-sand px-4 py-1.5 text-xs font-semibold text-bark transition hover:border-brand hover:text-brand-dark disabled:opacity-50"
          >
            <Camera className="size-3.5" strokeWidth={2} />
            Upload picture
          </button>
        )}
      </form>
    </div>
  );
}
