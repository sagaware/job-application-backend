# Coolify Deployment Guide

## Prerequisites

You'll need to set up these services in Coolify:

1. **PostgreSQL Database**
2. **MinIO Object Storage** (or external S3)

## Environment Variables

Configure these environment variables in your Coolify application:

### Required Variables

```bash
# Database
DATABASE_URL="postgresql://username:password@postgresql-host:5432/database_name"

# MinIO S3-compatible storage
MINIO_ENDPOINT="your-minio-endpoint"
MINIO_PORT=443
MINIO_USE_SSL=true
MINIO_ACCESS_KEY="your-minio-access-key"
MINIO_SECRET_KEY="your-minio-secret-key"
MINIO_BUCKET="job-applications"

# Server
PORT=3000
NODE_ENV=production
```

## Setup Steps

### 1. Create PostgreSQL Database
- In Coolify, create a new PostgreSQL service
- Note down the connection details
- Use them to construct your `DATABASE_URL`

### 2. Create MinIO Storage
- In Coolify, create a new MinIO service
- Set up access credentials
- Create a bucket named `job-applications`
- Configure the MinIO environment variables

### 3. Deploy Application
- Connect your GitHub repository to Coolify
- Set the environment variables listed above
- Deploy the application

### 4. Run Database Migrations
After deployment, run this command once to set up the database schema:

```bash
npx prisma db push
```

## Health Check

The application exposes these endpoints:

- `GET /health` - Health check endpoint
- `GET /docs` - API documentation (Swagger UI)

## API Endpoints

- `POST /api/applications` - Create application
- `GET /api/applications` - List applications
- `GET /api/applications/:id` - Get application
- `PUT /api/applications/:id` - Update application
- `DELETE /api/applications/:id` - Delete application
- `POST /api/files/upload` - Upload file
- `GET /api/files/:id` - Get file metadata
- `GET /api/files/:id/download` - Get file download URL
- `DELETE /api/files/:id` - Delete file

## Troubleshooting

If deployment fails:

1. Check that all environment variables are set correctly
2. Ensure PostgreSQL is accessible from the application
3. Verify MinIO credentials and bucket exists
4. Check application logs in Coolify dashboard

## Alternative: Using External S3

Instead of MinIO, you can use AWS S3 or any S3-compatible service:

```bash
# Use these instead of MINIO_* variables
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"  
AWS_REGION="us-east-1"
S3_BUCKET="your-bucket-name"
```

Then update the MinIO configuration in `src/config/minio.ts` to use AWS S3 endpoints.