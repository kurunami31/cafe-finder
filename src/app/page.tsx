import Image from "next/image";
import { MapPin, Search } from "lucide-react";
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
      <section className="relative isolate overflow-hidden">
        <Image
          src="/bg-hero.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="-z-10 object-cover animate-hero"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-espresso/80 via-espresso/60 to-espresso/75" />
        <div className="mx-auto flex max-w-6xl flex-col items-center px-4 py-24 text-center sm:py-32">
          <Image
            src="/logo.jpg"
            alt="Cafe Finder logo"
            width={480}
            height={160}
            priority
            className="h-32 w-auto rounded-2xl shadow-xl shadow-black/30 ring-1 ring-white/20 sm:h-44 animate-fade-in"
          />
          <p className="mt-8 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-white/85 animate-rise [animation-delay:120ms]">
            <MapPin className="size-4" strokeWidth={2} />
            Davao City, Philippines
          </p>
          <h1 className="mt-4 max-w-2xl font-display text-4xl font-semibold leading-tight tracking-tight text-white drop-shadow-sm sm:text-6xl animate-rise [animation-delay:220ms]">
            Find your next favorite cafe
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-white/85 sm:text-base animate-rise [animation-delay:320ms]">
            {cafes.length > 0 ? `${cafes.length} real cafes` : "Hundreds of cafes"} across the city
            — search by name or neighborhood and filter for exactly what you need.
          </p>
          <a
            href="#browse"
            className="mt-9 inline-flex items-center gap-2 rounded-full bg-brand px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-brand/25 transition hover:-translate-y-0.5 hover:bg-brand-dark animate-rise [animation-delay:420ms]"
          >
            <Search className="size-4" strokeWidth={2} />
            Start browsing
          </a>
        </div>
      </section>

      <div id="browse">
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
    </div>
  );
}
