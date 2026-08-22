"use client";

import { useState } from "react";
import { Check, Link2, Share2 } from "lucide-react";

export function ShareButton({ name }: { name: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = window.location.href;
    if ("share" in navigator) {
      try {
        await navigator.share({
          title: `${name} — Cafe Finder Davao`,
          text: `Check out ${name} on Cafe Finder Davao`,
          url,
        });
        return;
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  return (
    <button
      type="button"
      onClick={share}
      title="Share this cafe"
      aria-label="Share this cafe"
      className="flex size-7 items-center justify-center rounded-full text-bark/40 transition hover:bg-latte hover:text-brand-dark"
    >
      {copied ? (
        <Check className="size-4 text-leaf" strokeWidth={2} />
      ) : "share" in navigator ? (
        <Share2 className="size-4" strokeWidth={1.75} />
      ) : (
        <Link2 className="size-4" strokeWidth={1.75} />
      )}
    </button>
  );
}
