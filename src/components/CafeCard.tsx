import Link from "next/link";
import { Clock, MapPin } from "lucide-react";
import type { CafeWithRating } from "@/lib/types";
import { isOpenNow, formatAddress, formatNextChange } from "@/lib/hours";
import { RatingSummary } from "@/components/Stars";
import { AmenityBadges } from "@/components/AmenityBadges";
import { FavoriteButton } from "@/components/FavoriteButton";

export function CafeCard({ cafe }: { cafe: CafeWithRating }) {
  const open = isOpenNow(cafe.opening_hours);
  const hoursLabel = formatNextChange(cafe.opening_hours);
  return (
    <Link
      href={`/cafe/${cafe.id}`}
      className="group flex h-full flex-col rounded-2xl border border-latte bg-paper p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-sand hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-lg font-semibold leading-snug text-espresso group-hover:text-brand-dark">
          {cafe.name}
        </h3>
        <div className="flex shrink-0 items-center gap-1">
          <FavoriteButton cafeId={cafe.id} />
          <OpenBadge open={open} label={hoursLabel} />
        </div>
      </div>
      <p className="mt-1.5 flex items-start gap-1.5 text-sm text-bark/80">
        <MapPin className="mt-0.5 size-4 shrink-0 text-brand-dark" strokeWidth={1.75} />
        <span>{formatAddress(cafe) || cafe.barangay || "Davao City"}</span>
      </p>
      <div className="mt-3">
        <RatingSummary avg={cafe.rating_avg} count={cafe.review_count} />
      </div>
      <div className="mt-auto pt-3">
        <AmenityBadges cafe={cafe} />
      </div>
    </Link>
  );
}

function OpenBadge({ open, label }: { open: boolean | null; label: string | null }) {
  if (open === null) {
    return (
      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-latte/60 px-2.5 py-1 text-xs font-medium text-bark/60">
        <Clock className="size-3.5" strokeWidth={2} />
        Hours not listed
      </span>
    );
  }
  const text = label ?? (open ? "Open now" : "Closed");
  return open ? (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-leaf/15 px-2.5 py-1 text-xs font-semibold text-leaf">
      <span className="size-1.5 rounded-full bg-leaf" />
      {text}
    </span>
  ) : (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-espresso/5 px-2.5 py-1 text-xs font-medium text-bark/50">
      <span className="size-1.5 rounded-full bg-bark/40" />
      {text}
    </span>
  );
}
