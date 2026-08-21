"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { Heart, Coffee } from "lucide-react";
import type { CafeWithRating } from "@/lib/types";
import {
  getFavoritesSnapshot,
  getServerFavoritesSnapshot,
  subscribeFavorites,
} from "@/lib/favorites";
import { CafeCard } from "@/components/CafeCard";

export function FavoritesClient({ allCafes }: { allCafes: CafeWithRating[] }) {
  const ids = useSyncExternalStore(
    subscribeFavorites,
    getFavoritesSnapshot,
    getServerFavoritesSnapshot
  );
  const favorites = allCafes.filter((c) => ids.includes(c.id));

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
      <h1 className="font-display text-3xl font-semibold tracking-tight text-espresso sm:text-4xl">
        Your favorites
      </h1>
      <p className="mt-2 text-sm text-bark/70">
        Cafes you have saved on this device — stored locally, no account needed.
      </p>

      {favorites.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-sand bg-paper p-12 text-center animate-fade-in">
          <Heart className="mx-auto size-8 text-sand" strokeWidth={1.5} />
          <p className="mt-4 font-display text-lg font-semibold text-espresso">
            {ids.length === 0 ? "Nothing saved yet" : "Loading your favorites..."}
          </p>
          {ids.length === 0 && (
            <>
              <p className="mt-1 text-sm text-bark/60">
                Tap the heart icon on any cafe to keep it here.
              </p>
              <Link
                href="/cafes"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-brand-dark"
              >
                <Coffee className="size-4" strokeWidth={2} />
                Browse cafes
              </Link>
            </>
          )}
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map((cafe, i) => (
            <div
              key={cafe.id}
              className="h-full animate-rise"
              style={{ animationDelay: `${Math.min(i * 55, 500)}ms` }}
            >
              <CafeCard cafe={cafe} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
