import Link from "next/link";
import { Coffee, MapPin, Heart, Compass } from "lucide-react";
import Image from "next/image";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <header className="sticky top-0 z-20 border-b border-latte bg-paper/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <Image
              src="/icon-emblem.png"
              alt="Cafe Finder"
              width={96}
              height={96}
              priority
              className="size-9 rounded-full object-cover sm:size-10"
            />
            <span className="font-display text-lg font-semibold tracking-tight text-espresso">
              Cafe Finder
            </span>
          </Link>
          <nav className="flex items-center gap-1 text-sm font-medium text-bark sm:gap-5">
            <NavLink href="/cafes" icon={<Coffee className="size-4" strokeWidth={1.75} />}>
              <span className="hidden sm:inline">Cafes</span>
            </NavLink>
            <NavLink href="/nearby" icon={<Compass className="size-4" strokeWidth={1.75} />}>
              <span className="hidden sm:inline">Nearby</span>
            </NavLink>
            <NavLink href="/favorites" icon={<Heart className="size-4" strokeWidth={1.75} />}>
              <span className="hidden sm:inline">Favorites</span>
            </NavLink>
            <NavLink href="/about" icon={<MapPin className="size-4" strokeWidth={1.75} />}>
              <span className="hidden sm:inline">About</span>
            </NavLink>
            <ThemeToggle />
          </nav>
        </div>
      </header>
      <main className="flex flex-1 flex-col">{children}</main>
      <footer className="border-t border-latte bg-paper">
        <div className="mx-auto max-w-6xl px-4 py-6 text-center text-xs leading-relaxed text-bark/70">
          <p>
            Cafe listings &copy; OpenStreetMap contributors, available under the{" "}
            <a
              href="https://www.openstreetmap.org/copyright"
              className="underline hover:text-brand-dark"
              target="_blank"
              rel="noreferrer"
            >
              ODbL
            </a>
            . Reviews by visitors of this site.
          </p>
          <p className="mt-2">
            Developed by{" "}
            <a
              href="https://kurunami31.github.io/Portfolio/"
              className="font-semibold underline decoration-sand underline-offset-2 hover:text-brand-dark"
              target="_blank"
              rel="noreferrer"
            >
              kurunami31
            </a>
          </p>
        </div>
      </footer>
    </>
  );
}

function NavLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-1.5 rounded-full px-3 py-2 transition hover:bg-latte hover:text-espresso"
    >
      {icon}
      {children}
    </Link>
  );
}
