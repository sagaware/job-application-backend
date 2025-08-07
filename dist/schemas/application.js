import { z } from 'zod';
export const createApplicationSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
    data: z.record(z.string(), z.any()).optional()
});
export const updateApplicationSchema = z.object({
    name: z.string().min(1, 'Name is required').optional(),
    description: z.string().optional(),
    data: z.record(z.string(), z.any()).optional()
});
export const applicationParamsSchema = z.object({
    id: z.string().cuid('Invalid application ID')
});
