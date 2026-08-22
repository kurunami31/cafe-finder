"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { Compass, LocateFixed, LoaderCircle, ShieldAlert, RefreshCcw } from "lucide-react";
import type { CafeWithRating } from "@/lib/types";
import { formatAddress, isOpenNow } from "@/lib/hours";
import { RatingSummary } from "@/components/Stars";

const emptySubscribe = (cb: () => void) => () => {
  void cb;
};

function getInsecure(): boolean {
  return (
    typeof window !== "undefined" &&
    !window.isSecureContext &&
    window.location.hostname !== "localhost"
  );
}

function getInsecureServer(): boolean {
  return false;
}

function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
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
  | { status: "error"; message: string; hint?: string }
  | { status: "ready"; lat: number; lng: number };

function enableHint(): string {
  const ua = navigator.userAgent || "";
  if (/iPhone|iPad|iPod/i.test(ua)) {
    return 'On iPhone: open Settings → Safari (or your browser app) → Location → allow "While Using". Then reload this page.';
  }
  if (/Android/i.test(ua)) {
    return 'On Android: tap the lock/icon left of the address bar → Permissions → Location → Allow. Then reload this page.';
  }
  return "Check your browser's site settings and allow location access, then reload this page.";
}

export function NearbyClient({ allCafes }: { allCafes: CafeWithRating[] }) {
  const [state, setState] = useState<State>({ status: "idle" });
  const insecure = useSyncExternalStore(
    emptySubscribe,
    getInsecure,
    getInsecureServer
  );

  const locate = () => {
    if (!("geolocation" in navigator)) {
      setState({ status: "error", message: "Your browser does not support location services." });
      return;
    }
    if (!window.isSecureContext && window.location.hostname !== "localhost") {
      setState({
        status: "error",
        message:
          "Your browser blocks location on non-HTTPS pages. Open the https:// version of this site and try again.",
        hint: enableHint(),
      });
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
      async (err) => {
        let hint: string | undefined;
        if (err.code === err.PERMISSION_DENIED) {
          try {
            const perm = await navigator.permissions?.query({ name: "geolocation" as PermissionName });
            hint =
              perm?.state === "denied"
                ? enableHint()
                : "You dismissed the permission prompt. Tap the button again and choose Allow.";
          } catch {
            hint = enableHint();
          }
        } else {
          hint = "Make sure location services are enabled on your device, then try again.";
        }
        setState({
          status: "error",
          message:
            err.code === err.PERMISSION_DENIED
              ? "Location permission was denied."
              : err.code === err.POSITION_UNAVAILABLE
                ? "Your location could not be determined right now."
                : "Location request timed out.",
          hint,
        });
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 60000 }
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

      {insecure && state.status !== "ready" && (
        <div className="mt-6 rounded-2xl border border-latte bg-paper p-5 animate-fade-in">
          <p className="flex items-start gap-2 text-sm font-semibold text-red-700 dark:text-red-400">
            <ShieldAlert className="mt-0.5 size-4 shrink-0" strokeWidth={2} />
            Location features only work on secure (HTTPS) connections. Please open this site
            using its https:// address.
          </p>
        </div>
      )}

      {!insecure && (state.status === "idle" || state.status === "error") && (
        <button
          type="button"
          onClick={locate}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand px-7 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-brand-dark animate-rise"
        >
          <LocateFixed className="size-4" strokeWidth={2} />
          Find cafes near me
        </button>
      )}

      {state.status === "locating" && (
        <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-sand bg-paper px-5 py-3 text-sm font-medium text-bark animate-fade-in">
          <LoaderCircle className="size-4 animate-spin text-brand-dark" strokeWidth={2} />
          Waiting for permission — check your screen and tap Allow...
        </p>
      )}

      {state.status === "error" && (
        <div className="mt-6 rounded-2xl border border-latte bg-paper p-5 animate-fade-in">
          <p className="flex items-start gap-2 text-sm font-semibold text-red-700 dark:text-red-400">
            <ShieldAlert className="mt-0.5 size-4 shrink-0" strokeWidth={2} />
            {state.message}
          </p>
          {state.hint && (
            <p className="mt-2 pl-6 text-sm leading-relaxed text-bark/75">{state.hint}</p>
          )}
          <button
            type="button"
            onClick={locate}
            className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-sand px-4 py-2 text-xs font-semibold text-bark transition hover:border-brand hover:text-brand-dark"
          >
            <RefreshCcw className="size-3.5" strokeWidth={2} />
            Try again
          </button>
        </div>
      )}

      {state.status === "ready" && (
        <>
          <p className="mt-8 flex items-center gap-2 text-sm font-semibold text-leaf">
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
