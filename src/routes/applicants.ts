import { FastifyPluginAsync } from 'fastify'
import prisma from '../config/database.js'
import { authenticateToken } from '../utils/middleware.js'

const applicantsRoutes: FastifyPluginAsync = async (fastify) => {
  // Get all applicants - protected by JWT
  fastify.get('/applicants', {
    preHandler: authenticateToken,
    schema: {
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              description: { type: 'string' },
              data: { type: 'object' },
              createdAt: { type: 'string' },
              updatedAt: { type: 'string' },
              files: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    filename: { type: 'string' },
                    originalName: { type: 'string' },
                    mimeType: { type: 'string' },
                    size: { type: 'number' },
                    s3Key: { type: 'string' },
                    s3Bucket: { type: 'string' },
                    createdAt: { type: 'string' },
                    updatedAt: { type: 'string' }
                  }
                }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const applications = await prisma.application.findMany({
        include: {
          files: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      reply.send(applications)
    } catch (error) {
      fastify.log.error(error)
      reply.code(500).send({ error: 'Failed to fetch applicants' })
    }
  })

  // Get single applicant by ID - protected by JWT
  fastify.get('/applicants/:id', {
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
            id: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' },
            data: { type: 'object' },
            createdAt: { type: 'string' },
            updatedAt: { type: 'string' },
            files: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  filename: { type: 'string' },
                  originalName: { type: 'string' },
                  mimeType: { type: 'string' },
                  size: { type: 'number' },
                  s3Key: { type: 'string' },
                  s3Bucket: { type: 'string' },
                  createdAt: { type: 'string' },
                  updatedAt: { type: 'string' }
                }
              }
            }
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

      const application = await prisma.application.findUnique({
        where: { id },
        include: {
          files: true
        }
      })

      if (!application) {
        reply.code(404).send({ error: 'Applicant not found' })
        return
      }

      reply.send(application)
    } catch (error) {
      fastify.log.error(error)
      reply.code(500).send({ error: 'Failed to fetch applicant' })
    }
  })
}

export default applicantsRoutes