import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
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
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://findcafe.vercel.app"
  ),
  title: {
    default: "Cafe Finder Davao",
    template: "%s | Cafe Finder Davao",
  },
  description:
    "Discover cafes across Davao City — search by name or neighborhood, filter by Wi-Fi, outdoor seating and more.",
  openGraph: {
    type: "website",
    siteName: "Cafe Finder Davao",
    locale: "en_PH",
    url: "/",
    title: "Cafe Finder Davao",
    description:
      "381+ real cafes across Davao City — search, filter by Wi-Fi, outdoor seating, air-conditioning, and read visitor reviews.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cafe Finder Davao",
    description:
      "Discover cafes across Davao City — search, filter, and read visitor reviews.",
  },
  verification: {
    google: "YJcsh9_nRVIxsfYAS7PkB3qe-_mmtaQ4w3PoxibWFgk",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf7f1" },
    { media: "(prefers-color-scheme: dark)", color: "#16110d" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("cf-theme");if(!t){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}if(t==="dark"){document.documentElement.classList.add("dark");}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans overflow-x-hidden">{children}</body>
    </html>
  );
}
