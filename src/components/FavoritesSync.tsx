"use client";

import { useEffect, useRef } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { getFavoritesSnapshot } from "@/lib/favorites";
import { mergeFavoritesAction } from "@/app/login/actions";

export function FavoritesSync() {
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const supabase = getSupabaseBrowserClient();
    supabase.auth
      .getUser()
      .then(async (res: { data: { user: { id: string } | null } }) => {
        const localIds = getFavoritesSnapshot().filter((id) =>
          /^[0-9a-f-]{36}$/i.test(id)
        );
        if (res.data.user && localIds.length > 0) {
          await mergeFavoritesAction(localIds);
          try {
            localStorage.setItem("cf-favorites", JSON.stringify([]));
            window.dispatchEvent(new Event("cf-favorites-changed"));
            window.dispatchEvent(new Event("cf-favorites-merged"));
          } catch {}
        }
      })
      .catch(() => {});
  }, []);

  return null;
}
