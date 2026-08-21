import { config } from "dotenv";
config({ path: ".env.local" });
import { Client } from "pg";

export const OSM_REF = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname.split(".")[0];

export async function connect(): Promise<Client> {
  const password = process.env.SUPABASE_DB_PASSWORD!;

  try {
    const direct = new Client({
      host: `db.${OSM_REF}.supabase.co`,
      port: 5432,
      user: "postgres",
      password,
      database: "postgres",
      ssl: { rejectUnauthorized: false },
    });
    await direct.connect();
    console.log("Connected via direct connection");
    return direct;
  } catch (e) {
    console.warn("Direct connection failed:", (e as Error).message);
  }

  const regions = [
    "ap-southeast-1",
    "ap-southeast-2",
    "us-east-1",
    "us-west-1",
    "eu-west-1",
    "ap-northeast-1",
    "eu-central-1",
    "sa-east-1",
  ];
  for (const region of regions) {
    const c = new Client({
      host: `aws-0-${region}.pooler.supabase.com`,
      port: 5432,
      user: `postgres.${OSM_REF}`,
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
