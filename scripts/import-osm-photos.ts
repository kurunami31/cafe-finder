import { config } from "dotenv";
config({ path: ".env.local" });
import { Client } from "pg";

const OVERPASS = "https://overpass.kumi.systems/api/interpreter";
const QUERY = `[out:json][timeout:120];
area[name="Davao City"][admin_level=6]->.searchArea;
nwr["amenity"="cafe"]["image"](area.searchArea);
nwr["amenity"="cafe"]["wikimedia_commons"](area.searchArea);
out center tags;`;

type El = {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

function commonsUrl(title: string): string | null {
  const clean = title.replace(/^File:/i, "").trim();
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(clean)}?width=1200`;
}

const ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
];

async function queryOverpass(): Promise<{ elements: El[] }> {
  for (const url of ENDPOINTS) {
    try {
      console.log(`Querying ${new URL(url).host}...`);
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "CafeFinderDavao/1.0",
        },
        body: `data=${encodeURIComponent(QUERY)}`,
        signal: AbortSignal.timeout(180_000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return (await res.json()) as { elements: El[] };
    } catch (e) {
      console.log(`Failed: ${(e as Error).message}`);
    }
  }
  throw new Error("All Overpass endpoints failed");
}

async function main() {
  const json = await queryOverpass();

  const withImages = json.elements.filter(
    (e) => e.tags?.name && (e.tags.image || e.tags.wikimedia_commons)
  );
  console.log(`${withImages.length} cafes carry image tags in OSM`);

  const c = new Client({
    host: "aws-0-ap-northeast-2.pooler.supabase.com",
    port: 5432,
    user: "postgres.cprycbutatmjfkecqxjl",
    password: process.env.SUPABASE_DB_PASSWORD,
    database: "postgres",
    ssl: { rejectUnauthorized: false },
  });
  await c.connect();

  let ok = 0;
  for (const el of withImages) {
    const name = el.tags!.name;
    const { rows } = await c.query<{ id: string }>(
      `select id from public.cafes where osm_id = $1 limit 1`,
      [`${el.type}/${el.id}`]
    );
    if (rows.length === 0) continue;
    const cafeId = rows[0].id;

    const already = await c.query(`select 1 from public.cafe_photos where cafe_id = $1 and approved limit 1`, [cafeId]);
    if (existing.rowCount && existing.rowCount > 0) continue;

    const url = el.tags!.image?.startsWith("http")
      ? el.tags!.image
      : el.tags!.wikimedia_commons
        ? commonsUrl(el.tags!.wikimedia_commons)
        : null;
    if (!url || !/^https:\/\//.test(url)) continue;

    try {
      const imgRes = await fetch(url, {
        headers: { "User-Agent": "CafeFinderDavao/1.0 (photo import)" },
        signal: AbortSignal.timeout(30_000),
      });
      if (!imgRes.ok) throw new Error(`HTTP ${imgRes.status}`);
      const type = imgRes.headers.get("content-type") ?? "";
      if (!type.startsWith("image/")) throw new Error(`not an image (${type})`);
      const buf = Buffer.from(await imgRes.arrayBuffer());
      if (buf.length < 10_000) throw new Error("too small");
      if (buf.length > 5 * 1024 * 1024) throw new Error("too large");

      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      const base = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const ext = type.includes("png") ? "png" : type.includes("webp") ? "webp" : "jpg";
      const path = `approved/${cafeId}/osm-${el.id}.${ext}`;
      const up = await fetch(`${base}/storage/v1/object/cafe-photos/${path}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${anonKey}`,
          apikey: anonKey,
          "Content-Type": type,
          "x-upsert": "true",
        },
        body: new Uint8Array(buf),
      });
      if (!up.ok) throw new Error(`storage HTTP ${up.status}`);

      await c.query(
        `insert into public.cafe_photos (cafe_id, storage_path, approved, uploaded_by)
         values ($1, $2, true, 'osm-import')
         on conflict (storage_path) do nothing`,
        [cafeId, path]
      );
      ok++;
      console.log(`OK "${name}" <- ${url.slice(0, 90)}`);
    } catch (e) {
      console.log(`SKIP "${name}": ${(e as Error).message}`);
    }
  }

  await c.end();
  console.log(`\nImported ${ok} photo(s)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
