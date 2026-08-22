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

  const { rows } = await c.query(
    `select id, name from public.cafes where name ilike 'Habi at Kape'`
  );
  if (rows.length === 1) {
    const r = await c.query(
      `update public.cafes
       set opening_hours = 'Mo-Su 09:00-20:30',
           wifi = true
       where id = $1`,
      [rows[0].id]
    );
    console.log(`Updated "${rows[0].name}" (${r.rowCount} row): hours + wifi`);
  } else {
    console.log("Ambiguous:", rows.length);
  }
  await c.end();
}

main();
