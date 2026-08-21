import { config } from "dotenv";
config({ path: ".env.local" });
import { readFileSync } from "node:fs";
import { Client } from "pg";

const ref = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname.split(".")[0];
const password = process.env.SUPABASE_DB_PASSWORD!;

async function connect(): Promise<Client> {
  const direct = new Client({
    host: `db.${ref}.supabase.co`,
    port: 5432,
    user: "postgres",
    password,
    database: "postgres",
    ssl: { rejectUnauthorized: false },
  });
  try {
    await direct.connect();
    console.log("Connected via direct connection");
    return direct;
  } catch (e) {
    console.warn("Direct connection failed, trying session pooler:", (e as Error).message);
  }
  // Fallback: discover pooler region via Supabase REST health? Use generic region guess list.
  const regions = [
    "ap-southeast-1",
    "ap-southeast-2",
    "us-east-1",
    "us-west-1",
    "eu-west-1",
    "ap-northeast-1",
  ];
  for (const region of regions) {
    const c = new Client({
      host: `aws-0-${region}.pooler.supabase.com`,
      port: 5432,
      user: `postgres.${ref}`,
      password,
      database: "postgres",
      ssl: { rejectUnauthorized: false },
    });
    try {
      await c.connect();
      console.log(`Connected via pooler (${region})`);
      return c;
    } catch (e) {
      console.warn(`pooler ${region} failed:`, (e as Error).message);
    }
  }
  throw new Error("Could not connect to database");
}

async function main() {
  const sql = readFileSync(new URL("./schema.sql", import.meta.url), "utf8");
  const client = await connect();
  try {
    await client.query(sql);
    console.log("Schema applied successfully");
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
