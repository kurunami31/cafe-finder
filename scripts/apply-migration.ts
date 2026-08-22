import { config } from "dotenv";
config({ path: ".env.local" });
import { readFileSync } from "node:fs";
import { connect } from "./lib/db";

async function main() {
  const file = process.argv[2] ?? "./migration-photos.sql";
  const sql = readFileSync(file, "utf8");
  const client = await connect();
  try {
    await client.query(sql);
    console.log(`Migration ${file} applied successfully`);
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
