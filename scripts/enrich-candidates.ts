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
  const r = await c.query<{ id: string; name: string }>(`
    select id, name
    from public.cafes
    where hidden = false
      and opening_hours is null
      and website is null
      and phone is null
      and not exists (
        select 1 from public.cafe_photos p
        where p.cafe_id = cafes.id and p.approved
      )
    order by random()
    limit $1
  `, [Number(process.argv[2] ?? 10)]);
  console.log(JSON.stringify(r.rows));
  await c.end();
}

main();
