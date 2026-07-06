import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  resetPromise: Promise<void> | null;
};

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const adapter = new PrismaPg({
    connectionString,
    max: 2,
    connectionTimeoutMillis: 5_000,
    idleTimeoutMillis: 300_000,
  });

  return new PrismaClient({ adapter });
}

function getPrismaClient() {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }

  return globalForPrisma.prisma;
}

export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrismaClient();
    const value = Reflect.get(client, prop, client);

    if (typeof value === "function") {
      return value.bind(client);
    }

    return value;
  },
});

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = getPrismaClient();
}

async function resetPrismaClient() {
  if (!globalForPrisma.resetPromise) {
    globalForPrisma.resetPromise = (async () => {
      if (globalForPrisma.prisma) {
        await globalForPrisma.prisma.$disconnect().catch(() => {});
        globalForPrisma.prisma = undefined;
      }
    })().finally(() => {
      globalForPrisma.resetPromise = null;
    });
  }

  await globalForPrisma.resetPromise;
}

export function isPrismaConnectionError(error: unknown) {
  if (error && typeof error === "object" && "code" in error) {
    const code = String((error as { code: unknown }).code);
    if (["ECONNREFUSED", "ECONNRESET", "P1001", "P1017", "P1008", "P2024"].includes(code)) {
      return true;
    }
  }

  if (!(error instanceof Error)) return false;

  return (
    error.message.includes("Server has closed the connection") ||
    error.message.includes("Connection terminated") ||
    error.message.includes("ConnectionClosed") ||
    error.message.includes("timeout exceeded when trying to connect") ||
    error.message.includes("ECONNREFUSED") ||
    error.message.includes("ECONNRESET") ||
    error.message.includes("Can't reach database server") ||
    error.message.includes("bind message supplies") ||
    error.message.includes("prepared statement")
  );
}

export async function withPrismaRetry<T>(query: () => Promise<T>, retries = 4): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await query();
    } catch (error) {
      lastError = error;

      if (attempt >= retries || !isPrismaConnectionError(error)) {
        throw error;
      }

      if (attempt >= retries - 1) {
        await resetPrismaClient();
      }

      await new Promise((resolve) => setTimeout(resolve, 250 * (attempt + 1)));
    }
  }

  throw lastError;
}
