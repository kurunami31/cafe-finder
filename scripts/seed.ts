import { config } from "dotenv";
config({ path: ".env.local" });
import { connect } from "./lib/db";

type OverpassElement = {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

const QUERY = `[out:json][timeout:180];
area[name="Davao City"][admin_level=6]->.searchArea;
nwr["amenity"="cafe"](area.searchArea);
out center;`;

async function fetchCafes(): Promise<OverpassElement[]> {
  const endpoints = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass.private.coffee/api/interpreter",
    "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
  ];
  for (const url of endpoints) {
    try {
      console.log(`Fetching from ${new URL(url).host}...`);
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "CafeFinderDavao/1.0 (cafe directory app)",
          Accept: "application/json",
        },
        body: `data=${encodeURIComponent(QUERY)}`,
        signal: AbortSignal.timeout(240_000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as { elements: OverpassElement[] };
      return json.elements;
    } catch (e) {
      console.warn(`Failed: ${(e as Error).message}`);
    }
  }
  throw new Error("All Overpass endpoints failed");
}


function cleanFacebook(v: string | undefined): string | null {
  if (!v) return null;
  const trimmed = v.trim();
  const bare = trimmed.match(/^[A-Za-z0-9._-]+$/);
  if (bare) return `https://www.facebook.com/${trimmed}`;
  return /^https?:\/\//.test(trimmed) ? trimmed : null;
}

function cleanInstagram(v: string | undefined): string | null {
  if (!v) return null;
  let trimmed = v.trim().replace(/^@/, "");
  const urlMatch = trimmed.match(/instagram\.com\/([A-Za-z0-9._]+)/);
  if (urlMatch) trimmed = urlMatch[1];
  return /^[A-Za-z0-9._]+$/.test(trimmed)
    ? `https://www.instagram.com/${trimmed}/`
    : /^https?:\/\//.test(trimmed)
      ? trimmed
      : null;
}

function bool(v: string | undefined): boolean {
  return v === "yes" || v === "true" || v === "1";
}

function cleanWebsite(v: string | undefined): string | null {
  if (!v) return null;
  const trimmed = v.trim();
  return /^https?:\/\//.test(trimmed) ? trimmed : `https://${trimmed}`;
}

async function main() {
  const elements = await fetchCafes();
  console.log(`Received ${elements.length} elements from Overpass`);

  const byOsmId = new Map<string, Record<string, unknown>>();
  let skipped = 0;

  for (const el of elements) {
    const tags = el.tags ?? {};
    const name = tags.name?.trim();
    if (!name) {
      skipped++;
      continue;
    }
    const lat = el.lat ?? el.center?.lat;
    const lon = el.lon ?? el.center?.lon;
    if (lat === undefined || lon === undefined) {
      skipped++;
      continue;
    }
    const osmId = `${el.type}/${el.id}`;
    byOsmId.set(osmId, {
      osm_id: osmId,
      name,
      street: tags["addr:street"] ?? null,
      barangay: tags["addr:barangay"] ?? null,
      district: tags["addr:district"] ?? null,
      postcode: tags["addr:postcode"] ?? null,
      lat,
      lng: lon,
      opening_hours: tags.opening_hours ?? null,
      website: cleanWebsite(tags.website ?? tags["contact:website"]),
      phone: tags.phone ?? tags["contact:phone"] ?? null,
      email: tags.email ?? tags["contact:email"] ?? null,
      facebook: cleanFacebook(
        tags["contact:facebook"] ?? tags.facebook
      ),
      instagram: cleanInstagram(
        tags["contact:instagram"] ?? tags.instagram
      ),
      cuisine: tags.cuisine ?? null,
      takeaway: bool(tags.takeaway),
      wifi: bool(tags.internet_access === "wlan" ? "yes" : tags.internet_access),
      outdoor_seating: bool(tags.outdoor_seating),
      aircon: bool(tags.air_conditioning),
    });
  }

  const rows = [...byOsmId.values()];
  console.log(`${rows.length} named cafes to upsert (${skipped} skipped)`);

  const client = await connect();
  try {
    for (let i = 0; i < rows.length; i += 100) {
      const batch = rows.slice(i, i + 100);
      const values: unknown[] = [];
      const tuples = batch
        .map((r, j) => {
          const keys = Object.keys(r);
          keys.forEach((k) => values.push(r[k]));
          const base = j * keys.length;
          return `(${keys.map((_, k) => `$${base + k + 1}`).join(",")})`;
        })
        .join(",");
      const columns = Object.keys(rows[0]).join(",");
      await client.query(
        `insert into public.cafes (${columns})
         values ${tuples}
         on conflict (osm_id) do update set
           name = excluded.name,
           street = excluded.street,
           barangay = excluded.barangay,
           district = excluded.district,
           postcode = excluded.postcode,
           lat = excluded.lat,
           lng = excluded.lng,
           opening_hours = excluded.opening_hours,
           website = excluded.website,
           phone = excluded.phone,
           cuisine = excluded.cuisine,
           wifi = excluded.wifi,
           outdoor_seating = excluded.outdoor_seating,
           aircon = excluded.aircon`,
        values
      );
      console.log(`Upserted rows ${i + 1}-${i + batch.length}`);
    }
    const { rows: countRows } = await client.query<{ count: string }>(
      "select count(*)::text as count from public.cafes"
    );
    console.log(`Done. Total cafes in database: ${countRows[0].count}`);
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
