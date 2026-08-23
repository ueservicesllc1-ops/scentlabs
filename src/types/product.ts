import { ProductImage, ProductVideo } from './media';
import { ProductPackage, VolumePriceTier } from './pricing';
import { CustomLabelConfig } from './index';

import { ProductCategory } from './index';

export type ProductStatus = 'active' | 'draft' | 'archived';

export interface ProductCostData {
  supplierCost: number;
  supplierQuantity: number;
  unitCost: number;
  inboundShippingCost?: number;
  packagingCost?: number;
  materialCost?: number;
  laborCost?: number;
  totalUnitCost: number;
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  sku: string;
  attributes: Record<string, string | number>;
  costData: ProductCostData;
  packageOptions: ProductPackage[];
  volumePricing?: VolumePriceTier[];
  images?: ProductImage[];
  inventory: {
    quantityInStock: number;
    reservedQuantity: number;
    availableQuantity: number;
    status: 'in_stock' | 'low_stock' | 'out_of_stock';
  };
  status: 'active' | 'inactive';
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  categoryId?: string;
  subcategoryId?: string;
  category: ProductCategory;
  subcategory?: string;
  brand?: string;
  
  // Sourcing info
  supplierId?: string;
  supplierProductId?: string;
  asin?: string;
  externalUrl?: string;
  
  sku: string;
  status: ProductStatus;
  featured?: boolean;
  tags: string[];
  attributes: Record<string, string | number>;
  
  // Media (B2 References)
  media: ProductImage[];
  images?: ProductImage[];
  videos?: ProductVideo[];
  
  // Cost (Admin only)
  costData: ProductCostData;
  
  // Pricing
  currency: 'USD';
  basePrice: number;
  packageOptions: ProductPackage[];
  volumePricing?: VolumePriceTier[];
  discountEligible: boolean;
  minimumDiscountMargin: number;
  
  // Variants
  hasVariants: boolean;
  variants?: ProductVariant[];
  variantIds?: string[];
  
  unit?: string;
  
  // Relationships
  relatedProducts?: string[];
  recommendedProducts?: string[];
  complementaryProductIds: string[];
  recommendedProductIds: string[];
  
  // Customization
  customizable: boolean;
  customizationType?: 'label' | 'box' | 'tag' | 'print';
  customLabelConfig?: {
    hasCustomLabel: boolean;
    targetLabelProductId?: string;
    recommendedWidthInches: number;
    recommendedHeightInches: number;
    recommendedWidthCm?: number;
    recommendedHeightCm?: number;
    bottleDiameterInches?: number;
    bottleHeightInches?: number;
    calloutText: string;
  };
  
  // Inventory status
  inventory: {
    quantityInStock: number;
    reservedQuantity: number;
    availableQuantity: number;
    lowStockThreshold: number;
    reorderPoint: number;
    status: 'in_stock' | 'low_stock' | 'out_of_stock';
  };
  
  createdAt: string;
  updatedAt: string;
}
