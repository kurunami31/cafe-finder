import Link from "next/link";
import { Coffee, MapPin, Heart, Compass } from "lucide-react";
import Image from "next/image";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <header className="sticky top-0 z-20 border-b border-latte bg-paper/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
          <Link href="/" className="flex shrink-0 items-center">
            <Image
              src="/logo.jpg"
              alt="Cafe Finder — Discover Your Perfect Spot"
              width={480}
              height={160}
              priority
              className="h-10 w-auto rounded-lg sm:h-11"
            />
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
        <div className="mx-auto max-w-6xl px-4 py-6 text-xs leading-relaxed text-bark/70">
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
