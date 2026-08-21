import { config } from "dotenv";
config({ path: ".env.local" });
import { readFileSync } from "node:fs";
import { connect } from "./lib/db";

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
