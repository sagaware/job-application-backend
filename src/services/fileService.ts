import minioClient, { BUCKET_NAME } from '../config/minio.js'
import prisma from '../config/database.js'
import { randomUUID } from 'crypto'

export async function uploadFile(
  file: Buffer,
  filename: string,
  mimeType: string,
  applicationId: string
) {
  const fileId = randomUUID()
  const s3Key = `applications/${applicationId}/${fileId}-${filename}`

  await minioClient.putObject(BUCKET_NAME, s3Key, file, {
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