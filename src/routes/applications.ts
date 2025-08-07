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
  // Create application - ONLY SAFE ENDPOINT EXPOSED
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
}

export default applicationsRoutes