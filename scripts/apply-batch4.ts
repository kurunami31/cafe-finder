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

  const updates: [string, Record<string, unknown>][] = [
    ["Tomo Kopi", { takeaway: true }],
    ["Coffee Dream", { website: "https://coffeedreamco.wordpress.com" }],
  ];

  for (const [name, fields] of updates) {
    const { rows } = await c.query(`select id from public.cafes where name ilike $1`, [name]);
    if (rows.length >= 1) {
      await c.query(`update public.cafes set ${Object.keys(fields).map((k) => `${k} = $${1}`).join(", ")} where id = $2`, [
        ...Object.values(fields),
        rows[0].id,
      ]);
      console.log(`Updated "${name}" with`, fields);
    } else {
      console.log(`Skip "${name}" (${rows.length} matches)`);
    }
  }
  await c.end();
}

main();
