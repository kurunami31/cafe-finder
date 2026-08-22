import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  ArrowLeft,
  Clock,
  ExternalLink,
  Globe,
  MapPin,
  Phone,
  Snowflake,
  Sun,
  UtensilsCrossed,
  Wifi,
} from "lucide-react";
import { getCafe, getApprovedPhotos, getReviews } from "@/lib/queries";
import { formatAddress, formatNextChange, isOpenNow } from "@/lib/hours";
import MapClientWrapper from "@/components/Map";
import { Stars } from "@/components/Stars";
import { AmenityStatus } from "@/components/AmenityBadges";
import { ReviewForm } from "@/components/ReviewForm";
import { FavoriteButton } from "@/components/FavoriteButton";
import { SuggestPhotoForm } from "@/components/SuggestPhotoForm";

export const revalidate = 3600;

type Props = { params: Promise<{ id: string }> };

function locationLabel(cafe: {
  barangay: string | null;
  district: string | null;
}): string {
  return cafe.barangay ?? cafe.district ?? "Davao City";
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const cafe = await getCafe(id);
    if (cafe) {
    const reviews = await getReviews(id);
      const rating =
        reviews.length > 0
          ? ` Rated ${(
              Math.round(
                (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10
              ) / 10
            ).toFixed(1)}/5 by ${reviews.length} visitor${reviews.length !== 1 ? "s" : ""}.`
          : "";
      const description = `${cafe.name} — cafe in ${locationLabel(cafe)}, Davao City. ${formatAddress(cafe)}. Hours, amenities, map, and visitor reviews.${rating}`;
      return {
        title: cafe.name,
        description,
        openGraph: { title: `${cafe.name} | Cafe Finder Davao`, description },
        alternates: { canonical: `/cafe/${cafe.id}` },
      };
    }
  } catch {}
  return { title: "Cafe" };
}

function OpenStatus({ hours }: { hours: string | null }) {
  const open = isOpenNow(hours);
  const label = formatNextChange(hours);
  if (open === null && !label) {
    return <span className="text-sm italic text-bark/50">Hours not listed</span>;
  }
  const color = open === true ? "text-leaf" : "text-bark/60";
  const dot = open === true ? "bg-leaf" : "bg-bark/40";
  const text =
    label ?? (open ? "Open now" : "Closed right now");
  return (
    <span title={hours ?? undefined} className={`inline-flex items-center gap-2 text-sm font-semibold ${color}`}>
      <span className={`size-2 rounded-full ${dot}`} />
      {text}
    </span>
  );
}

export default async function CafePage({ params }: Props) {
  const { id } = await params;
  const cafe = await getCafe(id);
  if (!cafe) notFound();

  const reviews = await getReviews(id);
  const photos = await getApprovedPhotos(id);
  const reviewCount = reviews.length;
  const avg =
    reviewCount > 0
      ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviewCount) * 10) / 10
      : null;

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "CafeOrCoffeeShop",
    name: cafe.name,
    address: {
      "@type": "PostalAddress",
      streetAddress: cafe.street ?? undefined,
      addressLocality: "Davao City",
      addressRegion: "Davao del Sur",
      postalCode: cafe.postcode ?? undefined,
      addressCountry: "PH",
    },
    geo: { "@type": "GeoCoordinates", latitude: cafe.lat, longitude: cafe.lng },
    ...(cafe.opening_hours ? { openingHours: cafe.opening_hours } : {}),
    ...(cafe.website ? { url: cafe.website } : {}),
    ...(cafe.phone ? { telephone: cafe.phone } : {}),
    ...(avg !== null && reviewCount > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: avg,
            reviewCount,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-bark hover:text-brand-dark"
      >
        <ArrowLeft className="size-4" strokeWidth={2} />
        All cafes
      </Link>

      <div className="mt-5 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <FavoriteButton cafeId={cafe.id} size="lg" />
              <div>
                <h1 className="font-display text-3xl font-semibold tracking-tight text-espresso sm:text-4xl">
                  {cafe.name}
                </h1>
                <p className="mt-2 flex items-start gap-1.5 text-sm text-bark/80">
                  <MapPin
                    className="mt-0.5 size-4 shrink-0 text-brand-dark"
                    strokeWidth={1.75}
                  />
                  {formatAddress(cafe) || "Davao City"}
                  {cafe.postcode ? `, ${cafe.postcode}` : ""}
                </p>
              </div>
            </div>
            <OpenStatus hours={cafe.opening_hours} />
          </div>

          {reviewCount > 0 && avg !== null && (
            <div className="mt-4 flex items-center gap-2.5 rounded-xl bg-paper px-4 py-3">
              <Stars value={avg} className="size-4" />
              <span className="text-sm font-semibold text-espresso">{avg.toFixed(1)}</span>
              <span className="text-sm text-bark/60">
                · {reviewCount} review{reviewCount !== 1 ? "s" : ""}
              </span>
            </div>
          )}

          {photos.length > 0 && (
            <div className="mt-6 animate-fade-in">
              <Image
                src={photos[0]}
                alt={`Photo of ${cafe.name}`}
                width={1200}
                height={675}
                priority
                sizes="(max-width: 1024px) 100vw, 800px"
                className="h-60 w-full rounded-2xl border border-latte object-cover shadow-sm sm:h-96"
              />
              {photos.length > 1 && (
                <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-6">
                  {photos.slice(1, 7).map((url, i) => (
                    <Image
                      key={url}
                      src={url}
                      alt={`${cafe.name} photo ${i + 2}`}
                      width={320}
                      height={240}
                      sizes="160px"
                      className="h-20 w-full rounded-xl border border-latte object-cover"
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          <dl className="mt-6 space-y-3 rounded-2xl border border-latte bg-paper p-5 text-sm">
            {cafe.opening_hours && (
              <div className="flex items-start gap-3">
                <Clock className="mt-0.5 size-4 shrink-0 text-brand-dark" strokeWidth={1.75} />
                <div>
                  <dt className="sr-only">Opening hours</dt>
                  <dd className="font-medium text-espresso">{cafe.opening_hours}</dd>
                </div>
              </div>
            )}
            {cafe.phone && (
              <div className="flex items-start gap-3">
                <Phone className="mt-0.5 size-4 shrink-0 text-brand-dark" strokeWidth={1.75} />
                <div>
                  <dt className="sr-only">Phone</dt>
                  <dd>
                    <a href={`tel:${cafe.phone}`} className="text-bark hover:text-brand-dark">
                      {cafe.phone}
                    </a>
                  </dd>
                </div>
              </div>
            )}
            <div className="flex items-start gap-3">
                <Globe className="mt-0.5 size-4 shrink-0 text-brand-dark" strokeWidth={1.75} />
                <div>
                  <dt className="sr-only">Website</dt>
                  <dd>
                    {cafe.website ? (
                      <a
                        href={cafe.website.startsWith("http") ? cafe.website : `https://${cafe.website}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-bark hover:text-brand-dark"
                      >
                        Website
                        <ExternalLink className="size-3.5" strokeWidth={2} />
                      </a>
                    ) : (
                      <span className="italic text-bark/40">Not listed</span>
                    )}
                  </dd>
                </div>
            </div>
            {cafe.cuisine && (
              <div className="flex items-start gap-3">
                <UtensilsCrossed
                  className="mt-0.5 size-4 shrink-0 text-brand-dark"
                  strokeWidth={1.75}
                />
                <div>
                  <dt className="sr-only">Cuisine</dt>
                  <dd className="capitalize text-bark">{cafe.cuisine}</dd>
                </div>
              </div>
            )}
          </dl>

          <section className="mt-6">
            <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-bark/60">
              Amenities
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              <AmenityStatus label="Wi-Fi" ok={cafe.wifi} Icon={Wifi} />
              <AmenityStatus
                label="Outdoor seating"
                ok={cafe.outdoor_seating}
                Icon={Sun}
              />
              <AmenityStatus label="Air-conditioned" ok={cafe.aircon} Icon={Snowflake} />
            </div>
          </section>

          <section className="mt-10">
            <h2 className="font-display text-xl font-semibold text-espresso">
              Reviews ({reviewCount})
            </h2>
            <ul className="mt-4 space-y-4">
              {reviews.map((r) => (
                <li key={r.id} className="rounded-2xl border border-latte bg-paper p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-espresso">{r.display_name}</span>
                    <Stars value={r.rating} className="size-3.5" />
                  </div>
                  <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-bark">
                    {r.comment}
                  </p>
                  <p className="mt-2 text-xs text-bark/50">
                    {new Date(r.created_at + "Z").toLocaleDateString("en-PH", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      timeZone: "Asia/Manila",
                    })}
                  </p>
                </li>
              ))}
              {reviewCount === 0 && (
                <li className="rounded-2xl border border-dashed border-sand bg-paper p-6 text-sm italic text-bark/60">
                  No reviews yet — be the first to share your experience.
                </li>
              )}
            </ul>
          </section>

          <section className="mt-8 rounded-2xl border border-latte bg-paper p-6">
            <h2 className="mb-4 font-display text-xl font-semibold text-espresso">
              Write a review
            </h2>
            <ReviewForm cafeId={cafe.id} />
          </section>

          <section className="mt-6 rounded-2xl border border-latte bg-paper p-6">
            <SuggestPhotoForm cafeId={cafe.id} />
            <p className="mt-3 text-xs text-bark/50">
              Submissions are reviewed by a moderator before appearing publicly.
            </p>
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="overflow-hidden rounded-2xl border border-latte shadow-sm">
            <div className="h-72 lg:h-96">
              <MapClientWrapper lat={cafe.lat} lng={cafe.lng} name={cafe.name} />
            </div>
            <div className="bg-paper px-4 py-3 text-xs text-bark/70">
              <a
                href={`https://www.openstreetmap.org/?mlat=${cafe.lat}&mlon=${cafe.lng}#map=18/${cafe.lat}/${cafe.lng}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-medium hover:text-brand-dark"
              >
                View larger map
                <ExternalLink className="size-3" strokeWidth={2} />
              </a>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
