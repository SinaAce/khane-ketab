import "dotenv/config";
import pg from "pg";

async function main() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error("DATABASE_URL is not set in .env");
    process.exit(1);
  }

  const pool = new pg.Pool({
    connectionString,
    max: 1,
    connectionTimeoutMillis: 5_000,
  });

  try {
    await pool.query("SELECT 1");
    console.log("Database connection OK");
  } catch (error) {
    console.error("Database not reachable.");
    console.error(error instanceof Error ? error.message : error);
    console.error("");
    console.error("Fix:");
    console.error("  1. Stop old dev DB: npx prisma dev stop ebook-marketplace");
    console.error("  2. Start fresh:     npm run db:dev");
    console.error("  3. Sync .env port:  npx prisma dev ls");
    process.exit(1);
  } finally {
    await pool.end();
  }
}

void main();
