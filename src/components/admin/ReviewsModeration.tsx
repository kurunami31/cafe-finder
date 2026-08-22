"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Check, Pencil, Trash2, X, Star, LoaderCircle } from "lucide-react";
import type { Review } from "@/lib/types";
import { deleteReviewAction, updateReviewAction } from "@/app/admin/actions";

type AdminReview = Review & { cafe_name: string | null };

export function ReviewsModeration({ initialReviews }: { initialReviews: AdminReview[] }) {
  const [reviews, setReviews] = useState(initialReviews);

  const removeLocal = (id: string) =>
    setReviews((prev) => prev.filter((r) => r.id !== id));
  const patchLocal = (id: string, patch: Partial<AdminReview>) =>
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-espresso">Reviews</h1>
      <p className="mt-1 text-sm text-bark/70">
        {reviews.length} most recent reviews across all cafes.
      </p>

      <ul className="mt-6 space-y-4">
        {reviews.length === 0 && (
          <li className="rounded-2xl border border-dashed border-sand bg-paper p-10 text-center text-sm text-bark/60">
            No reviews have been posted yet.
          </li>
        )}
        {reviews.map((r) => (
          <ReviewRow
            key={r.id}
            review={r}
            onDeleted={() => removeLocal(r.id)}
            onUpdated={(patch) => patchLocal(r.id, patch)}
          />
        ))}
      </ul>
    </div>
  );
}

function ReviewRow({
  review,
  onDeleted,
  onUpdated,
}: {
  review: AdminReview;
  onDeleted: () => void;
  onUpdated: (patch: Partial<AdminReview>) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [updateState, updateFormAction, updating] = useActionState(
    async (prev: { error?: string } | null, formData: FormData) => {
      const result = await updateReviewAction(prev, formData);
      if (!result.error) {
        onUpdated({
          display_name: String(formData.get("display_name")).trim() || "Anonymous",
          rating: Number(formData.get("rating")),
          comment: String(formData.get("comment")).trim(),
        });
        setEditing(false);
      }
      return result;
    },
    null
  );
  const [deleteState, deleteFormAction, deleting] = useActionState(
    async (prev: { error?: string } | null, formData: FormData) => {
      const result = await deleteReviewAction(prev, formData);
      if (!result.error) onDeleted();
      return result;
    },
    null
  );

  if (editing) {
    return (
      <li className="rounded-2xl border border-brand/40 bg-paper p-5">
        <form action={updateFormAction} className="space-y-3">
          <input type="hidden" name="id" value={review.id} />
          <div className="flex flex-wrap gap-3">
            <div className="min-w-40 flex-1">
              <label className="mb-1 block text-xs font-semibold text-bark">Display name</label>
              <input
                name="display_name"
                defaultValue={review.display_name}
                maxLength={40}
                className="w-full rounded-lg border border-sand bg-paper px-3 py-2 text-sm focus:border-brand focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-bark">Rating</label>
              <select
                name="rating"
                defaultValue={review.rating}
                className="h-[38px] rounded-lg border border-sand bg-paper px-3 text-sm focus:border-brand focus:outline-none"
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n} star{n > 1 ? "s" : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-bark">Comment</label>
            <textarea
              name="comment"
              defaultValue={review.comment}
              rows={3}
              maxLength={1000}
              required
              className="w-full resize-y rounded-lg border border-sand bg-paper px-3 py-2 text-sm focus:border-brand focus:outline-none"
            />
          </div>
          {(updateState?.error || deleteState?.error) && (
            <p className="text-xs font-medium text-red-700 dark:text-red-400">
              {updateState?.error ?? deleteState?.error}
            </p>
          )}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={updating}
              className="inline-flex items-center gap-1.5 rounded-full bg-espresso px-4 py-2 text-xs font-semibold text-cream transition hover:bg-bark disabled:opacity-50"
            >
              {updating ? (
                <LoaderCircle className="size-3.5 animate-spin" strokeWidth={2} />
              ) : (
                <Check className="size-3.5" strokeWidth={2} />
              )}
              Save changes
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setConfirmDelete(false);
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-sand px-4 py-2 text-xs font-semibold text-bark transition hover:border-brand"
            >
              <X className="size-3.5" strokeWidth={2} />
              Cancel
            </button>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li className="rounded-2xl border border-latte bg-paper p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            href={`/cafe/${review.cafe_id}`}
            target="_blank"
            className="font-display font-semibold text-espresso hover:text-brand-dark"
          >
            {review.cafe_name ?? "Unknown cafe"}
          </Link>
          <span className="ml-2 inline-flex items-center gap-1 text-xs font-semibold text-bark">
            <Star className="size-3.5 fill-caramel text-caramel" strokeWidth={1} />
            {review.rating}/5 · {review.display_name}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setEditing(true)}
            title="Edit review"
            aria-label="Edit review"
            className="flex size-8 items-center justify-center rounded-full text-bark/60 transition hover:bg-latte hover:text-espresso"
          >
            <Pencil className="size-4" strokeWidth={1.75} />
          </button>
          {confirmDelete ? (
            <div className="flex items-center gap-1">
              <span className="text-xs font-medium text-red-700 dark:text-red-400">Delete?</span>
              <form action={deleteFormAction}>
                <input type="hidden" name="id" value={review.id} />
                <button
                  type="submit"
                  disabled={deleting}
                  title="Confirm delete"
                  aria-label="Confirm delete"
                  className="flex size-8 items-center justify-center rounded-full bg-red-600 text-white transition hover:bg-red-700 disabled:opacity-50"
                >
                  {deleting ? (
                    <LoaderCircle className="size-4 animate-spin" strokeWidth={2} />
                  ) : (
                    <Check className="size-4" strokeWidth={2} />
                  )}
                </button>
              </form>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                title="Cancel"
                aria-label="Cancel delete"
                className="flex size-8 items-center justify-center rounded-full border border-sand text-bark transition hover:border-brand"
              >
                <X className="size-4" strokeWidth={2} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              title="Delete review"
              aria-label="Delete review"
              className="flex size-8 items-center justify-center rounded-full text-bark/60 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
            >
              <Trash2 className="size-4" strokeWidth={1.75} />
            </button>
          )}
        </div>
      </div>
      <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-bark">
        {review.comment}
      </p>
      <p className="mt-2 text-xs text-bark/50">
        {new Date(review.created_at + "Z").toLocaleString("en-PH", {
          dateStyle: "medium",
          timeStyle: "short",
          timeZone: "Asia/Manila",
        })}
      </p>
      {deleteState?.error && !confirmDelete && (
        <p className="mt-2 text-xs font-medium text-red-700 dark:text-red-400">{deleteState.error}</p>
      )}
    </li>
  );
}
