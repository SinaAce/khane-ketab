import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

function useS3() {
  return Boolean(
    process.env.AWS_ACCESS_KEY_ID &&
      process.env.AWS_SECRET_ACCESS_KEY &&
      process.env.AWS_S3_BUCKET,
  );
}

function getS3Client() {
  return new S3Client({
    region: process.env.AWS_REGION || "eu-central-1",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });
}

export async function uploadFile(buffer: Buffer, key: string, contentType: string) {
  if (useS3()) {
    const client = getS3Client();
    await client.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      }),
    );
    return key;
  }

  const filePath = path.join(UPLOAD_DIR, key);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, buffer);
  return key;
}

export function isExternalFileKey(key: string) {
  return key.startsWith("ext:");
}

export function isArchiveFileKey(key: string) {
  return key.startsWith("archive:");
}

export function getArchiveIdentifier(key: string) {
  return key.slice("archive:".length);
}

export function buildArchiveFileKey(identifier: string) {
  return `archive:${identifier}`;
}

export async function getFileUrl(key: string) {
  if (isArchiveFileKey(key)) {
    return `https://archive.org/embed/${getArchiveIdentifier(key)}`;
  }

  if (isExternalFileKey(key)) {
    const raw = key.slice(4);
    return `/api/proxy?url=${encodeURIComponent(raw)}`;
  }

  if (useS3()) {
    const client = getS3Client();
    return getSignedUrl(
      client,
      new GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: key,
      }),
      { expiresIn: 3600 },
    );
  }

  return `/api/files/${encodeURIComponent(key)}`;
}

export function getExternalRawUrl(key: string) {
  if (isExternalFileKey(key)) return key.slice(4);
  return null;
}

export function buildFileKey(userId: string, filename: string) {
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `${userId}/${Date.now()}-${safeName}`;
}

export function buildExternalFileKey(url: string) {
  return `ext:${url}`;
}

export function getLocalFilePath(key: string) {
  return path.join(UPLOAD_DIR, key);
}
