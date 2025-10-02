import { randomUUID } from "crypto";
import prisma from "../config/database.js";
import minioClient, { BUCKET_NAME } from "../config/minio.js";

export async function uploadFile(
  file: Buffer,
  filename: string,
  mimeType: string,
  applicationId: string | null,
  fileType?: string
) {
  const fileId = randomUUID();
  const typePrefix = fileType ? `${fileType}-` : "";
  const s3Key = applicationId
    ? `applications/${applicationId}/${typePrefix}${fileId}-${filename}`
    : `uploads/unassigned/${typePrefix}${fileId}-${filename}`;

  await minioClient.putObject(BUCKET_NAME, s3Key, file, file.length, {
    "Content-Type": mimeType,
  });

  const fileRecord = await prisma.file.create({
    data: {
      filename,
      originalName: filename,
      mimeType,
      size: file.length,
      s3Key,
      s3Bucket: BUCKET_NAME,
      applicationId,
    },
  });

  return fileRecord;
}

export async function getFileUrl(s3Key: string) {
  return await minioClient.presignedGetObject(BUCKET_NAME, s3Key, 24 * 60 * 60); // 24 hours
}

export async function getPermanentFileUrl(s3Key: string) {
  // Generate a very long-lived presigned URL (7 days - maximum for MinIO)
  // For truly permanent access, this would need to be a public URL or
  // a backend endpoint that serves the file
  return await minioClient.presignedGetObject(
    BUCKET_NAME,
    s3Key,
    7 * 24 * 60 * 60
  ); // 7 days
}

export function getFileTypeFromS3Key(s3Key: string): string | null {
  // Extract file type from S3 key pattern: applications/{appId}/{fileType}-{fileId}-{filename}
  const keyParts = s3Key.split("/");
  if (keyParts.length < 3) return null;

  const filename = keyParts[keyParts.length - 1]; // Get the last part
  if (!filename) return null;

  const typeMatch = filename.match(/^(portfolio|cv|cover-letter|other)-/);

  return typeMatch && typeMatch[1] ? typeMatch[1] : null;
}

export async function moveFileToApplication(
  fileId: string,
  applicationId: string
) {
  const file = await prisma.file.findUnique({
    where: { id: fileId },
  });

  if (!file) {
    throw new Error("File not found");
  }

  // Only move if file is currently unassigned
  if (file.applicationId !== null) {
    return file; // Already assigned, no need to move
  }

  // Extract file type from original S3 key to preserve it
  const fileType = getFileTypeFromS3Key(file.s3Key);
  const typePrefix = fileType ? `${fileType}-` : "";

  // Generate new S3 key for application folder, preserving file type
  const filename = file.originalName;
  const newS3Key = `applications/${applicationId}/${typePrefix}${fileId}-${filename}`;

  // Copy file to new location
  await minioClient.copyObject(
    BUCKET_NAME,
    newS3Key,
    `${BUCKET_NAME}/${file.s3Key}`
  );

  // Delete old file
  await minioClient.removeObject(BUCKET_NAME, file.s3Key);

  // Update database record
  const updatedFile = await prisma.file.update({
    where: { id: fileId },
    data: {
      s3Key: newS3Key,
      applicationId,
    },
  });

  return updatedFile;
}

export async function deleteFile(fileId: string) {
  const file = await prisma.file.findUnique({
    where: { id: fileId },
  });

  if (!file) {
    throw new Error("File not found");
  }

  await minioClient.removeObject(BUCKET_NAME, file.s3Key);
  await prisma.file.delete({
    where: { id: fileId },
  });

  return file;
}
