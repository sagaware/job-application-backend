import fastify from 'fastify'
import cors from '@fastify/cors'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import multipart from '@fastify/multipart'
import applicationsRoutes from './routes/applications.js'
import filesRoutes from './routes/files.js'
import authRoutes from './routes/auth.js'
import applicantsRoutes from './routes/applicants.js'
import { initializeMinio } from './config/minio.js'

const server = fastify({
  logger: process.env.NODE_ENV === 'development' ? {
    level: 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true
      }
    }
  } : {
    level: 'info'
  }
})

// Register plugins
server.register(cors, {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
})

server.register(multipart)

server.register(swagger, {
  swagger: {
    info: {
      title: 'Job Application Backend API',
      description: 'API for managing job applications with file uploads',
      version: '1.0.0'
    },
    host: 'localhost:3000',
    schemes: ['http', 'https'],
    consumes: ['application/json', 'multipart/form-data'],
    produces: ['application/json'],
    tags: [
      { name: 'Applications', description: 'Application management endpoints' },
      { name: 'Files', description: 'File upload and management endpoints' }
    ]
  }
})

server.register(swaggerUi, {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'full',
    deepLinking: false
  },
  uiHooks: {
    onRequest: function (_request, _reply, next) { next() },
    preHandler: function (_request, _reply, next) { next() }
  },
  staticCSP: true,
  transformStaticCSP: (header) => header
})

// Register routes
server.register(applicationsRoutes, { prefix: '/api' })
server.register(filesRoutes, { prefix: '/api' })
server.register(authRoutes, { prefix: '/api' })
server.register(applicantsRoutes, { prefix: '/api' })

// Health check
server.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() }
})

const start = async () => {
  try {
    // Initialize MinIO
    await initializeMinio()
    
    const port = Number(process.env.PORT) || 3000
    await server.listen({ port, host: '0.0.0.0' })
    console.log(`Server listening on port ${port}`)
    console.log(`API Documentation available at http://localhost:${port}/docs`)
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

start()

export default server