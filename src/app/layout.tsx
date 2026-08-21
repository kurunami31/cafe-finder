import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import Link from "next/link";
import { Coffee } from "lucide-react";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Cafe Finder Davao",
    template: "%s | Cafe Finder Davao",
  },
  description:
    "Discover cafes across Davao City — search by name or neighborhood, filter by Wi-Fi, outdoor seating and more.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <header className="border-b border-latte bg-paper">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex size-9 items-center justify-center rounded-full bg-espresso text-cream">
                <Coffee className="size-5" strokeWidth={1.75} />
              </span>
              <span className="font-display text-xl font-semibold tracking-tight text-espresso">
                Cafe Finder
                <span className="ml-2 hidden rounded-full bg-latte px-2 py-0.5 align-middle text-xs font-medium tracking-wide text-bark sm:inline">
                  DAVAO CITY
                </span>
              </span>
            </Link>
            <nav className="text-sm font-medium text-bark">
              <Link href="/about" className="hover:text-caramel-dark">
                About
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-latte bg-paper">
          <div className="mx-auto max-w-6xl px-4 py-6 text-xs leading-relaxed text-bark/70">
            <p>
              Cafe listings &copy; OpenStreetMap contributors, available under the{" "}
              <a
                href="https://www.openstreetmap.org/copyright"
                className="underline hover:text-caramel-dark"
                target="_blank"
                rel="noreferrer"
              >
                ODbL
              </a>
              . Reviews by visitors of this site.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
