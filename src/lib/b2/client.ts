import { S3Client } from "@aws-sdk/client-s3";
import { logger } from "../logger";

let s3ClientInstance: S3Client | null = null;

export function getB2Client(): S3Client | null {
  // Only execute server-side
  if (typeof window !== "undefined") {
    logger.error("Attempted to initialize Backblaze B2 S3 Client on the browser! Blocked for security.");
    return null;
  }

  if (s3ClientInstance) {
    return s3ClientInstance;
  }

  const keyId = process.env.B2_APPLICATION_KEY_ID;
  const appKey = process.env.B2_APPLICATION_KEY;
  const endpoint = process.env.B2_ENDPOINT || "https://s3.us-east-005.backblazeb2.com";

  if (!keyId || !appKey || keyId.includes("placeholder")) {
    logger.warn("Backblaze B2 credentials not configured or using placeholders. B2 direct calls will be mocked.");
    return null;
  }

  s3ClientInstance = new S3Client({
    endpoint,
    region: "us-east-005",
    credentials: {
      accessKeyId: keyId,
      secretAccessKey: appKey,
    },
  });

  return s3ClientInstance;
}
