import { createHash, randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function createResetTokenValue() {
  return randomBytes(32).toString("hex");
}

export async function clearPasswordResetTokens(userId: string) {
  try {
    if (!("passwordResetToken" in prisma)) return;
    await prisma.passwordResetToken.deleteMany({ where: { userId } });
  } catch (error) {
    console.warn("[password-reset] Could not clear tokens:", error);
  }
}

export async function createPasswordResetToken(userId: string) {
  const token = createResetTokenValue();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

  await clearPasswordResetTokens(userId);
  await prisma.passwordResetToken.create({
    data: { userId, tokenHash, expiresAt },
  });

  return { token, expiresAt };
}

export async function resetPasswordWithToken(token: string, newPassword: string) {
  const tokenHash = hashToken(token);
  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    include: { user: { select: { id: true, blocked: true } } },
  });

  if (!record || record.expiresAt < new Date()) {
    if (record) {
      await prisma.passwordResetToken.delete({ where: { id: record.id } }).catch(() => {});
    }
    return { ok: false as const, error: "لینک بازیابی نامعتبر یا منقضی شده است." };
  }

  if (record.user.blocked) {
    return { ok: false as const, error: "این حساب مسدود است." };
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.deleteMany({ where: { userId: record.userId } }),
  ]);

  return { ok: true as const };
}

export function getAppBaseUrl() {
  const fromEnv =
    process.env.AUTH_URL ||
    process.env.NEXTAUTH_URL ||
    process.env.NEXT_PUBLIC_APP_URL;

  if (fromEnv) {
    return fromEnv.replace(/\/$/, "");
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`.replace(/\/$/, "");
  }

  return "http://localhost:3000";
}

export function buildResetPasswordUrl(token: string) {
  return `${getAppBaseUrl()}/auth/reset-password?token=${encodeURIComponent(token)}`;
}
