import { Wifi, Sun, Snowflake, Ban } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Amenity = {
  key: string;
  label: string;
  Icon: LucideIcon;
};

export const AMENITIES: Amenity[] = [
  { key: "wifi", label: "Wi-Fi", Icon: Wifi },
  { key: "outdoor_seating", label: "Outdoor seating", Icon: Sun },
  { key: "aircon", label: "Air-conditioned", Icon: Snowflake },
];

export function AmenityBadges({
  cafe,
}: {
  cafe: { wifi: boolean; outdoor_seating: boolean; aircon: boolean };
}) {
  const active = AMENITIES.filter((a) => cafe[a.key as "wifi"]);
  if (active.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      {active.map(({ key, label, Icon }) => (
        <span
          key={key}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-bark"
          title={label}
        >
          <Icon className="size-4 text-brand-dark" strokeWidth={1.75} />
          {label}
        </span>
      ))}
    </div>
  );
}

export function AmenityStatus({
  label,
  ok,
  Icon,
}: {
  label: string;
  ok: boolean;
  Icon: LucideIcon;
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ${
        ok ? "bg-latte text-bark" : "bg-transparent text-bark/40 line-through decoration-bark/30"
      }`}
    >
      {ok ? (
        <Icon className="size-4 text-brand-dark" strokeWidth={1.75} />
      ) : (
        <Ban className="size-4" strokeWidth={1.75} />
      )}
      {label}
    </span>
  );
}

export { Ban };
