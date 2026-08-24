import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getB2Client } from './client';
import { b2Paths } from './paths';
import { logger } from '../logger';

/**
 * Downloads a reference image from a URL and uploads it directly to Backblaze B2
 * without touching the local disk.
 */
export async function uploadReferenceImageFromUrl(
  brand: string,
  product: string,
  sourceUrl: string,
  filename: string
): Promise<{ b2Path: string; b2Url: string } | null> {
  const s3Client = getB2Client();
  const bucketName = process.env.B2_BUCKET_NAME;
  const publicUrlBase = process.env.B2_PUBLIC_URL || 'https://f005.backblazeb2.com/file';

  if (!s3Client || !bucketName) {
    logger.warn('B2 client not configured. Cannot upload reference image.');
    return null;
  }

  try {
    // 1. Download image to memory
    const response = await fetch(sourceUrl);
    if (!response.ok) {
      logger.error(`Failed to download source image from ${sourceUrl}: ${response.statusText}`);
      return null;
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    let contentType = response.headers.get('content-type') || 'image/jpeg';
    
    // Validate it's an image
    if (!contentType.startsWith('image/')) {
      logger.warn(`Fetched URL did not return an image. Type: ${contentType}`);
      contentType = 'image/jpeg'; // fallback
    }

    // 2. Generate B2 Path
    const safeBrand = brand.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    const safeProduct = product.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    const b2Path = b2Paths.referenceImage(safeBrand, safeProduct, filename);

    // 3. Upload to B2
    const uploadCommand = new PutObjectCommand({
      Bucket: bucketName,
      Key: b2Path,
      Body: buffer,
      ContentType: contentType,
      ContentLength: buffer.length,
    });

    await s3Client.send(uploadCommand);

    const b2Url = `${publicUrlBase}/${bucketName}/${b2Path}`;
    
    return { b2Path, b2Url };

  } catch (error) {
    logger.error(`Error uploading reference image: ${(error as Error).message}`);
    return null;
  }
}
