import { NextRequest, NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getB2Client } from "@/lib/b2/client";
import { logger } from "@/lib/logger";

const BUCKET_NAME = process.env.B2_BUCKET_NAME || "ScentLabs";

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const b2Key = params.path.join("/");
    const client = getB2Client();

    if (!client) {
      return new NextResponse("Storage proxy unavailable or credentials not configured", { status: 503 });
    }

    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: b2Key,
    });

    const response = await client.send(command);

    if (!response.Body) {
      return new NextResponse("File body empty", { status: 404 });
    }

    // Convert S3 stream to Web ReadableStream
    const stream = response.Body.transformToWebStream();

    const headers = new Headers();
    if (response.ContentType) headers.set("Content-Type", response.ContentType);
    if (response.ContentLength) headers.set("Content-Length", response.ContentLength.toString());
    if (response.ETag) headers.set("ETag", response.ETag);

    // High performance browser caching
    headers.set("Cache-Control", "public, max-age=31536000, immutable");

    return new NextResponse(stream, {
      status: 200,
      headers,
    });
  } catch (error: any) {
    if (error.name === "NoSuchKey" || error.$metadata?.httpStatusCode === 404) {
      return new NextResponse("Asset not found in Backblaze B2", { status: 404 });
    }
    logger.error("B2 Proxy Error", error);
    return new NextResponse("Internal Storage Proxy Error", { status: 500 });
  }
}
