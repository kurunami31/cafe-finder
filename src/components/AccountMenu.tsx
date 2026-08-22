"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, LogOut, UserRound } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { publicSignOutAction } from "@/app/login/actions";

export function AccountMenu() {
  const [email, setEmail] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    supabase.auth
      .getUser()
      .then(
        (
          res: {
            data: {
              user: {
                email: string | null;
                user_metadata?: { avatar_url?: string };
              } | null;
            };
          }
        ) => {
          setEmail(res.data.user?.email ?? null);
          setAvatarUrl(res.data.user?.user_metadata?.avatar_url ?? null);
          setChecked(true);
        },
        () => {
          setChecked(true);
        }
      );
    const {
      data: sub,
    } = supabase.auth.onAuthStateChange(
      (
        _event: string,
        session: {
          user: {
            email: string | null;
            user_metadata?: { avatar_url?: string };
          } | null;
        } | null
      ) => {
        setEmail(session?.user?.email ?? null);
        setAvatarUrl(session?.user?.user_metadata?.avatar_url ?? null);
      }
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  if (!checked) {
    return (
      <span
        className="size-9 animate-pulse rounded-full bg-latte"
        aria-hidden
      />
    );
  }

  if (!email) {
    return (
      <Link
        href="/login"
        className="flex items-center gap-1.5 rounded-full border border-sand bg-paper px-3 py-1.5 text-xs font-semibold text-bark transition hover:border-brand hover:text-brand-dark"
      >
        <UserRound className="size-4" strokeWidth={1.75} />
        Sign in
      </Link>
    );
  }

  const initial = email[0]?.toUpperCase() ?? "?";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        title={email}
        className="relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand text-sm font-bold text-white shadow-sm transition hover:-translate-y-px"
      >
        {avatarUrl ? (
          <Image
            key={avatarUrl}
            src={avatarUrl}
            alt="Your avatar"
            fill
            sizes="36px"
            className="object-cover"
            unoptimized
          />
        ) : (
          initial
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-30 mt-2 w-52 animate-rise overflow-hidden rounded-2xl border border-latte bg-paper p-1 shadow-lg"
        >
          <p className="truncate px-3 pb-1 pt-2 text-[11px] text-bark/60">{email}</p>
          <Link
            href="/account"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-bark transition hover:bg-latte hover:text-espresso"
          >
            <UserRound className="size-4" strokeWidth={1.75} />
            Profile settings
          </Link>
          <Link
            href="/favorites"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-bark transition hover:bg-latte hover:text-espresso"
          >
            <Heart className="size-4" strokeWidth={1.75} />
            My favorites
          </Link>
          <form action={publicSignOutAction}>
            <button
              type="submit"
              role="menuitem"
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium text-bark transition hover:bg-latte hover:text-espresso"
            >
              <LogOut className="size-4" strokeWidth={1.75} />
              Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
