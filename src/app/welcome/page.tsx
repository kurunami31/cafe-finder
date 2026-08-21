import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Info } from "lucide-react";

export default function WelcomePage() {
  return (
    <div className="relative isolate flex h-dvh flex-col overflow-hidden">
      <Image
        src="/bg-coffee.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="-z-10 object-cover animate-hero"
      />
      <div className="absolute inset-0 -z-10 bg-black/70" />

      <div className="flex flex-1 flex-col items-center justify-center px-4 py-6 text-center">
        <span className="inline-flex size-12 items-center justify-center rounded-full bg-white/10 text-brand ring-1 ring-white/25 backdrop-blur-sm animate-fade-in sm:size-14">
          <svg viewBox="0 0 24 24" className="size-6 sm:size-7" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M15.5 9.5h1a1.75 1.75 0 0 1 0 3.5h-1" />
            <path d="M5.5 9.5h10v3.25a3 3 0 0 1-3 3h-4a3 3 0 0 1-3-3Z" />
          </svg>
        </span>

        <h1 className="mt-6 font-display text-4xl font-semibold leading-tight tracking-tight text-white drop-shadow-md sm:text-7xl animate-rise [animation-delay:150ms]">
          Welcome to
          <span className="mt-2 block text-brand">Cafe Finder</span>
        </h1>

        <p className="mt-5 max-w-md text-sm leading-relaxed text-white/85 sm:text-lg animate-rise [animation-delay:300ms]">
          Discover your perfect spot — real cafes across Davao City, mapped, filtered, and
          reviewed by people like you.
        </p>

        <div className="mt-9 flex w-full max-w-xs flex-col items-stretch gap-3 sm:w-auto sm:max-w-none sm:flex-row animate-rise [animation-delay:450ms]">
          <Link
            href="/cafes"
            className="group inline-flex items-center justify-center gap-2 rounded-full bg-brand px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand/30 transition-all hover:-translate-y-0.5 hover:bg-brand-dark"
          >
            Explore cafes
            <ArrowRight
              className="size-4 transition-transform group-hover:translate-x-0.5"
              strokeWidth={2}
            />
          </Link>
          <Link
            href="/about"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 px-8 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-white/10"
          >
            <Info className="size-4" strokeWidth={2} />
            Learn more
          </Link>
        </div>
      </div>

      <p className="pb-6 text-center text-[10px] font-medium uppercase tracking-[0.25em] text-white/60 sm:text-xs animate-fade-in [animation-delay:700ms]">
        Davao City, Philippines
      </p>
    </div>
  );
}
