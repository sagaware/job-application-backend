# Job Application Backend - Claude Memory

This document contains information about the project for Claude Code AI assistant.

## Project Overview

This is a TypeScript backend API for managing job applications with file upload capabilities. Built for deployment on Coolify with the following tech stack:

- **Framework**: Fastify (Node.js web framework)
- **Database**: PostgreSQL with Prisma ORM
- **File Storage**: MinIO (S3-compatible object storage)
- **Validation**: Zod schemas
- **Documentation**: OpenAPI/Swagger
- **Language**: TypeScript with ES modules

## Architecture

### Database Models

**Application Model:**
- `id`: String (CUID primary key)
- `name`: String (required)
- `description`: String (optional)
- `data`: JSON field for flexible data storage
- `createdAt/updatedAt`: Timestamps
- `files`: Relation to File model

**File Model:**
- `id`: String (CUID primary key)
- `filename`: String (processed filename)
- `originalName`: String (original upload name)
- `mimeType`: String
- `size`: Number (bytes)
- `s3Key`: String (MinIO/S3 object key)
- `s3Bucket`: String (bucket name)
- `applicationId`: Foreign key to Application
- `createdAt/updatedAt`: Timestamps

### API Endpoints

**Applications:**
- `POST /api/applications` - Create new application
- `GET /api/applications` - List all applications with files
- `GET /api/applications/:id` - Get specific application with files
- `PUT /api/applications/:id` - Update application
- `DELETE /api/applications/:id` - Delete application (cascades to files)

**Files:**
- `POST /api/files/upload` - Upload file (requires applicationId)
- `GET /api/files/:id` - Get file metadata
- `GET /api/files/:id/download` - Get presigned download URL
- `DELETE /api/files/:id` - Delete file from storage and database

**System:**
- `GET /health` - Health check endpoint
- `GET /docs` - Swagger UI documentation

## File Structure

```
src/
├── config/
│   ├── database.ts      # Prisma client configuration
│   └── minio.ts         # MinIO client and bucket initialization
├── routes/
│   ├── applications.ts  # Application CRUD endpoints
│   └── files.ts         # File upload/download endpoints
├── schemas/
│   ├── application.ts   # Zod validation schemas for applications
│   └── file.ts          # Zod validation schemas for files
├── services/
│   └── fileService.ts   # File upload/download business logic
└── server.ts            # Main server setup with plugins
```

## Key Features

1. **Type Safety**: Full TypeScript with Zod validation
2. **File Handling**: Multipart uploads with MinIO storage
3. **API Documentation**: Auto-generated OpenAPI spec at `/docs`
4. **CORS**: Enabled for all origins
5. **Error Handling**: Proper HTTP status codes and error messages
6. **Presigned URLs**: Secure file downloads with temporary URLs
7. **Database Relations**: Cascading deletes for file cleanup

## Build Process

- **Development**: `pnpm dev` (uses tsx for hot reload)
- **Build**: `pnpm build` (runs `prisma generate && tsc`)
- **Production**: `pnpm start` (runs compiled JavaScript)

## Environment Variables

**Required:**
- `DATABASE_URL`: PostgreSQL connection string
- `MINIO_ENDPOINT`: MinIO server endpoint
- `MINIO_ACCESS_KEY`: MinIO access key
- `MINIO_SECRET_KEY`: MinIO secret key
- `MINIO_BUCKET`: Storage bucket name

**Optional:**
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)
- `MINIO_PORT`: MinIO port (default: 9000)
- `MINIO_USE_SSL`: Enable SSL for MinIO (default: false)

## Deployment

Designed for Coolify deployment with:
- Multi-stage Dockerfile for optimized builds
- Proper health checks
- Environment variable configuration
- Database migration support

## Known Limitations

1. File uploads are limited by Fastify's multipart configuration
2. MinIO bucket must exist before application starts (auto-created if missing)
3. No authentication/authorization implemented yet
4. No rate limiting configured
5. No file type restrictions enforced

## Recent Fixes

- Fixed TypeScript build errors with proper type assertions
- Updated build script to include Prisma client generation
- Resolved Docker deployment issues with PrismaClient imports
- Added proper Dockerfile for reliable container builds

## Future Considerations

- Add authentication middleware
- Implement file type validation
- Add rate limiting
- Consider database migrations instead of db push
- Add comprehensive error logging
- Implement file scanning/virus checking
- Add backup strategies for file storage

This backend is ready for integration with frontend applications and provides a complete API for job application management with file handling capabilities.