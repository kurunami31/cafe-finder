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

  // Verify identity before updating
  const { rows } = await c.query(
    `select id, name, street, barangay, district from public.cafes where name ilike 'Delicake%'`
  );
  console.log("Matched rows:", JSON.stringify(rows));

  if (rows.length === 1) {
    const r = await c.query(
      `update public.cafes
       set opening_hours = 'Mo-Su 10:00-20:00',
           takeaway = true
       where id = $1`,
      [rows[0].id]
    );
    console.log(`Updated ${r.rowCount} row(s)`);
  } else {
    console.log("Ambiguous match - no update applied");
  }
  await c.end();
}

main();
