import minioClient, { BUCKET_NAME } from '../config/minio.js'
import prisma from '../config/database.js'
import { randomUUID } from 'crypto'

export async function uploadFile(
  file: Buffer,
  filename: string,
  mimeType: string,
  applicationId: string | null
) {
  const fileId = randomUUID()
  const s3Key = applicationId 
    ? `applications/${applicationId}/${fileId}-${filename}`
    : `uploads/unassigned/${fileId}-${filename}`

  await minioClient.putObject(BUCKET_NAME, s3Key, file, file.length, {
    'Content-Type': mimeType
  })

  const fileRecord = await prisma.file.create({
    data: {
      filename,
      originalName: filename,
      mimeType,
      size: file.length,
      s3Key,
      s3Bucket: BUCKET_NAME,
      applicationId
    }
  })

  return fileRecord
}

export async function getFileUrl(s3Key: string) {
  return await minioClient.presignedGetObject(BUCKET_NAME, s3Key, 24 * 60 * 60) // 24 hours
}

export async function moveFileToApplication(fileId: string, applicationId: string) {
  const file = await prisma.file.findUnique({
    where: { id: fileId }
  })

  if (!file) {
    throw new Error('File not found')
  }

  // Only move if file is currently unassigned
  if (file.applicationId !== null) {
    return file // Already assigned, no need to move
  }

  // Generate new S3 key for application folder
  const filename = file.originalName
  const newS3Key = `applications/${applicationId}/${fileId}-${filename}`

  // Copy file to new location
  await minioClient.copyObject(BUCKET_NAME, newS3Key, `${BUCKET_NAME}/${file.s3Key}`)

  // Delete old file
  await minioClient.removeObject(BUCKET_NAME, file.s3Key)

  // Update database record
  const updatedFile = await prisma.file.update({
    where: { id: fileId },
    data: {
      s3Key: newS3Key,
      applicationId
    }
  })

  return updatedFile
}

export async function deleteFile(fileId: string) {
  const file = await prisma.file.findUnique({
    where: { id: fileId }
  })

  if (!file) {
    throw new Error('File not found')
  }

  await minioClient.removeObject(BUCKET_NAME, file.s3Key)
  await prisma.file.delete({
    where: { id: fileId }
  })

  return file
}