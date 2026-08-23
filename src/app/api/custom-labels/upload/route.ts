import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { mediaRepository } from "@/lib/firestore/media";
import { logger } from "@/lib/logger";

const ALLOWED_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/svg+xml",
  "application/pdf",
];

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

function getS3Client(): S3Client | null {
  const keyId = process.env.B2_APPLICATION_KEY_ID;
  const appKey = process.env.B2_APPLICATION_KEY;
  const endpoint = process.env.B2_ENDPOINT || "https://s3.us-east-005.backblazeb2.com";

  if (!keyId || !appKey) return null;

  return new S3Client({
    endpoint,
    region: "us-east-005",
    credentials: {
      accessKeyId: keyId,
      secretAccessKey: appKey,
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const customerId = (formData.get("customerId") as string) || "guest";
    const configurationId = (formData.get("configurationId") as string) || `cfg_${Date.now()}`;
    const fileType = (formData.get("fileType") as string) || "logo"; // 'logo' | 'design'

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File exceeds 15MB limit" }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only PNG, JPG, JPEG, SVG, and PDF are allowed." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const extension = file.name.split(".").pop() || "png";
    const safeFilename = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${extension}`;
    
    // Canonical path structure: custom-labels/{customerId}/{configurationId}/{fileType}/{filename}
    const b2Key = `custom-labels/${customerId}/${configurationId}/${fileType}/${safeFilename}`;
    const bucketName = process.env.B2_BUCKET_NAME || "ScentLabs";

    const s3 = getS3Client();

    if (s3) {
      const uploadCommand = new PutObjectCommand({
        Bucket: bucketName,
        Key: b2Key,
        Body: buffer,
        ContentType: file.type,
      });

      await s3.send(uploadCommand);
      logger.info(`Custom label asset uploaded to B2: ${b2Key}`);
    } else {
      logger.info(`[MOCK STORAGE] Custom label asset recorded: ${b2Key}`);
    }

    const mediaId = `media_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const url = `/api/media/${b2Key}`;

    // Save record to Firestore media collection
    await mediaRepository.saveMetadata({
      id: mediaId,
      type: file.type.includes("pdf") ? "document" : file.type.includes("svg") ? "vector" : "image",
      b2Key,
      url,
      mimeType: file.type,
      fileSize: file.size,
      altText: file.name,
      sortOrder: 0,
      isPrimary: false,
      accessLevel: "private_customer",
      entityType: "customer_design",
      entityId: configurationId,
      ownerId: customerId !== "guest" ? customerId : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      fileId: mediaId,
      b2Key,
      url,
      filename: file.name,
      size: file.size,
      mimeType: file.type,
    });
  } catch (error: any) {
    logger.error("Custom label upload error", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload file to Backblaze B2." },
      { status: 500 }
    );
  }
}
