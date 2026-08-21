import { MapPin } from "lucide-react";
import { getCafesWithRatings } from "@/lib/queries";
import { HomeClient } from "@/components/HomeClient";

export const dynamic = "force-dynamic";

export default async function Home() {
  let cafes: Awaited<ReturnType<typeof getCafesWithRatings>> = [];
  let error: string | null = null;
  try {
    cafes = await getCafesWithRatings();
  } catch {
    error = "Could not load cafes. Please try again later.";
  }

  return (
    <div>
      <section className="border-b border-latte bg-paper">
        <div className="mx-auto max-w-6xl px-4 py-12 text-center sm:py-16">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-caramel-dark">
            Davao City, Philippines
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-espresso sm:text-5xl">
            Find your next favorite cafe
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-bark/70 sm:text-base">
            Browse {cafes.length > 0 ? `${cafes.length} ` : ""}cafes across the city. Search by
            name or neighborhood and filter for exactly what you need — Wi-Fi, outdoor seating,
            air-conditioning.
          </p>
        </div>
      </section>

      {error ? (
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="rounded-2xl border border-dashed border-sand bg-paper p-12 text-center">
            <MapPin className="mx-auto size-8 text-sand" strokeWidth={1.5} />
            <p className="mt-4 font-display text-lg font-semibold text-espresso">{error}</p>
          </div>
        </div>
      ) : (
        <HomeClient cafes={cafes} />
      )}
    </div>
  );
}
