import type { CafeWithRating } from "@/lib/types";
import { isOpenNow } from "@/lib/hours";

export type SortKey = "name" | "rating" | "reviews";
export type FilterKey = "open" | "wifi" | "outdoor" | "aircon";

export const FILTER_TESTS: Record<FilterKey, (c: CafeWithRating) => boolean | null> = {
  open: (c) => isOpenNow(c.opening_hours),
  wifi: (c) => c.wifi,
  outdoor: (c) => c.outdoor_seating,
  aircon: (c) => c.aircon,
};

export const SORT_LABELS: Record<SortKey, string> = {
  name: "Name A–Z",
  rating: "Top rated",
  reviews: "Most reviewed",
};

export const SORT_COMPARATORS: Record<SortKey, (a: CafeWithRating, b: CafeWithRating) => number> = {
  name: (a, b) => a.name.localeCompare(b.name),
  rating: (a, b) =>
    (b.rating_avg ?? 0) - (a.rating_avg ?? 0) ||
    b.review_count - a.review_count ||
    a.name.localeCompare(b.name),
  reviews: (a, b) =>
    b.review_count - a.review_count ||
    (b.rating_avg ?? 0) - (a.rating_avg ?? 0) ||
    a.name.localeCompare(b.name),
};

export function filterAndSort(
  cafes: CafeWithRating[],
  query: string,
  active: Set<FilterKey>,
  sort: SortKey
): CafeWithRating[] {
  const q = query.trim().toLowerCase();
  const result = cafes.filter((c) => {
    if (
      q &&
      !`${c.name} ${c.street ?? ""} ${c.barangay ?? ""} ${c.district ?? ""}`
        .toLowerCase()
        .includes(q)
    ) {
      return false;
    }
    for (const key of active) {
      if (FILTER_TESTS[key](c) !== true) return false;
    }
    return true;
  });
  return result.sort(SORT_COMPARATORS[sort]);
}

export function hasAnyReviews(cafes: CafeWithRating[]): boolean {
  return cafes.some((c) => c.review_count > 0);
}
