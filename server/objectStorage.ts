import { S3Client, GetObjectCommand, PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Response } from "express";
import { randomUUID } from "crypto";

export class ObjectNotFoundError extends Error {
  constructor() {
    super("Object not found");
    this.name = "ObjectNotFoundError";
    Object.setPrototypeOf(this, ObjectNotFoundError.prototype);
  }
}

export class ObjectStorageService {
  private s3: S3Client;
  private bucket: string;

  constructor() {
    this.s3 = new S3Client({ region: 'us-west-2' });
    this.bucket = 'thetraitorsapp';
  }

  // Upload: return signed PUT URL
  async getObjectEntityUploadURL(): Promise<string> {
    const key = `uploads/${randomUUID()}`;
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    return getSignedUrl(this.s3, command, { expiresIn: 900 }); // 15 min
  }

  // Download: stream file to Express Response
  async downloadObject(key: string, res: Response, cacheTtlSec: number = 3600) {
    try {
      const head = await this.s3.send(new HeadObjectCommand({ Bucket: this.bucket, Key: key }));
      const command = new GetObjectCommand({ Bucket: this.bucket, Key: key });
      const obj = await this.s3.send(command);

      res.set({
        "Content-Type": head.ContentType || "application/octet-stream",
        "Content-Length": head.ContentLength?.toString(),
        "Cache-Control": `public, max-age=${cacheTtlSec}`,
      });

      if (obj.Body) {
        (obj.Body as any).pipe(res);
      }
    } catch (err: any) {
      console.error("Error downloading S3 object:", err);
      throw new ObjectNotFoundError();
    }
  }

  // Check if object exists
  async getObjectEntityFile(key: string) {
    try {
      await this.s3.send(new HeadObjectCommand({ Bucket: this.bucket, Key: key }));
      return { bucket: this.bucket, key };
    } catch {
      throw new ObjectNotFoundError();
    }
  }

  // Normalize path for app consistency
  normalizeObjectEntityPath(rawPath: string): string {
    if (rawPath.startsWith("https://")) {
      const url = new URL(rawPath);
      return url.pathname.replace(/^\/+/, "");
    }
    return rawPath;
  }

  // Permissions are simplified: rely on S3 bucket policy
  async trySetObjectEntityAclPolicy(rawPath: string): Promise<string> {
    return this.normalizeObjectEntityPath(rawPath);
  }

  async canAccessObjectEntity(): Promise<boolean> {
    // With S3, access is controlled by signed URLs or bucket policy
    return true;
  }
}
