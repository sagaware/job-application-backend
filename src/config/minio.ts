import { Client } from 'minio'

// Parse MinIO endpoint to remove protocol if present
function parseMinioEndpoint(endpoint: string) {
  return endpoint.replace(/^https?:\/\//, '')
}

const minioClient = new Client({
  endPoint: parseMinioEndpoint(process.env.MINIO_ENDPOINT || 'localhost'),
  port: Number(process.env.MINIO_PORT) || 9000,
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin'
})

export const BUCKET_NAME = process.env.MINIO_BUCKET || 'applications'

export async function initializeMinio() {
  try {
    const bucketExists = await minioClient.bucketExists(BUCKET_NAME)
    if (!bucketExists) {
      await minioClient.makeBucket(BUCKET_NAME, 'us-east-1')
      console.log(`Bucket ${BUCKET_NAME} created successfully`)
    }
  } catch (error) {
    console.error('Error initializing MinIO:', error)
  }
}

export default minioClient