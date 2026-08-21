"use client";

import { useActionState, useState } from "react";
import { Star } from "lucide-react";
import { submitReview, type ReviewResult } from "@/app/actions";

export function ReviewForm({ cafeId }: { cafeId: string }) {
  const [state, formAction, pending] = useActionState<ReviewResult | null, FormData>(
    async (prev, formData) => submitReview(cafeId, prev, formData),
    null
  );
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);

  if (state && !state.error) {
    return (
      <p className="rounded-xl bg-leaf/10 px-4 py-3 text-sm font-medium text-leaf">
        Thanks — your review has been posted.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <span className="mb-2 block text-sm font-semibold text-espresso">Your rating</span>
        <input type="hidden" name="rating" value={rating} />
        <div className="flex items-center gap-1" role="radiogroup" aria-label="Star rating">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={rating === n}
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setRating(n)}
              className="p-0.5"
            >
              <Star
                className={`size-7 transition ${
                  n <= (hover || rating)
                    ? "fill-caramel text-caramel"
                    : "text-sand hover:text-caramel/60"
                }`}
                strokeWidth={1.5}
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="display_name" className="mb-1.5 block text-sm font-semibold text-espresso">
          Name <span className="font-normal text-bark/50">(optional)</span>
        </label>
        <input
          id="display_name"
          name="display_name"
          type="text"
          maxLength={40}
          placeholder="Anonymous"
          className="w-full rounded-xl border border-sand bg-paper px-3.5 py-2.5 text-sm text-espresso placeholder:text-bark/40 focus:border-caramel focus:outline-none focus:ring-2 focus:ring-caramel/25"
        />
      </div>

      <div>
        <label htmlFor="comment" className="mb-1.5 block text-sm font-semibold text-espresso">
          Your review
        </label>
        <textarea
          id="comment"
          name="comment"
          required
          minLength={3}
          maxLength={1000}
          rows={4}
          placeholder="How was the coffee, the atmosphere, the service?"
          className="w-full resize-y rounded-xl border border-sand bg-paper px-3.5 py-2.5 text-sm text-espresso placeholder:text-bark/40 focus:border-caramel focus:outline-none focus:ring-2 focus:ring-caramel/25"
        />
      </div>

      {state?.error && (
        <p className="rounded-xl bg-red-900/5 px-4 py-3 text-sm font-medium text-red-900">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending || rating === 0}
        className="inline-flex items-center rounded-full bg-espresso px-6 py-2.5 text-sm font-semibold text-cream transition hover:bg-bark disabled:cursor-not-allowed disabled:opacity-40"
      >
        {pending ? "Posting..." : "Post review"}
      </button>
    </form>
  );
}
