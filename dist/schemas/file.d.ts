import { z } from 'zod';
export declare const fileUploadSchema: z.ZodObject<{
    applicationId: z.ZodString;
}, z.core.$strip>;
export declare const fileParamsSchema: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
export type FileUploadRequest = z.infer<typeof fileUploadSchema>;
export type FileParams = z.infer<typeof fileParamsSchema>;
//# sourceMappingURL=file.d.ts.map