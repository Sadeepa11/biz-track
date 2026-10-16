import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import fs from 'fs';
import path from 'path';

export class R2Service {
  private static s3Client: S3Client | null = null;

  private static getClient(): { client: S3Client | null; bucket: string; publicUrl: string } {
    const accountId = process.env.R2_ACCOUNT_ID?.trim();
    const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim();
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim();
    const bucket = process.env.R2_BUCKET_NAME?.trim() || 'biz-track';
    const publicUrl = (process.env.R2_PUBLIC_URL?.trim() || '').replace(/\/$/, '');

    const isConfigured = Boolean(
      accountId &&
      accessKeyId &&
      secretAccessKey &&
      !accountId.includes('your-') &&
      !accessKeyId.includes('your-')
    );

    if (isConfigured && !this.s3Client) {
      this.s3Client = new S3Client({
        region: 'auto',
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: accessKeyId!,
          secretAccessKey: secretAccessKey!,
        },
      });
      console.log('☁️ Cloudflare R2 client initialized for bucket:', bucket);
    }

    return { client: isConfigured ? this.s3Client : null, bucket, publicUrl };
  }

  /**
   * Upload an order delivery photo to Cloudflare R2 (or fallback to local static storage if R2 keys pending)
   */
  static async uploadImage(
    buffer: Buffer,
    originalName: string,
    mimeType: string = 'image/jpeg'
  ): Promise<string> {
    const ext = path.extname(originalName) || (mimeType.includes('png') ? '.png' : '.jpg');
    const filename = `order-${Date.now()}-${Math.random().toString(36).slice(2, 7)}${ext}`;
    const objectKey = `orders/${filename}`;
    const port = process.env.PORT || '5000';

    const { client, bucket, publicUrl } = this.getClient();

    if (client) {
      try {
        console.log(`☁️ Uploading ${objectKey} to Cloudflare R2 bucket "${bucket}"...`);
        await client.send(
          new PutObjectCommand({
            Bucket: bucket,
            Key: objectKey,
            Body: buffer,
            ContentType: mimeType,
          })
        );

        const url = publicUrl
          ? `${publicUrl}/${objectKey}`
          : `http://localhost:${port}/api/r2/${objectKey}`;

        console.log('✅ Uploaded to Cloudflare R2 successfully:', url);
        return url;
      } catch (err: any) {
        console.error('❌ Cloudflare R2 upload error, falling back to local storage:', err.message);
      }
    } else {
      console.log('ℹ️ Cloudflare R2 credentials not fully set in .env; saving to local static storage.');
    }

    // Local storage fallback so delivery confirmation NEVER fails
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'orders');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const localFilePath = path.join(uploadDir, filename);
    fs.writeFileSync(localFilePath, buffer);

    const localUrl = `http://localhost:${port}/uploads/orders/${filename}`;
    console.log('📁 Stored locally at:', localUrl);
    return localUrl;
  }

  /**
   * Retrieve an object from Cloudflare R2 to stream to clients
   */
  static async getObject(key: string): Promise<{ stream: Readable; contentType: string } | null> {
    const { client, bucket } = this.getClient();
    if (!client) return null;

    try {
      const response = await client.send(
        new GetObjectCommand({
          Bucket: bucket,
          Key: key,
        })
      );

      if (!response.Body) return null;

      return {
        stream: response.Body as Readable,
        contentType: response.ContentType || 'image/jpeg',
      };
    } catch (err: any) {
      console.error('Error fetching object from R2:', err.message);
      return null;
    }
  }
}
