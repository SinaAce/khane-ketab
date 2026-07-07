import { prisma } from "@/lib/prisma";
import { normalizeEmail } from "@/lib/email-utils";

export async function findUserByEmail(email: string) {
  const normalized = normalizeEmail(email);

  return prisma.user.findFirst({
    where: {
      email: { equals: normalized, mode: "insensitive" },
    },
  });
}

export async function findUserIdByEmail(email: string) {
  const user = await findUserByEmail(email);
  return user?.id ?? null;
}
