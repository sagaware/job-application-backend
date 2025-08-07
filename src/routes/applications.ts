import { FastifyPluginAsync } from 'fastify'
import { 
  createApplicationSchema, 
  updateApplicationSchema, 
  applicationParamsSchema,
  CreateApplicationRequest,
  UpdateApplicationRequest,
  ApplicationParams
} from '../schemas/application.js'
import prisma from '../config/database.js'

const applicationsRoutes: FastifyPluginAsync = async (fastify) => {
  // Create application
  fastify.post('/applications', {
    schema: {
      body: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          data: { type: 'object' }
        },
        required: ['name']
      },
      response: {
        201: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' },
            data: { type: 'object' },
            createdAt: { type: 'string' },
            updatedAt: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    const body = createApplicationSchema.parse(request.body)
    const application = await prisma.application.create({
      data: body
    })
    
    reply.code(201).send(application)
  })

  // Get all applications
  fastify.get('/applications', {
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
              updatedAt: { type: 'string' }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    const applications = await prisma.application.findMany({
      include: {
        files: true
      }
    })
    
    reply.send(applications)
  })

  // Get application by ID
  fastify.get('/applications/:id', {
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
            files: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  filename: { type: 'string' },
                  originalName: { type: 'string' },
                  mimeType: { type: 'string' },
                  size: { type: 'number' }
                }
              }
            },
            createdAt: { type: 'string' },
            updatedAt: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    const { id } = applicationParamsSchema.parse(request.params)
    
    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        files: true
      }
    })

    if (!application) {
      return reply.code(404).send({ error: 'Application not found' })
    }

    reply.send(application)
  })

  // Update application
  fastify.put('/applications/:id', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      },
      body: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          data: { type: 'object' }
        }
      }
    }
  }, async (request, reply) => {
    const { id } = applicationParamsSchema.parse(request.params)
    const body = updateApplicationSchema.parse(request.body)
    
    try {
      const application = await prisma.application.update({
        where: { id },
        data: body
      })
      
      reply.send(application)
    } catch (error) {
      reply.code(404).send({ error: 'Application not found' })
    }
  })

  // Delete application
  fastify.delete('/applications/:id', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      }
    }
  }, async (request, reply) => {
    const { id } = applicationParamsSchema.parse(request.params)
    
    try {
      await prisma.application.delete({
        where: { id }
      })
      
      reply.code(204).send()
    } catch (error) {
      reply.code(404).send({ error: 'Application not found' })
    }
  })
}

export default applicationsRoutes