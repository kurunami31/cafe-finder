import Link from "next/link";
import { Check, ClipboardList, X } from "lucide-react";
import { getPendingSuggestions } from "@/lib/admin-data";
import { resolveSuggestionAction } from "@/app/admin/actions";

export const metadata = { title: "Edit Suggestions" };

const FIELD_LABELS: Record<string, string> = {
  opening_hours: "Opening hours",
  website: "Website",
  phone: "Phone",
  closed: "Reported closed",
  address: "Address",
  other: "Something else",
};

export default async function SuggestionsPage() {
  const suggestions = await getPendingSuggestions();

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-espresso">
        Edit suggestions
      </h1>
      <p className="mt-1 text-sm text-bark/70">
        {suggestions.length} visitor correction{suggestions.length !== 1 ? "s" : ""} awaiting
        review. Applying writes the change directly to the listing.
      </p>

      {suggestions.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-sand bg-paper p-10 text-center animate-fade-in">
          <ClipboardList className="mx-auto size-8 text-sand" strokeWidth={1.5} />
          <p className="mt-3 text-sm italic text-bark/60">No pending corrections.</p>
        </div>
      ) : (
        <ul className="mt-6 space-y-4">
          {suggestions.map((s) => (
            <li
              key={s.id}
              className="rounded-2xl border border-latte bg-paper p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <Link
                  href={`/cafe/${s.cafe_id}`}
                  target="_blank"
                  className="font-display font-semibold text-espresso hover:text-brand-dark"
                >
                  {s.cafe_name ?? "Unknown cafe"}
                </Link>
                <span className="text-xs text-bark/50">
                  {new Date(s.created_at + "Z").toLocaleString("en-PH", {
                    dateStyle: "medium",
                    timeStyle: "short",
                    timeZone: "Asia/Manila",
                  })}
                </span>
              </div>

              <p className="mt-2 text-sm">
                <span className="font-semibold text-brand-dark">
                  {FIELD_LABELS[s.field] ?? s.field}
                </span>
                {s.suggested_value && (
                  <>
                    {" → "}
                    <span className="font-medium text-espresso">{s.suggested_value}</span>
                  </>
                )}
              </p>
              <p className="mt-1 text-xs italic leading-relaxed text-bark/70">“{s.note}”</p>

              <div className="mt-4 flex gap-2">
                <form action={resolveSuggestionAction}>
                  <input type="hidden" name="id" value={s.id} />
                  <input type="hidden" name="decision" value="apply" />
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 rounded-full bg-leaf px-4 py-2 text-xs font-semibold text-white transition hover:bg-green-700"
                  >
                    <Check className="size-3.5" strokeWidth={2.5} />
                    Apply
                  </button>
                </form>
                <form action={resolveSuggestionAction}>
                  <input type="hidden" name="id" value={s.id} />
                  <input type="hidden" name="decision" value="dismiss" />
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 rounded-full border border-sand px-4 py-2 text-xs font-semibold text-bark transition hover:border-red-500 hover:text-red-600"
                  >
                    <X className="size-3.5" strokeWidth={2.5} />
                    Dismiss
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
