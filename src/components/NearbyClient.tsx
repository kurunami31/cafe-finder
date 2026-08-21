"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Compass, LocateFixed, LoaderCircle } from "lucide-react";
import type { CafeWithRating } from "@/lib/types";
import { formatAddress, isOpenNow } from "@/lib/hours";
import { RatingSummary } from "@/components/Stars";

function distanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

type State =
  | { status: "idle" }
  | { status: "locating" }
  | { status: "error"; message: string }
  | { status: "ready"; lat: number; lng: number };

export function NearbyClient({ allCafes }: { allCafes: CafeWithRating[] }) {
  const [state, setState] = useState<State>({ status: "idle" });

  const locate = () => {
    if (!("geolocation" in navigator)) {
      setState({ status: "error", message: "Your browser does not support location services." });
      return;
    }
    setState({ status: "locating" });
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setState({
          status: "ready",
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }),
      (err) => {
        const messages: Record<number, string> = {
          1: "Location permission was denied. Enable it in your browser settings to use this feature.",
          2: "Your location could not be determined. Please try again.",
          3: "Location request timed out. Please try again.",
        };
        setState({
          status: "error",
          message: messages[err.code] ?? "Something went wrong finding your location.",
        });
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  };

  const nearest = useMemo(() => {
    if (state.status !== "ready") return [];
    return allCafes
      .map((c) => ({
        cafe: c,
        km: distanceKm(state.lat, state.lng, c.lat, c.lng),
      }))
      .sort((a, b) => a.km - b.km)
      .slice(0, 15);
  }, [allCafes, state]);

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
      <h1 className="font-display text-3xl font-semibold tracking-tight text-espresso sm:text-4xl">
        Cafes near you
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-bark/70">
        Share your location once and we will sort the closest cafes to you, nearest first.
        Your location never leaves your device.
      </p>

      {state.status !== "ready" && (
        <button
          type="button"
          onClick={locate}
          disabled={state.status === "locating"}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand px-7 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-brand-dark disabled:pointer-events-none disabled:opacity-60 animate-rise"
        >
          {state.status === "locating" ? (
            <LoaderCircle className="size-4 animate-spin" strokeWidth={2} />
          ) : (
            <LocateFixed className="size-4" strokeWidth={2} />
          )}
          {state.status === "locating" ? "Finding you..." : "Find cafes near me"}
        </button>
      )}

      {state.status === "error" && (
        <p className="mt-5 rounded-xl bg-red-900/5 px-4 py-3 text-sm font-medium text-red-900 dark:bg-red-400/10 dark:text-red-300">
          {state.message}
        </p>
      )}

      {state.status === "ready" && (
        <>
          <p className="mt-8 flex items-center gap-2 text-sm font-semibold text-leaf dark:text-leaf">
            <Compass className="size-4" strokeWidth={2} />
            Showing {nearest.length} closest cafes
          </p>
          <ol className="mt-4 space-y-3">
            {nearest.map(({ cafe, km }, i) => {
              const open = isOpenNow(cafe.opening_hours);
              return (
                <li key={cafe.id} className="animate-rise" style={{ animationDelay: `${Math.min(i * 50, 500)}ms` }}>
                  <Link
                    href={`/cafe/${cafe.id}`}
                    className="flex items-center gap-4 rounded-2xl border border-latte bg-paper p-4 transition hover:-translate-y-0.5 hover:border-sand hover:shadow-md"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-latte text-sm font-bold text-bark">
                      {i + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-display font-semibold text-espresso">
                        {cafe.name}
                      </span>
                      <span className="block truncate text-xs text-bark/70">
                        {formatAddress(cafe) || "Davao City"}
                      </span>
                      <span className="mt-1 block">
                        <RatingSummary avg={cafe.rating_avg} count={cafe.review_count} />
                      </span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="block text-sm font-bold text-brand-dark">
                        {km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`}
                      </span>
                      <span
                        className={`mt-1 block text-[10px] font-semibold uppercase tracking-wide ${
                          open === null ? "text-bark/40" : open ? "text-leaf" : "text-bark/50"
                        }`}
                      >
                        {open === null ? "No hours" : open ? "Open" : "Closed"}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </>
      )}
    </div>
  );
}
