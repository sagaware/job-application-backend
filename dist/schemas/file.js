import { z } from 'zod';
export const fileUploadSchema = z.object({
    applicationId: z.string().cuid('Invalid application ID')
});
export const fileParamsSchema = z.object({
    id: z.string().cuid('Invalid file ID')
});
