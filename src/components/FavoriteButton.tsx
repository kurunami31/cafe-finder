"use client";

import { useSyncExternalStore } from "react";
import { Heart } from "lucide-react";
import {
  getFavoritesSnapshot,
  getServerFavoritesSnapshot,
  subscribeFavorites,
  toggleFavorite,
} from "@/lib/favorites";
import { toggleServerFavoriteIfSignedIn } from "@/app/login/actions";

export function FavoriteButton({
  cafeId,
  size = "sm",
}: {
  cafeId: string;
  size?: "sm" | "lg";
}) {
  const favorites = useSyncExternalStore<string[]>(
    subscribeFavorites,
    getFavoritesSnapshot,
    getServerFavoritesSnapshot
  );
  const fav = favorites.includes(cafeId);

  const click = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(cafeId);
    void toggleServerFavoriteIfSignedIn(cafeId).catch(() => {});
  };

  return (
    <button
      type="button"
      onClick={click}
      aria-pressed={fav}
      aria-label={fav ? "Remove from favorites" : "Save to favorites"}
      title={fav ? "Remove from favorites" : "Save to favorites"}
      className={`flex shrink-0 items-center justify-center rounded-full transition-all duration-200 hover:scale-110 active:scale-95 ${
        size === "lg" ? "size-11 border border-latte bg-paper" : "size-8"
      } ${fav ? "text-red-500" : "text-bark/40 hover:text-red-400"}`}
    >
      <Heart
        className={size === "lg" ? "size-5" : "size-[18px]"}
        strokeWidth={1.75}
        fill={fav ? "currentColor" : "none"}
      />
    </button>
  );
}
