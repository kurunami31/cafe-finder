import { Coffee, Database, Map as MapIcon } from "lucide-react";

export const metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="font-display text-3xl font-semibold tracking-tight text-espresso">
        About Cafe Finder
      </h1>
      <p className="mt-4 leading-relaxed text-bark">
        Cafe Finder is a simple directory of cafes in Davao City, Philippines. It exists to answer
        one question quickly: where can I get a good cup of coffee right now?
      </p>

      <ul className="mt-8 space-y-5">
        <li className="flex gap-4 rounded-2xl border border-latte bg-paper p-5">
          <Database className="mt-0.5 size-6 shrink-0 text-brand-dark" strokeWidth={1.5} />
          <div>
            <h2 className="font-semibold text-espresso">Where the listings come from</h2>
            <p className="mt-1 text-sm leading-relaxed text-bark/80">
              Cafe locations and details are sourced from{" "}
              <a
                href="https://www.openstreetmap.org"
                className="underline hover:text-brand-dark"
                target="_blank"
                rel="noreferrer"
              >
                OpenStreetMap
              </a>{" "}
              and stored in our own database for fast searching.
            </p>
          </div>
        </li>
        <li className="flex gap-4 rounded-2xl border border-latte bg-paper p-5">
          <MapIcon className="mt-0.5 size-6 shrink-0 text-brand-dark" strokeWidth={1.5} />
          <div>
            <h2 className="font-semibold text-espresso">Maps</h2>
            <p className="mt-1 text-sm leading-relaxed text-bark/80">
              Maps are rendered from OpenStreetMap tiles. Data &copy; OpenStreetMap contributors,
              available under the{" "}
              <a
                href="https://www.openstreetmap.org/copyright"
                className="underline hover:text-brand-dark"
                target="_blank"
                rel="noreferrer"
              >
                Open Database License
              </a>
              .
            </p>
          </div>
        </li>
        <li className="flex gap-4 rounded-2xl border border-latte bg-paper p-5">
          <Coffee className="mt-0.5 size-6 shrink-0 text-brand-dark" strokeWidth={1.5} />
          <div>
            <h2 className="font-semibold text-espresso">Reviews</h2>
            <p className="mt-1 text-sm leading-relaxed text-bark/80">
              Anyone can leave a rating and a short review — no account needed. Reviews reflect
              individual visitor experiences, not the opinions of this site.
            </p>
          </div>
        </li>
      </ul>
    </div>
  );
}
