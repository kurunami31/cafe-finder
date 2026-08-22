import { config } from "dotenv";
config({ path: ".env.local" });
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { Client } from "pg";

const PICS_DIR = process.argv[2] ?? "../Cafe Pics";

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/\.(jpe?g|png|webp)$/i, "")
    .replace(/[^a-z0-9]+/g, "");
}

async function main() {
  const c = new Client({
    host: "aws-0-ap-northeast-2.pooler.supabase.com",
    port: 5432,
    user: "postgres.cprycbutatmjfkecqxjl",
    password: process.env.SUPABASE_DB_PASSWORD,
    database: "postgres",
    ssl: { rejectUnauthorized: false },
  });
  await c.connect();

  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL!;

  const files = readdirSync(PICS_DIR).filter((f) =>
    /\.(jpe?g|png|webp)$/i.test(f)
  );
  console.log(`Found ${files.length} image(s) in ${PICS_DIR}`);

  const { rows: cafes } = await c.query<{ id: string; name: string }>(
    `select id, name from public.cafes where hidden = false order by name`
  );

  let ok = 0;
  const unmatched: string[] = [];

  for (const file of files) {
    const norm = normalize(file);
    const candidates = cafes.filter((cafe) => {
      const cn = normalize(cafe.name);
      return (
        cn === norm ||
        cn.includes(norm) ||
        norm.includes(cn) ||
        norm.replace(/[0-9]/g, "") === cn.replace(/[0-9]/g, "")
      );
    });

    if (candidates.length === 0) {
      unmatched.push(file);
      continue;
    }
    const cafe = candidates[0];

    // Skip if this cafe already has photos
    const existing = await c.query(
      `select 1 from public.cafe_photos where cafe_id = $1 and approved limit 1`,
      [cafe.id]
    );
    if (existing.rowCount && existing.rowCount > 0) {
      console.log(`SKIP "${cafe.name}" (already has photos)`);
      continue;
    }

    const bytes = readFileSync(join(PICS_DIR, file));
    const ext = /\.png$/i.test(file) ? "png" : /\.webp$/i.test(file) ? "webp" : "jpg";
    const path = `pending/${cafe.id}/${Date.now()}-${norm.slice(0, 24)}.${ext}`;

    const res = await fetch(`${base}/storage/v1/object/cafe-photos/${path}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${anonKey}`,
        apikey: anonKey,
        "Content-Type": `image/${ext}`,
        "x-upsert": "true",
      },
      body: new Uint8Array(bytes),
    });
    if (!res.ok) {
      console.log(`UPLOAD FAILED for "${file}": HTTP ${res.status}`);
      continue;
    }

    await c.query(
      `insert into public.cafe_photos (cafe_id, storage_path, approved, uploaded_by)
       values ($1, $2, true, 'admin')`,
      [cafe.id, path]
    );
    console.log(`OK "${cafe.name}" <- ${file}`);
    ok++;
  }

  await c.end();
  console.log(`\nDone: ${ok} uploaded, ${unmatched.length} unmatched`);
  if (unmatched.length > 0) {
    console.log("Unmatched (no name similarity):");
    for (const u of unmatched) console.log("  -", u);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
