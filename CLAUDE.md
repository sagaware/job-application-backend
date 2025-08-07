# Job Application Backend - Claude Memory

This document contains information about the project for Claude Code AI assistant.

## Project Overview

This is a TypeScript backend API for managing job applications with file upload capabilities. Built for deployment on Coolify with development environment support. The API is currently **security-restricted** to only allow safe operations.

**Tech Stack:**
- **Framework**: Fastify (Node.js web framework)
- **Database**: PostgreSQL with Prisma ORM and migrations
- **File Storage**: MinIO (S3-compatible object storage)
- **Validation**: Zod schemas for runtime validation, JSON Schema for Fastify
- **Documentation**: OpenAPI/Swagger at `/docs`
- **Language**: TypeScript with ES modules
- **Development**: Docker Compose for local PostgreSQL + MinIO

## Architecture

### Database Models

**Application Model:**
- `id`: String (CUID primary key)
- `name`: String (required)
- `description`: String (optional)
- `data`: JSON field for flexible data storage
- `createdAt/updatedAt`: Timestamps
- `files`: Relation to File model (one-to-many)

**File Model:**
- `id`: String (CUID primary key)
- `filename`: String (processed filename)
- `originalName`: String (original upload name)
- `mimeType`: String
- `size`: Number (bytes)
- `s3Key`: String (MinIO/S3 object key)
- `s3Bucket`: String (bucket name)
- `applicationId`: String? (optional - allows file upload before application creation)
- `application`: Application? (optional relation)
- `createdAt/updatedAt`: Timestamps

### Security-Restricted API Endpoints

**⚠️ IMPORTANT: Only safe endpoints are exposed until authentication is implemented**

**Available Endpoints:**
- `POST /api/applications` - Create new application
- `POST /api/files/upload` - Upload file (applicationId optional)
- `GET /health` - Health check endpoint
- `GET /docs` - Swagger UI documentation

**Disabled Endpoints (Security):**
- ~~GET /api/applications~~ - List applications
- ~~GET /api/applications/:id~~ - Get application details
- ~~PUT /api/applications/:id~~ - Update application
- ~~DELETE /api/applications/:id~~ - Delete application
- ~~GET /api/files/:id~~ - Get file metadata
- ~~GET /api/files/:id/download~~ - Get file download URL
- ~~DELETE /api/files/:id~~ - Delete file

## File Upload Workflow

**Flexible Upload Process:**
1. **Upload files first** (optional): `POST /api/files/upload` without applicationId
   - Files stored in `uploads/unassigned/{fileId}-{filename}`
2. **Create application**: `POST /api/applications` with application data
3. **Upload more files** (optional): `POST /api/files/upload` with applicationId
   - Files stored in `applications/{applicationId}/{fileId}-{filename}`

This allows users to upload resumes/documents before completing the application form.

## Development Environment

### Docker Compose Setup

**`docker-compose.dev.yml` provides:**
- **PostgreSQL**: Port 5433 (non-default)
- **MinIO**: Ports 9000 (API) + 9001 (Console)
- **Health checks** and **persistent volumes**

### Environment Configuration

**Development (`.env`):**
```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/job_applications"
MINIO_ENDPOINT="localhost"
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY="minioadmin"
MINIO_SECRET_KEY="minioadmin123"
```

**Production:**
- Use Coolify-provided PostgreSQL and MinIO credentials
- Set `NODE_ENV=production` for proper logging

## Build Process & Deployment

### Scripts

- **Development**: `pnpm dev` (tsx hot reload)
- **Build**: `pnpm build` (prisma generate && tsc)
- **Production**: `pnpm start` (**auto-applies migrations** + runs server)
- **Database**: `pnpm db:migrate` (development), `pnpm db:migrate:deploy` (production)

### Automatic Migrations

**Production deployment automatically applies database migrations:**
```bash
pnpm start  # Runs: prisma migrate deploy && node dist/server.js
```

This ensures Coolify automatically applies new schema changes on deployment.

## File Structure

```
src/
├── config/
│   ├── database.ts      # Prisma client configuration
│   └── minio.ts         # MinIO client with endpoint parsing
├── routes/
│   ├── applications.ts  # Application creation endpoint (security-restricted)
│   └── files.ts         # File upload endpoint (security-restricted)
├── schemas/
│   ├── application.ts   # Zod validation schemas
│   └── file.ts          # Zod validation schemas
├── services/
│   └── fileService.ts   # File upload/storage logic with optional applicationId
└── server.ts            # Fastify server with conditional logging
```

**Additional Files:**
- `docker-compose.dev.yml` - Local development services
- `prisma/migrations/` - Database migration files
- `Dockerfile` - Multi-stage production build

## Key Features

1. **Security First**: Only safe POST endpoints exposed
2. **Flexible File Uploads**: Upload before or after application creation
3. **Auto-Migrations**: Production deployments apply schema changes automatically
4. **Development Environment**: Complete Docker Compose setup
5. **Type Safety**: TypeScript + Zod validation + Prisma types
6. **API Documentation**: OpenAPI/Swagger at `/docs`
7. **MinIO Integration**: S3-compatible storage with endpoint parsing
8. **Proper Logging**: Pretty logs (dev) vs JSON logs (prod)

## Current Status

**✅ Completed:**
- Security-restricted API (only safe operations)
- File uploads with optional applicationId
- Development environment with Docker Compose
- Automatic database migrations on deployment
- Prisma schema with proper relations
- TypeScript build without errors
- MinIO endpoint parsing (handles URLs with/without protocol)
- Fastify schema validation (JSON Schema format)

**🔒 Security Restrictions Active:**
- No read/update/delete operations exposed
- Only creation endpoints available
- Prevents data exposure until authentication is implemented

**🚧 Future Work:**
- Authentication and authorization
- Enable full CRUD operations behind auth
- File type validation and scanning
- Rate limiting
- Enhanced error handling

## Deployment Instructions

**Development:**
```bash
docker-compose -f docker-compose.dev.yml up -d
pnpm db:migrate
pnpm dev
```

**Production (Coolify):**
- Set environment variables for PostgreSQL and MinIO
- Deploy - migrations apply automatically
- API available at `/docs` for frontend integration

## Known Issues & Fixes

**Recently Resolved:**
- ✅ Fixed Prisma client generation in Docker builds
- ✅ Fixed Fastify JSON schema validation errors
- ✅ Fixed MinIO endpoint URL parsing
- ✅ Fixed file upload without applicationId requirement
- ✅ Fixed production logging (pino-pretty dependency issues)

**Current Limitations:**
- File uploads limited by Fastify multipart configuration
- No file type restrictions (security concern)
- No authentication (intentionally disabled for security)

This backend is production-ready for job application creation and file uploads, with proper security restrictions in place until authentication is implemented.