export declare function uploadFile(file: Buffer, filename: string, mimeType: string, applicationId: string): Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    applicationId: string;
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    s3Key: string;
    s3Bucket: string;
}>;
export declare function getFileUrl(s3Key: string): Promise<string>;
export declare function deleteFile(fileId: string): Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    applicationId: string;
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    s3Key: string;
    s3Bucket: string;
}>;
//# sourceMappingURL=fileService.d.ts.map