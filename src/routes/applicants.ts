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

      // Debug: Log raw data from database
      console.log('=== PRISMA DEBUG START ===')
      console.log('Applications count:', applications.length)
      if (applications.length > 0 && applications[0]) {
        const firstApp = applications[0]
        console.log('First app ID:', firstApp.id)
        console.log('First app name:', firstApp.name)
        console.log('First app data:', firstApp.data)
        console.log('First app data type:', typeof firstApp.data)
        console.log('First app data stringified:', JSON.stringify(firstApp.data, null, 2))

        // Raw query comparison
        const rawResult = await prisma.$queryRaw`
          SELECT id, name, data
          FROM applications
          WHERE id = ${firstApp.id}
          LIMIT 1
        ` as any[]
        console.log('Raw query result:', JSON.stringify(rawResult, null, 2))
      }
      console.log('=== PRISMA DEBUG END ===')

      // With jsonb, data should already be proper objects
      const serializedApplications = applications.map(app => ({
        ...app,
        data: app.data || {},
        createdAt: app.createdAt.toISOString(),
        updatedAt: app.updatedAt.toISOString(),
        files: app.files.map(file => ({
          ...file,
          createdAt: file.createdAt.toISOString(),
          updatedAt: file.updatedAt.toISOString()
        }))
      }))

      reply.send(serializedApplications)
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

      // With jsonb, data should already be proper objects
      const serializedApplication = {
        ...application,
        data: application.data || {},
        createdAt: application.createdAt.toISOString(),
        updatedAt: application.updatedAt.toISOString(),
        files: application.files.map(file => ({
          ...file,
          createdAt: file.createdAt.toISOString(),
          updatedAt: file.updatedAt.toISOString()
        }))
      }

      reply.send(serializedApplication)
    } catch (error) {
      fastify.log.error(error)
      reply.code(500).send({ error: 'Failed to fetch applicant' })
    }
  })

  // Update applicant notes, rank, and status - protected by JWT
  fastify.patch('/applicants/:id', {
    preHandler: authenticateToken,
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
          rank: { type: 'number', minimum: 1, maximum: 5 },
          status: {
            type: 'string',
            enum: ['new', 'screen', 'interview', 'offer', 'rejected', 'on-hold']
          },
          universityEnrollment: {
            type: 'string',
            enum: ['Yes', 'No', 'Not sure']
          },
          notes: {
            type: 'object',
            properties: {
              powWow: { type: 'string' },
              passion: { type: 'string' },
              technicalKnowledge: { type: 'string' },
              softwareAbility: { type: 'string' },
              aesthetics: { type: 'string' },
              general: { type: 'string' }
            }
          }
        },
        additionalProperties: false
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            data: { type: 'object' },
            updatedAt: { type: 'string' }
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
      const updates = request.body as any

      // Get current application
      const currentApp = await prisma.application.findUnique({
        where: { id }
      })

      if (!currentApp) {
        reply.code(404).send({ error: 'Applicant not found' })
        return
      }

      // Merge review data with existing data
      const currentData = (currentApp.data as any) || {}
      const reviewData = currentData.reviewData || {}

      // Update review-specific fields
      const updatedReviewData = {
        ...reviewData,
        ...(updates.rank !== undefined && { rank: updates.rank }),
        ...(updates.status !== undefined && { status: updates.status }),
        ...(updates.universityEnrollment !== undefined && { universityEnrollment: updates.universityEnrollment }),
        ...(updates.notes && { notes: { ...reviewData.notes, ...updates.notes } }),
        lastUpdated: new Date().toISOString()
      }

      // Update the application
      const updatedApp = await prisma.application.update({
        where: { id },
        data: {
          data: {
            ...currentData,
            reviewData: updatedReviewData
          }
        }
      })

      reply.send({
        id: updatedApp.id,
        name: updatedApp.name,
        data: updatedApp.data,
        updatedAt: updatedApp.updatedAt.toISOString()
      })
    } catch (error) {
      fastify.log.error(error)
      reply.code(500).send({ error: 'Failed to update applicant' })
    }
  })
}

export default applicantsRoutes