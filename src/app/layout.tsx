import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import Link from "next/link";
import Image from "next/image";
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
            <Link href="/" className="flex items-center">
              <Image
                src="/logo.jpg"
                alt="Cafe Finder — Discover Your Perfect Spot"
                width={480}
                height={160}
                priority
                className="h-12 w-auto rounded-xl"
              />
            </Link>
            <nav className="flex items-center gap-5 text-sm font-medium text-bark">
              <Link href="/welcome" className="hover:text-brand-dark">
                Welcome
              </Link>
              <Link href="/about" className="hover:text-brand-dark">
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
      </body>
    </html>
  );
}
