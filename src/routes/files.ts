import { FastifyPluginAsync } from 'fastify'
import { fileUploadSchema, fileParamsSchema, FileParams } from '../schemas/file.js'
import { uploadFile, getFileUrl, deleteFile } from '../services/fileService.js'
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
}

export default filesRoutes