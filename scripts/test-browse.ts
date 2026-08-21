import type { CafeWithRating } from "../src/lib/types";
import { filterAndSort } from "../src/lib/browse";

function cafe(partial: Partial<CafeWithRating>): CafeWithRating {
  return {
    id: partial.name ?? Math.random().toString(),
    osm_id: "n/1",
    name: "Cafe",
    street: null,
    barangay: null,
    district: null,
    postcode: null,
    lat: 7.07,
    lng: 125.61,
    opening_hours: null,
    website: null,
    phone: null,
    cuisine: null,
    wifi: false,
    outdoor_seating: false,
    aircon: false,
    rating_avg: null,
    review_count: 0,
    ...partial,
  };
}

const cafes = [
  cafe({ id: "1", name: "Zeta Coffee", rating_avg: 3, review_count: 2 }),
  cafe({ id: "2", name: "Alpha Brew", rating_avg: 5, review_count: 10 }),
  cafe({ id: "3", name: "Midway Cafe", rating_avg: 4, review_count: 7 }),
  cafe({ id: "4", name: "Beta Roasters" }),
  cafe({ id: "5", name: "Mocha Spot", wifi: true }),
];

let failures = 0;
function expect(name: string, actual: unknown[], wanted: string[]) {
  const ids = (actual as { name: string }[]).map((c) => c.name).join(", ");
  const ok = JSON.stringify(actual.map((c) => (c as { name: string }).name)) === JSON.stringify(wanted);
  console.log(`${ok ? "PASS" : "FAIL"} ${name} => [${ids}]`);
  if (!ok) failures++;
}

expect("name A-Z", filterAndSort(cafes, "", new Set(), "name"), [
  "Alpha Brew",
  "Beta Roasters",
  "Midway Cafe",
  "Mocha Spot",
  "Zeta Coffee",
]);

expect("top rated", filterAndSort(cafes, "", new Set(), "rating"), [
  "Alpha Brew",
  "Midway Cafe",
  "Zeta Coffee",
  "Beta Roasters",
  "Mocha Spot",
]);

expect("most reviewed", filterAndSort(cafes, "", new Set(), "reviews"), [
  "Alpha Brew",
  "Midway Cafe",
  "Zeta Coffee",
  "Beta Roasters",
  "Mocha Spot",
]);

expect("wifi filter", filterAndSort(cafes, "", new Set(["wifi"]), "name"), ["Mocha Spot"]);

expect("search query", filterAndSort(cafes, "mocha", new Set(), "name"), ["Mocha Spot"]);

process.exit(failures > 0 ? 1 : 0);
