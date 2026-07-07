import nodemailer from "nodemailer";
import { SITE_NAME } from "@/lib/site";

type SendPasswordResetEmailInput = {
  to: string;
  name: string;
  resetUrl: string;
};

export function smtpConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function createTransport() {
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = port === 465;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure,
    requireTLS: !secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    connectionTimeout: 15_000,
    greetingTimeout: 15_000,
    socketTimeout: 20_000,
    tls: {
      minVersion: "TLSv1.2",
      rejectUnauthorized: process.env.NODE_ENV === "production",
    },
  });
}

export async function sendPasswordResetEmail({
  to,
  name,
  resetUrl,
}: SendPasswordResetEmailInput) {
  const subject = `بازیابی رمز عبور — ${SITE_NAME}`;
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@example.com";

  const text = `سلام ${name}،

برای تغییر رمز عبور ${SITE_NAME} روی لینک زیر کلیک کنید (تا ۱ ساعت معتبر است):

${resetUrl}

اگر این درخواست را شما نداده‌اید، این ایمیل را نادیده بگیرید.`;

  const html = `
    <div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;line-height:1.8;color:#134e4a">
      <h2 style="margin:0 0 12px">${SITE_NAME}</h2>
      <p>سلام ${name}،</p>
      <p>برای تغییر رمز عبور روی دکمه زیر کلیک کنید. این لینک تا <strong>۱ ساعت</strong> معتبر است.</p>
      <p style="margin:24px 0">
        <a href="${resetUrl}" style="background:#0f766e;color:#fff;padding:12px 20px;border-radius:10px;text-decoration:none;display:inline-block">
          تغییر رمز عبور
        </a>
      </p>
      <p style="font-size:13px;color:#64748b">اگر دکمه کار نکرد، این آدرس را در مرورگر باز کنید:<br><a href="${resetUrl}">${resetUrl}</a></p>
    </div>
  `;

  if (!smtpConfigured()) {
    console.log("[password-reset] SMTP not configured. Reset link:", resetUrl);
    return { sent: false, previewUrl: resetUrl };
  }

  const transport = createTransport();

  try {
    await transport.verify();
  } catch (error) {
    console.error("[password-reset] SMTP verify failed:", error);
    throw new Error("SMTP_VERIFY_FAILED");
  }

  try {
    await transport.sendMail({ from, to, subject, text, html });
    return { sent: true as const };
  } catch (error) {
    console.error("[password-reset] SMTP send failed:", error);
    throw new Error("SMTP_SEND_FAILED");
  }
}
