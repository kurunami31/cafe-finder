import { config } from "dotenv";
config({ path: ".env.local" });
import { Client } from "pg";

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
  const r = await c.query(`
    select
      count(*) total,
      count(*) filter (where opening_hours is not null) with_hours,
      count(*) filter (where website is not null) with_website,
      count(*) filter (where phone is not null) with_phone,
      count(*) filter (where cuisine is not null) with_cuisine,
      count(*) filter (where wifi) with_wifi,
      count(*) filter (where outdoor_seating) with_outdoor,
      count(*) filter (where aircon) with_aircon,
      count(*) filter (where email is not null) with_email,
      count(*) filter (where facebook is not null) with_facebook,
      count(*) filter (where instagram is not null) with_instagram,
      count(*) filter (where takeaway) with_takeaway
    from public.cafes
  `);
  console.log(JSON.stringify(r.rows[0], null, 1));
  await c.end();
}

main();
