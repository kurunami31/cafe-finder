"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import {
  Check,
  ImageIcon,
  LoaderCircle,
  Upload,
  X,
} from "lucide-react";
import type { Cafe } from "@/lib/types";
import {
  deletePhotoAction,
  listCafePhotos,
  setPhotoApprovalAction,
  uploadCafePhotoAction,
} from "@/app/admin/actions";

type Photo = { id: string; url: string; approved: boolean };

export function PhotoManager({ cafe }: { cafe: Cafe }) {
  const [photos, setPhotos] = useState<Photo[] | undefined>(undefined);
  const [version, setVersion] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    listCafePhotos(cafe.id).then((p) => {
      if (!cancelled) setPhotos(p);
    });
    return () => {
      cancelled = true;
    };
  }, [cafe.id, version]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);

  async function upload(formData: FormData) {
    formData.append("cafe_id", cafe.id);
    setUploading(true);
    setError(null);
    const result = await uploadCafePhotoAction(null, formData);
    setUploading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    await reload();
  }

  async function act(action: (fd: FormData) => Promise<void>, id: string) {
    const fd = new FormData();
    fd.set("id", id);
    await action(fd);
    await reload();
  }

  return (
    <div className="mt-4 rounded-xl border border-latte bg-cream/60 p-4">
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-bark/70">
        <ImageIcon className="size-3.5" strokeWidth={2} />
        Photos
      </p>

      {photos === undefined ? (
        <p className="mt-3 flex items-center gap-2 text-sm text-bark/60">
          <LoaderCircle className="size-4 animate-spin text-brand-dark" strokeWidth={2} />
          Loading photos...
        </p>
      ) : photos.length > 0 ? (
        <ul className="mt-3 flex flex-wrap gap-3">
          {photos.map((p) => (
            <li key={p.id} className="relative">
              <Image
                src={p.url}
                alt="Cafe photo"
                width={96}
                height={72}
                className={`h-[72px] w-24 rounded-lg object-cover ring-1 ${
                  p.approved ? "ring-latte" : "ring-amber-500 ring-2"
                }`}
                unoptimized
              />
              {!p.approved && (
                <span className="absolute left-1 top-1 rounded bg-amber-500 px-1 text-[9px] font-bold text-white">
                  PENDING
                </span>
              )}
              {!p.approved ? (
                <button
                  type="button"
                  onClick={() => {
                    const fd = new FormData();
                    fd.set("id", p.id);
                    fd.set("approved", "true");
                    void setPhotoApprovalAction(fd).then(reload);
                  }}
                  title="Approve photo"
                  aria-label="Approve photo"
                  className="absolute -right-1.5 -top-1.5 flex size-6 items-center justify-center rounded-full bg-leaf text-white shadow hover:bg-green-700"
                >
                  <Check className="size-3.5" strokeWidth={2.5} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => void act(deletePhotoAction, p.id)}
                  title="Delete photo"
                  aria-label="Delete photo"
                  className="absolute -right-1.5 -top-1.5 flex size-6 items-center justify-center rounded-full bg-red-600 text-white shadow hover:bg-red-700"
                >
                  <X className="size-3.5" strokeWidth={2.5} />
                </button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-xs italic text-bark/50">No photos yet.</p>
      )}
      <form action={upload} className="mt-3 flex flex-wrap items-center gap-2">
        <input
          type="file"
          name="photo"
          accept="image/jpeg,image/png,image/webp"
          required
          className="max-w-full text-xs text-bark file:mr-2 file:cursor-pointer file:rounded-full file:border-0 file:bg-espresso file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-cream"
        />
        <button
          type="submit"
          disabled={uploading}
          className="inline-flex items-center gap-1.5 rounded-full border border-sand px-3 py-1.5 text-xs font-semibold text-bark transition hover:border-brand disabled:opacity-50"
        >
          {uploading ? (
            <LoaderCircle className="size-3.5 animate-spin" strokeWidth={2} />
          ) : (
            <Upload className="size-3.5" strokeWidth={2} />
          )}
          Upload
        </button>
      </form>
      {error && (
        <p className="mt-2 text-xs font-medium text-red-700 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
