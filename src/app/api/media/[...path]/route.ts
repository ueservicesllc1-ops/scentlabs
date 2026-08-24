import { NextRequest, NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getB2Client } from "@/lib/b2/client";
import { logger } from "@/lib/logger";
import fs from "fs";
import path from "path";

const BUCKET_NAME = process.env.B2_BUCKET_NAME || "ScentLabs";

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const b2Key = params.path.join("/");

  // 1. Try B2 Client if available
  try {
    const client = getB2Client();
    if (client) {
      const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: b2Key,
      });

      const response = await client.send(command);

      if (response.Body) {
        const stream = response.Body.transformToWebStream();
        const headers = new Headers();
        if (response.ContentType) headers.set("Content-Type", response.ContentType);
        if (response.ContentLength) headers.set("Content-Length", response.ContentLength.toString());
        headers.set("Cache-Control", "public, max-age=31536000, immutable");

        return new NextResponse(stream, {
          status: 200,
          headers,
        });
      }
    }
  } catch (b2Err: any) {
    logger.warn(`B2 GET Proxy miss for key ${b2Key}: ${b2Err.message}`);
  }

  // 2. Local File System Fallback
  try {
    const filename = params.path[params.path.length - 1];
    const candidatePaths = [
      path.join(process.cwd(), "public", "uploads", filename),
      path.join(process.cwd(), "public", "images", "products", filename),
      path.join(process.cwd(), "public", "images", filename),
      path.join(process.cwd(), "public", b2Key),
    ];

    for (const filePath of candidatePaths) {
      if (fs.existsSync(filePath)) {
        const fileBuffer = fs.readFileSync(filePath);
        const ext = path.extname(filePath).toLowerCase();
        let mimeType = "image/jpeg";
        if (ext === ".png") mimeType = "image/png";
        else if (ext === ".webp") mimeType = "image/webp";
        else if (ext === ".svg") mimeType = "image/svg+xml";

        return new NextResponse(fileBuffer, {
          status: 200,
          headers: {
            "Content-Type": mimeType,
            "Cache-Control": "public, max-age=86400",
          },
        });
      }
    }
  } catch (localErr: any) {
    logger.error("Local Media Proxy Error", localErr);
  }

  return new NextResponse("Asset not found", { status: 404 });
}
