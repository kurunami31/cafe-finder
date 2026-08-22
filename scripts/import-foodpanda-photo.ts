import { config } from "dotenv";
config({ path: ".env.local" });
import { Client } from "pg";

// usage: npx tsx scripts/import-foodpanda-photo.ts "<cafe name in DB>" "<foodpanda URL>"
const [, , cafeName, listingUrl] = process.argv;

async function main() {
  if (!cafeName || !listingUrl) throw new Error("usage: <db cafe name> <foodpanda url>");

  const c = new Client({
    host: "aws-0-ap-northeast-2.pooler.supabase.com",
    port: 5432,
    user: "postgres.cprycbutatmjfkecqxjl",
    password: process.env.SUPABASE_DB_PASSWORD,
    database: "postgres",
    ssl: { rejectUnauthorized: false },
  });
  await c.connect();

  const { rows } = await c.query<{ id: string; name: string }>(
    `select id, name from public.cafes where name ilike $1 order by name`,
    [cafeName]
  );
  if (rows.length === 0) throw new Error(`No cafe matching "${cafeName}"`);
  const cafe = rows[0];

  const existing = await c.query(
    `select 1 from public.cafe_photos where cafe_id = $1 and approved limit 1`,
    [cafe.id]
  );
  if (existing.rowCount && existing.rowCount > 0) {
    console.log(`${cafe.name} already has photos - skipping`);
    await c.end();
    return;
  }

  console.log("Fetching listing page...");
  const res = await fetch(listingUrl, {
    headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
    signal: AbortSignal.timeout(30_000),
  });
  const html = await res.text();

  // vendor code (e.g. "cmiw") from the URL drives the hero image filename
  const codeMatch = listingUrl.match(/restaurant\/([a-z0-9]+)\//i);
  let imageUrl: string | null = null;
  if (codeMatch) {
    imageUrl = `https://images.deliveryhero.io/image/fd-ph/LH/${codeMatch[1].toLowerCase()}-listing.jpg`;
  } else {
    const m =
      html.match(/https:[^"'\s\\]+-listing\.jpe?g/) ??
      html.match(/https:[^"'\s\\]+\.jpe?g/g)?.find((u) => u.includes("deliveryhero")) ??
      null;
    imageUrl = m ?? null;
  }
  if (!imageUrl) throw new Error("No hero image found on page");

  console.log("Downloading:", imageUrl);
  const imgRes = await fetch(imageUrl, {
    headers: { "User-Agent": "Mozilla/5.0" },
    signal: AbortSignal.timeout(30_000),
  });
  if (!imgRes.ok) throw new Error(`image HTTP ${imgRes.status}`);
  const type = imgRes.headers.get("content-type") ?? "image/jpeg";
  const buf = Buffer.from(await imgRes.arrayBuffer());
  if (buf.length < 5_000) throw new Error("image too small / placeholder");
  console.log(`Downloaded ${(buf.length / 1024).toFixed(0)} KB (${type})`);

  const ext = type.includes("png") ? "png" : "jpg";
  const path = `pending/${cafe.id}/fp-${Date.now()}.${ext}`;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL!;
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
     values ($1, $2, true, 'foodpanda-import')`,
    [cafe.id, path]
  );
  console.log(`DONE "${cafe.name}" -> ${path}`);
  await c.end();
}

main().catch((e) => {
  console.error("FAILED:", e.message);
  process.exit(1);
});
