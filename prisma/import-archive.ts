import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { runArchiveImport } from "../src/lib/archive-import";

// Bypass broken system proxy (ECONNREFUSED 10.10.34.36)
process.env.NO_PROXY = "*";
delete process.env.HTTP_PROXY;
delete process.env.HTTPS_PROXY;
delete process.env.http_proxy;
delete process.env.https_proxy;

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Importing Persian books & podcasts from catalog...");

  const result = await runArchiveImport(prisma);

  console.log(
    `Done: ${result.catalogImported} from catalog (${result.totalCatalog} total, ${result.catalogSkipped} skipped) + ${result.onlineImported} from API.`,
  );
  console.log("Books use archive.org embed — works in browser without server download.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
