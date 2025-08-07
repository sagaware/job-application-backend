import { z } from 'zod'

export const createApplicationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  data: z.record(z.any()).optional()
})

export const updateApplicationSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  description: z.string().optional(),
  data: z.record(z.any()).optional()
})

export const applicationParamsSchema = z.object({
  id: z.string().cuid('Invalid application ID')
})

export type CreateApplicationRequest = z.infer<typeof createApplicationSchema>
export type UpdateApplicationRequest = z.infer<typeof updateApplicationSchema>
export type ApplicationParams = z.infer<typeof applicationParamsSchema>