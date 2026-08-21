"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Coffee, Info, MapPin } from "lucide-react";

export default function WelcomePage() {
  return (
    <div className="relative isolate flex min-h-[calc(100vh-69px)] flex-col overflow-hidden">
      <Image
        src="/bg-coffee.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="-z-10 object-cover animate-hero"
      />
      <div className="absolute inset-0 -z-10 bg-espresso/70" />

      <div className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
        <span className="inline-flex size-14 items-center justify-center rounded-full bg-white/10 text-brand ring-1 ring-white/25 backdrop-blur-sm animate-fade-in">
          <Coffee className="size-7" strokeWidth={1.5} />
        </span>

        <h1 className="mt-8 font-display text-5xl font-semibold tracking-tight text-white drop-shadow-md sm:text-7xl animate-rise [animation-delay:150ms]">
          Welcome to
          <span className="mt-2 block text-brand">Cafe Finder</span>
        </h1>

        <p className="mt-6 max-w-md text-base leading-relaxed text-white/85 sm:text-lg animate-rise [animation-delay:300ms]">
          Discover your perfect spot — {""}
          <span className="font-medium text-white">
            real cafes across Davao City,
          </span>{" "}
          mapped, filtered, and reviewed by people like you.
        </p>

        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row animate-rise [animation-delay:450ms]">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 rounded-full bg-brand px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand/30 transition-all hover:-translate-y-0.5 hover:bg-brand-dark"
          >
            Explore cafes
            <ArrowRight
              className="size-4 transition-transform group-hover:translate-x-0.5"
              strokeWidth={2}
            />
          </Link>
          <Link
            href="/about"
            className="inline-flex items-center gap-2 rounded-full border border-white/30 px-8 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-white/10"
          >
            <Info className="size-4" strokeWidth={2} />
            Learn more
          </Link>
        </div>
      </div>

      <p className="flex items-center justify-center gap-2 pb-8 text-xs font-medium uppercase tracking-[0.25em] text-white/60 animate-fade-in [animation-delay:700ms]">
        <MapPin className="size-3.5" strokeWidth={2} />
        Davao City, Philippines
      </p>
    </div>
  );
}
