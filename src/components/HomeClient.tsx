"use client";

import { useMemo, useState } from "react";
import { Search, Wifi, Sun, Snowflake } from "lucide-react";
import type { CafeWithRating } from "@/lib/types";
import { isOpenNow } from "@/lib/hours";
import { CafeCard } from "@/components/CafeCard";

type Filter = "open" | "wifi" | "outdoor" | "aircon";

const FILTERS: { key: Filter; label: string; test: (c: CafeWithRating) => boolean | null }[] = [
  { key: "open", label: "Open now", test: (c) => isOpenNow(c.opening_hours) },
  { key: "wifi", label: "Wi-Fi", test: (c) => c.wifi },
  { key: "outdoor", label: "Outdoor seating", test: (c) => c.outdoor_seating },
  { key: "aircon", label: "Air-conditioned", test: (c) => c.aircon },
];

export function HomeClient({ cafes }: { cafes: CafeWithRating[] }) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<Set<Filter>>(new Set());

  const toggle = (f: Filter) => {
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(f)) next.delete(f);
      else next.add(f);
      return next;
    });
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return cafes.filter((c) => {
      if (
        q &&
        !`${c.name} ${c.street ?? ""} ${c.barangay ?? ""} ${c.district ?? ""}`
          .toLowerCase()
          .includes(q)
      ) {
        return false;
      }
      for (const f of FILTERS) {
        if (!active.has(f.key)) continue;
        if (f.test(c) !== true) return false;
      }
      return true;
    });
  }, [cafes, query, active]);

  return (
    <div>
      <div className="sticky top-0 z-10 -mx-4 border-b border-latte bg-cream/95 px-4 pb-4 pt-4 backdrop-blur">
        <div className="mx-auto max-w-6xl">
          <label className="relative block">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-bark/50"
              strokeWidth={1.75}
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search cafes by name or area..."
              className="w-full rounded-full border border-sand bg-paper py-3 pl-12 pr-4 text-sm text-espresso placeholder:text-bark/40 focus:border-caramel focus:outline-none focus:ring-2 focus:ring-caramel/25"
            />
          </label>
          <div className="mt-3 flex flex-wrap gap-2">
            {FILTERS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => toggle(key)}
                aria-pressed={active.has(key)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
                  active.has(key)
                    ? "border-espresso bg-espresso text-cream"
                    : "border-sand bg-paper text-bark hover:border-caramel"
                }`}
              >
                {key === "wifi" && <Wifi className="size-3.5" strokeWidth={2} />}
                {key === "outdoor" && <Sun className="size-3.5" strokeWidth={2} />}
                {key === "aircon" && <Snowflake className="size-3.5" strokeWidth={2} />}
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8">
        <p className="mb-4 text-sm text-bark/60">
          {filtered.length === cafes.length
            ? `${cafes.length} cafes in Davao City`
            : `${filtered.length} of ${cafes.length} cafes`}
        </p>
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-sand bg-paper p-12 text-center">
            <p className="font-display text-lg font-semibold text-espresso">No cafes found</p>
            <p className="mt-1 text-sm text-bark/60">
              Try a different search term or remove some filters.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((cafe) => (
              <CafeCard key={cafe.id} cafe={cafe} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
