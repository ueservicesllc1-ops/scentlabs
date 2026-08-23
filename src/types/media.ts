export type MediaType = 'image' | 'video' | 'vector' | 'document';

export interface ProductImage {
  id?: string;
  mediaId?: string;
  type?: 'image' | 'video';
  url: string;
  thumbnailUrl?: string;
  b2Key?: string;
  altText: string;
  width?: number;
  height?: number;
  fileSize?: number;
  mimeType?: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface ProductVideo {
  id: string;
  url: string;
  thumbnailUrl?: string;
  b2Key: string;
  duration?: number;
  mimeType: string;
  fileSize?: number;
  title?: string;
  sortOrder: number;
}

export interface MediaAsset {
  id: string;
  type: MediaType;
  b2Key: string;
  url: string;
  thumbnailUrl?: string;
  mimeType: string;
  fileSize: number;
  width?: number;
  height?: number;
  duration?: number;
  altText: string;
  sortOrder: number;
  isPrimary: boolean;
  entityType: 'product' | 'category' | 'customer_design' | 'marketing' | 'admin';
  entityId: string;
  accessLevel: 'public' | 'private_customer' | 'private_admin';
  ownerId?: string;
  createdAt: string;
  updatedAt: string;
}
