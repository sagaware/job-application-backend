import { FastifyPluginAsync } from 'fastify'
import { fileUploadSchema, fileParamsSchema } from '../schemas/file.js'
import { uploadFile, getFileUrl, deleteFile } from '../services/fileService.js'
import prisma from '../config/database.js'

const filesRoutes: FastifyPluginAsync = async (fastify) => {
  // Upload file
  fastify.post('/files/upload', {
    schema: {
      consumes: ['multipart/form-data'],
      body: {
        type: 'object',
        properties: {
          file: { isFileType: true },
          applicationId: { type: 'string' }
        },
        required: ['file', 'applicationId']
      }
    }
  }, async (request, reply) => {
    const data = await request.file()
    
    if (!data) {
      return reply.code(400).send({ error: 'No file uploaded' })
    }

    const buffer = await data.toBuffer()
    const applicationId = data.fields.applicationId?.value as string

    if (!applicationId) {
      return reply.code(400).send({ error: 'Application ID is required' })
    }

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

  // Get file download URL
  fastify.get('/files/:id/download', {
    schema: {
      params: fileParamsSchema
    }
  }, async (request, reply) => {
    const { id } = request.params

    const file = await prisma.file.findUnique({
      where: { id }
    })

    if (!file) {
      return reply.code(404).send({ error: 'File not found' })
    }

    try {
      const downloadUrl = await getFileUrl(file.s3Key)
      reply.send({ downloadUrl })
    } catch (error) {
      reply.code(500).send({ error: 'Failed to generate download URL' })
    }
  })

  // Delete file
  fastify.delete('/files/:id', {
    schema: {
      params: fileParamsSchema
    }
  }, async (request, reply) => {
    const { id } = request.params

    try {
      await deleteFile(id)
      reply.code(204).send()
    } catch (error) {
      reply.code(404).send({ error: 'File not found' })
    }
  })

  // Get file metadata
  fastify.get('/files/:id', {
    schema: {
      params: fileParamsSchema
    }
  }, async (request, reply) => {
    const { id } = request.params

    const file = await prisma.file.findUnique({
      where: { id }
    })

    if (!file) {
      return reply.code(404).send({ error: 'File not found' })
    }

    reply.send(file)
  })
}

export default filesRoutes