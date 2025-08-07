# Job Application Backend

A TypeScript backend API for managing job applications with file uploads, built with Fastify, Prisma, PostgreSQL, and MinIO.

## Features

- **RESTful API** for job application management
- **File uploads** with MinIO S3-compatible storage
- **PostgreSQL** database with Prisma ORM
- **OpenAPI/Swagger** documentation
- **TypeScript** for type safety
- **Zod** schemas for validation

## API Endpoints

### Applications
- `POST /api/applications` - Create a new application
- `GET /api/applications` - Get all applications
- `GET /api/applications/:id` - Get application by ID
- `PUT /api/applications/:id` - Update application
- `DELETE /api/applications/:id` - Delete application

### Files
- `POST /api/files/upload` - Upload file
- `GET /api/files/:id` - Get file metadata
- `GET /api/files/:id/download` - Get file download URL
- `DELETE /api/files/:id` - Delete file

### Documentation
- `GET /docs` - Swagger UI documentation
- `GET /health` - Health check endpoint

## Setup

1. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up database:
   ```bash
   pnpm db:push
   ```

4. Start development server:
   ```bash
   pnpm dev
   ```

The API will be available at http://localhost:3000 and documentation at http://localhost:3000/docs

## Environment Variables

- `DATABASE_URL` - PostgreSQL connection string
- `MINIO_ENDPOINT` - MinIO server endpoint
- `MINIO_PORT` - MinIO server port
- `MINIO_ACCESS_KEY` - MinIO access key
- `MINIO_SECRET_KEY` - MinIO secret key
- `MINIO_BUCKET` - MinIO bucket name
- `PORT` - Server port (default: 3000)