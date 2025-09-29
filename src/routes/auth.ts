import { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
import { generateToken } from '../utils/jwt.js'

const REVIEW_PASSCODE = process.env.REVIEW_PASSCODE

if (!REVIEW_PASSCODE) {
  throw new Error('REVIEW_PASSCODE environment variable is required')
}

const verifyPasscodeSchema = z.object({
  passcode: z.string().min(1)
})

const authRoutes: FastifyPluginAsync = async (fastify) => {
  // Verify passcode endpoint
  fastify.post('/auth/verify-passcode', {
    schema: {
      body: {
        type: 'object',
        properties: {
          passcode: { type: 'string' }
        },
        required: ['passcode']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            token: { type: 'string' }
          }
        },
        401: {
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { passcode } = verifyPasscodeSchema.parse(request.body)

      if (passcode === REVIEW_PASSCODE) {
        const token = generateToken()
        reply.send({ success: true, token })
      } else {
        reply.code(401).send({ error: 'Invalid passcode' })
      }
    } catch (error) {
      reply.code(400).send({ error: 'Invalid request body' })
    }
  })
}

export default authRoutes