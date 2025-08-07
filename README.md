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

⚠️ **Security Notice**: This API currently has minimal endpoints exposed for security reasons. Only essential functionality is available.

### Available Endpoints
- `POST /api/applications` - Create a new application
- `POST /api/files/upload` - Upload file (applicationId optional)

### Workflow
1. **Upload files first** (optional): `POST /api/files/upload` without applicationId
   - Files stored in `uploads/unassigned/{fileId}-{filename}`
   - Browser receives file `id` in response and tracks it
2. **Create application**: `POST /api/applications` with application data + `fileIds` array
   - Files automatically moved from `uploads/unassigned/` to `applications/{applicationId}/`
   - Database updated with applicationId link
3. **Upload more files** (optional): `POST /api/files/upload` with applicationId for direct linking
   - Files stored directly in `applications/{applicationId}/` folder

**Example:**
```javascript
// 1. Upload files and collect IDs
const file1 = await uploadFile(resumeFile); // Returns {id: "file1_id", ...}
const file2 = await uploadFile(coverLetter); // Returns {id: "file2_id", ...}

// 2. Create application with file IDs
const application = await createApplication({
  name: "John Doe Application",
  description: "Software Engineer Position", 
  fileIds: [file1.id, file2.id] // Links files to application
});
```

### System Endpoints
- `GET /health` - Health check endpoint
- `GET /docs` - Swagger UI documentation

### Disabled Endpoints (Security)
The following endpoints are disabled until proper authentication is implemented:
- ~~GET /api/applications~~ - List applications
- ~~GET /api/applications/:id~~ - Get application details  
- ~~PUT /api/applications/:id~~ - Update application
- ~~DELETE /api/applications/:id~~ - Delete application
- ~~GET /api/files/:id~~ - Get file metadata
- ~~GET /api/files/:id/download~~ - Get file download URL
- ~~DELETE /api/files/:id~~ - Delete file


## Setup

### Development Setup

1. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Start local development services (PostgreSQL + MinIO):
   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```

4. Run database migrations:
   ```bash
   pnpm db:migrate
   ```

5. Start development server:
   ```bash
   pnpm dev
   ```

### Production Deployment

The `start` script automatically applies migrations on startup:
```bash
pnpm start  # Runs: prisma migrate deploy && node dist/server.js
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