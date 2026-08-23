export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image?: string;
  parentId?: string | null;
  sortOrder: number;
  active: boolean;
  productCount?: number;
  metadata?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}
