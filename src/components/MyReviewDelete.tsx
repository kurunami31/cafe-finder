"use client";

import { useActionState } from "react";
import { Trash2, LoaderCircle } from "lucide-react";
import { deleteMyReviewAction } from "@/app/login/actions";

export function MyReviewDelete({ reviewId }: { reviewId: string }) {
  const [state, formAction, pending] = useActionState(deleteMyReviewAction, null);

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (!window.confirm("Delete your review?")) e.preventDefault();
      }}
      className="inline-flex"
    >
      <input type="hidden" name="id" value={reviewId} />
      <button
        type="submit"
        disabled={pending}
        title="Delete this review (yours)"
        aria-label="Delete this review"
        className="flex size-7 items-center justify-center rounded-full text-bark/40 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-500/10"
      >
        {pending ? (
          <LoaderCircle className="size-3.5 animate-spin" strokeWidth={2} />
        ) : (
          <Trash2 className="size-3.5" strokeWidth={1.75} />
        )}
      </button>
      {state?.error && (
        <span className="ml-1 self-center text-[10px] text-red-600">{state.error}</span>
      )}
    </form>
  );
}
