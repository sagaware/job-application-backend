import { FastifyRequest, FastifyReply } from 'fastify'
import { verifyToken } from './jwt.js'

export async function authenticateToken(request: FastifyRequest, reply: FastifyReply) {
  try {
    const authHeader = request.headers.authorization
    const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

    if (!token) {
      reply.code(401).send({ error: 'Access token required' })
      return
    }

    // Verify the token
    verifyToken(token)

    // If we get here, token is valid, continue to route handler
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Token verification failed'
    reply.code(401).send({ error: message })
    return
  }
}