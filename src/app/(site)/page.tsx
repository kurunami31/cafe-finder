import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin, Search, SlidersHorizontal, Star } from "lucide-react";
import { getCafesWithRatings } from "@/lib/queries";

export const dynamic = "force-dynamic";

const FEATURES = [
  {
    Icon: Search,
    title: "Search everything",
    text: "Look up any cafe by name, street, or barangay across Davao City.",
  },
  {
    Icon: SlidersHorizontal,
    title: "Filter your way",
    text: "Open now? Free Wi-Fi? Outdoor seating? Air-con? One tap away.",
  },
  {
    Icon: Star,
    title: "Real reviews",
    text: "Honest ratings from visitors — no accounts needed, just opinions.",
  },
];

export default async function Home() {
  let count = 0;
  try {
    count = (await getCafesWithRatings()).length;
  } catch {}

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
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/80 via-black/60 to-black/75" />
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
            Every cafe in Davao, one map
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-white/85 sm:text-base animate-rise [animation-delay:320ms]">
            {count > 0 ? `${count} real cafes` : "Hundreds of cafes"} at their real locations —
            discovered from open map data and enriched with visitor reviews.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row animate-rise [animation-delay:420ms]">
            <Link
              href="/cafes"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-brand px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-brand/25 transition hover:-translate-y-0.5 hover:bg-brand-dark"
            >
              Browse cafes
              <ArrowRight
                className="size-4 transition-transform group-hover:translate-x-0.5"
                strokeWidth={2}
              />
            </Link>
            <Link
              href="/welcome"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 px-7 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-white/10"
            >
              Back to welcome
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
        <div className="grid gap-5 sm:grid-cols-3">
          {FEATURES.map(({ Icon, title, text }, i) => (
            <div
              key={title}
              className="animate-rise rounded-2xl border border-latte bg-paper p-6 shadow-sm transition hover:-translate-y-1 hover:border-sand hover:shadow-md"
              style={{ animationDelay: `${i * 120}ms` }}
            >
              <span className="flex size-11 items-center justify-center rounded-xl bg-brand/10 text-brand-dark">
                <Icon className="size-5" strokeWidth={1.75} />
              </span>
              <h2 className="mt-4 font-display text-lg font-semibold text-espresso">{title}</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-bark/75">{text}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 text-center animate-fade-in [animation-delay:400ms]">
          <Link
            href="/cafes"
            className="group inline-flex items-center gap-2 font-display text-xl font-semibold text-espresso transition hover:text-brand-dark sm:text-2xl"
          >
            Start exploring all {count > 0 ? count : ""} cafes
            <ArrowRight
              className="size-5 transition-transform group-hover:translate-x-1"
              strokeWidth={2}
            />
          </Link>
        </div>
      </section>
    </div>
  );
}
