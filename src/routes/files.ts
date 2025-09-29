import { FastifyPluginAsync } from 'fastify'
import { uploadFile, getFileUrl } from '../services/fileService.js'
import { authenticateToken } from '../utils/middleware.js'
import prisma from '../config/database.js'

const filesRoutes: FastifyPluginAsync = async (fastify) => {
  // Upload file - ONLY SAFE ENDPOINT EXPOSED
  fastify.post('/files/upload', async (request, reply) => {
    const data = await request.file()
    
    if (!data) {
      return reply.code(400).send({ error: 'No file uploaded' })
    }

    const buffer = await data.toBuffer()
    const applicationId = (data.fields.applicationId as any)?.value as string || null

    try {
      const file = await uploadFile(
        buffer,
        data.filename,
        data.mimetype,
        applicationId
      )

      reply.code(201).send(file)
    } catch (error) {
      reply.code(400).send({ error: 'Failed to upload file' })
    }
  })

  // Download file - protected by JWT
  fastify.get('/files/:id/download', {
    preHandler: authenticateToken,
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            downloadUrl: { type: 'string' },
            filename: { type: 'string' },
            mimeType: { type: 'string' },
            size: { type: 'number' }
          }
        },
        404: {
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string }

      // Get file metadata from database
      const file = await prisma.file.findUnique({
        where: { id }
      })

      if (!file) {
        reply.code(404).send({ error: 'File not found' })
        return
      }

      // Generate presigned URL for download
      const downloadUrl = await getFileUrl(file.s3Key)

      reply.send({
        downloadUrl,
        filename: file.originalName,
        mimeType: file.mimeType,
        size: file.size
      })
    } catch (error) {
      fastify.log.error(error)
      reply.code(500).send({ error: 'Failed to generate download URL' })
    }
  })
}

export default filesRoutes