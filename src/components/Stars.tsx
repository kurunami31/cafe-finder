import { Star, StarHalf } from "lucide-react";

export function Stars({ value, className = "size-4" }: { value: number; className?: string }) {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => {
        if (i < full) {
          return (
            <Star key={i} className={`${className} fill-caramel text-caramel`} strokeWidth={1} />
          );
        }
        if (i === full && half) {
          return (
            <span key={i} className="relative inline-flex">
              <Star className={`${className} text-sand`} strokeWidth={1.5} />
              <StarHalf
                className={`absolute inset-0 ${className} fill-caramel text-caramel`}
                strokeWidth={1}
              />
            </span>
          );
        }
        return <Star key={i} className={`${className} text-sand`} strokeWidth={1.5} />;
      })}
    </span>
  );
}

export function RatingSummary({
  avg,
  count,
}: {
  avg: number | null;
  count: number;
}) {
  if (count === 0 || avg === null) {
    return <span className="text-xs italic text-bark/50">No reviews yet</span>;
  }
  return (
    <span className="inline-flex items-center gap-1.5">
      <Stars value={avg} className="size-3.5" />
      <span className="text-xs font-semibold text-bark">{avg.toFixed(1)}</span>
      <span className="text-xs text-bark/60">({count})</span>
    </span>
  );
}
