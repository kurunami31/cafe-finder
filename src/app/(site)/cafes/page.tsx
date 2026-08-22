import { MapPin } from "lucide-react";
import { getCafesWithRatings } from "@/lib/queries";
import { HomeClient } from "@/components/HomeClient";

export const revalidate = 300;

export const metadata = {
  title: "Browse Cafes",
};

export default async function CafesPage() {
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
        <div className="mx-auto max-w-6xl px-4 py-10 text-center sm:py-14 animate-fade-in">
          <p className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-brand-dark">
            <MapPin className="size-4" strokeWidth={2} />
            Davao City, Philippines
          </p>
          <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-espresso sm:text-5xl">
            Find your next favorite cafe
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-bark/70 sm:text-base">
            Search by name or neighborhood and filter for exactly what you need — Wi-Fi,
            outdoor seating, air-conditioning.
          </p>
        </div>
      </section>

      {error ? (
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="rounded-2xl border border-dashed border-sand bg-paper p-12 text-center animate-fade-in">
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
