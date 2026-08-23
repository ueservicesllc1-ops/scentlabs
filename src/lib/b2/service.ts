import { 
  PutObjectCommand, 
  GetObjectCommand, 
  DeleteObjectCommand,
  HeadObjectCommand 
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getB2Client } from "./client";
import { logger } from "../logger";

const BUCKET_NAME = process.env.B2_BUCKET_NAME || "scentlab-storage";
const PUBLIC_BASE_URL = process.env.B2_PUBLIC_BASE_URL || "https://f005.backblazeb2.com/file/scentlab-storage";

export const b2Service = {
  /**
   * Generates a public CDN URL for public product media assets
   */
  getPublicUrl(b2Key: string): string {
    const cleanKey = b2Key.startsWith("/") ? b2Key.substring(1) : b2Key;
    return `${PUBLIC_BASE_URL}/${cleanKey}`;
  },

  /**
   * Generates a Presigned Upload URL so the client can upload directly to B2 without exposing master credentials.
   */
  async generatePresignedUploadUrl(
    b2Key: string,
    contentType: string,
    expiresInSeconds: number = 900 // 15 minutes
  ): Promise<{ uploadUrl: string; b2Key: string } | null> {
    const client = getB2Client();
    if (!client) {
      logger.warn(`B2 client unavailable; returning simulated upload URL for key: ${b2Key}`);
      return {
        uploadUrl: `https://mock-b2-upload.local/${b2Key}`,
        b2Key,
      };
    }

    try {
      const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: b2Key,
        ContentType: contentType,
      });

      const uploadUrl = await getSignedUrl(client, command, { expiresIn: expiresInSeconds });
      return { uploadUrl, b2Key };
    } catch (error) {
      logger.error("Failed to generate presigned upload URL", error);
      throw error;
    }
  },

  /**
   * Generates a Presigned Download URL for private customer logos and design files (TTL 15 min).
   */
  async generatePresignedDownloadUrl(
    b2Key: string,
    expiresInSeconds: number = 900
  ): Promise<string | null> {
    const client = getB2Client();
    if (!client) {
      return `https://mock-b2-download.local/${b2Key}`;
    }

    try {
      const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: b2Key,
      });

      return await getSignedUrl(client, command, { expiresIn: expiresInSeconds });
    } catch (error) {
      logger.error("Failed to generate presigned download URL", error);
      throw error;
    }
  },

  /**
   * Deletes an object from Backblaze B2.
   */
  async deleteFile(b2Key: string): Promise<boolean> {
    const client = getB2Client();
    if (!client) {
      logger.warn(`B2 deleteFile called in mock mode for: ${b2Key}`);
      return true;
    }

    try {
      await client.send(
        new DeleteObjectCommand({
          Bucket: BUCKET_NAME,
          Key: b2Key,
        })
      );
      return true;
    } catch (error) {
      logger.error("Failed to delete B2 object", error);
      return false;
    }
  },
};
