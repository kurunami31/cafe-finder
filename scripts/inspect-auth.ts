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

  const schemas = await c.query(
    `select schema_name from information_schema.schemata order by schema_name`
  );
  console.log("SCHEMAS:", schemas.rows.map((r) => r.schema_name).join(", "));

  try {
    const m = await c.query(
      `select count(*)::int as n from supabase_migrations.schema_migrations`
    );
    console.log("supabase_migrations.schema_migrations rows:", m.rows[0].n);
  } catch (e) {
    console.log("MIGRATIONS TABLE MISSING:", (e as Error).message);
  }

  const authTables = await c.query(`
    select table_name from information_schema.tables
    where table_schema = 'auth' order by table_name
  `);
  console.log("AUTH TABLES:", authTables.rows.map((r) => r.table_name).join(", ") || "(none)");

  await c.end();
}

main().catch((e) => {
  console.error("FATAL:", e.message);
  process.exit(1);
});
