import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getB2Client } from "@/lib/b2/client";
import { b2Paths } from "@/lib/b2/paths";
import { mediaMetadataService } from "@/lib/firestore/media";
import { MediaAsset } from "@/types/media";
import { logger } from "@/lib/logger";

const BUCKET_NAME = process.env.B2_BUCKET_NAME || "ScentLabs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const entityType = (formData.get("entityType") as any) || "product";
    const entityId = (formData.get("entityId") as string) || "general";
    const altText = (formData.get("altText") as string) || "";
    const isPrimary = formData.get("isPrimary") === "true";
    const sortOrder = parseInt(formData.get("sortOrder") as string) || 1;
    const accessLevel = (formData.get("accessLevel") as any) || "public";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const client = getB2Client();
    if (!client) {
      return NextResponse.json(
        { error: "Backblaze B2 S3 storage client not initialized" },
        { status: 503 }
      );
    }

    // Generate safe unique filename and B2 key
    const timestamp = Date.now();
    const cleanFileName = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    
    let b2Key = "";
    if (entityType === "product") {
      b2Key = file.type.startsWith("video/")
        ? b2Paths.productVideo(entityId, cleanFileName)
        : b2Paths.productImage(entityId, cleanFileName);
    } else if (entityType === "category") {
      b2Key = b2Paths.categoryImage(entityId, cleanFileName);
    } else if (entityType === "customer_design") {
      b2Key = b2Paths.designFile(entityId, cleanFileName);
    } else {
      b2Key = b2Paths.marketingAsset(cleanFileName);
    }

    // Convert file to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Backblaze B2
    const uploadCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: b2Key,
      Body: buffer,
      ContentType: file.type,
    });

    await client.send(uploadCommand);
    logger.info(`File uploaded to B2 bucket "${BUCKET_NAME}" with key: ${b2Key}`);

    // Create and save MediaAsset metadata in Firestore
    const assetId = `med_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const proxyUrl = `/api/media/${b2Key}`;

    const mediaAsset: MediaAsset = {
      id: assetId,
      type: file.type.startsWith("video/") ? "video" : "image",
      b2Key,
      url: proxyUrl,
      mimeType: file.type,
      fileSize: buffer.length,
      altText: altText || file.name,
      sortOrder,
      isPrimary,
      entityType,
      entityId,
      accessLevel,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await mediaMetadataService.saveMetadata(mediaAsset);

    return NextResponse.json(
      {
        success: true,
        mediaAsset,
      },
      { status: 201 }
    );
  } catch (error: any) {
    logger.error("Media upload and Firestore sync failed", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload file to Backblaze B2" },
      { status: 500 }
    );
  }
}
