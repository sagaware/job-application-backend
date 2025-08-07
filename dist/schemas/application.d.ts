import { z } from 'zod';
export declare const createApplicationSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    data: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, z.core.$strip>;
export declare const updateApplicationSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    data: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, z.core.$strip>;
export declare const applicationParamsSchema: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
export type CreateApplicationRequest = z.infer<typeof createApplicationSchema>;
export type UpdateApplicationRequest = z.infer<typeof updateApplicationSchema>;
export type ApplicationParams = z.infer<typeof applicationParamsSchema>;
//# sourceMappingURL=application.d.ts.map