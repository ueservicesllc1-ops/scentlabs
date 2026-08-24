import { ProductImage, ProductVideo } from './media';
import { ProductPackage, VolumePriceTier } from './pricing';
import { ProductCategory } from './index';

export type ProductStatus = 'draft' | 'active' | 'inactive' | 'archived';

export type ProductType =
  | 'physical'
  | 'digital'
  | 'service'
  | 'custom'
  | 'component'
  | 'raw_material'
  | 'bulk'
  | 'packaging'
  | 'finished_perfume';

export interface ProductMediaItem {
  id: string;
  mediaId?: string;
  b2Key: string;
  url: string;
  fileName: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  altText?: string;
  sortOrder: number;
  isPrimary: boolean;
  createdAt: string;
}

export interface ProductCostData {
  supplierCost: number;
  supplierQuantity?: number;
  unitCost: number;
  lastCost?: number;
  averageCost?: number;
  inboundShippingCost?: number;
  packagingCost?: number;
  materialCost?: number;
  laborCost?: number;
  totalUnitCost: number;
  landedCost?: number;
}

export interface ProductShippingData {
  weight: number; // in weightUnit
  weightOz?: number;
  weightUnit: 'oz' | 'lb' | 'g' | 'kg';
  length: number;
  width: number;
  height: number;
  dimensionUnit: 'in' | 'cm';
  requiresSpecialHandling?: boolean;
}

export interface ProductSupplierData {
  primarySupplierId?: string;
  primarySupplierName?: string;
  supplierProductId?: string;
  supplierSku?: string;
  supplierUrl?: string;
  supplierPackSize?: number;
  moq?: number;
  leadTimeDays?: number;
  alternativeSupplierIds?: string[];
}

export interface ProductSeoData {
  metaTitle?: string;
  metaDescription?: string;
  ogImageUrl?: string;
  canonicalUrl?: string;
  noindex?: boolean;
}

export interface CustomLabelProductConfig {
  isCustomLabelProduct?: boolean;
  hasCustomLabel?: boolean;
  targetLabelProductId?: string;
  materials?: Array<{
    id: string;
    name: string;
    description?: string;
    priceMultiplier?: number;
    costPerSqInch?: number;
    pricePerSqInch?: number;
  }>;
  availableSizes?: Array<{
    id: string;
    name: string;
    widthInches: number;
    heightInches: number;
    squareInches?: number;
  }>;
  areaCostPerSqInch?: number;
  areaPricePerSqInch?: number;
  minimumQuantity?: number;
  quantityTiers?: VolumePriceTier[];
  printingMethod?: string;
  finishing?: string;
  productionMethod?: string;
  recommendedWidthInches?: number;
  recommendedHeightInches?: number;
  recommendedWidthCm?: number;
  recommendedHeightCm?: number;
  bottleDiameterInches?: number;
  bottleHeightInches?: number;
  calloutText?: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  cost?: number;
  stock?: number;
  attributes: Record<string, string | number>;
  costData?: ProductCostData;
  packageOptions?: ProductPackage[];
  volumePricing?: VolumePriceTier[];
  images?: ProductImage[];
  media?: ProductMediaItem[];
  shipping?: ProductShippingData;
  inventory: {
    quantityInStock: number;
    reservedQuantity: number;
    availableQuantity: number;
    status: 'in_stock' | 'low_stock' | 'out_of_stock';
  };
  status: 'active' | 'inactive';
}

export interface ProductCompleteness {
  score: number; // 0 to 100
  missingFields: string[];
  isComplete: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  usageInstructions?: string;
  careInstructions?: string;
  
  categoryId?: string;
  categoryName?: string;
  subcategoryId?: string;
  category: ProductCategory | string;
  subcategory?: string;
  brand?: string;
  productType?: ProductType;
  
  // Sourcing info
  supplierId?: string;
  supplierName?: string;
  supplierProductId?: string;
  supplierSku?: string;
  supplierUrl?: string;
  supplierPackSize?: number;
  source?: string;
  sourceReferenceId?: string;
  sourcePrice?: number;
  supplier?: ProductSupplierData;
  asin?: string;
  externalUrl?: string;
  
  sku: string;
  status: ProductStatus;
  featured?: boolean;
  isNew?: boolean;
  isBestSeller?: boolean;
  isOnSale?: boolean;
  requiresImage?: boolean;
  tags: string[];
  attributes: Record<string, string | number>;
  
  // Media (B2 References)
  media: ProductMediaItem[] | ProductImage[];
  images?: ProductImage[];
  videos?: ProductVideo[];
  primaryImageUrl?: string;
  
  // Cost (Admin only)
  cost?: number;
  costData?: ProductCostData;
  margin?: number;
  marginPercent?: number;
  
  // Pricing
  currency: 'USD';
  price?: number;
  basePrice: number;
  compareAtPrice?: number;
  packageOptions?: ProductPackage[];
  volumePricing?: VolumePriceTier[];
  discountEligible?: boolean;
  minimumDiscountMargin?: number;
  
  // Variants
  hasVariants: boolean;
  variants?: ProductVariant[];
  variantIds?: string[];
  
  unit?: string;
  
  // Inventory status & location
  inventory: {
    quantityInStock: number;
    reservedQuantity?: number;
    availableQuantity?: number;
    lowStockThreshold: number;
    reorderPoint: number;
    location?: string;
    status: 'in_stock' | 'low_stock' | 'out_of_stock';
  };
  
  // Shipping (Shippo calculation)
  shipping?: ProductShippingData;
  
  // Relationships & Recommendations
  relatedProducts?: string[];
  recommendedProducts?: string[];
  complementaryProductIds?: string[];
  recommendedProductIds?: string[];
  crossSellProductIds?: string[];
  upsellProductIds?: string[];
  accessoryProductIds?: string[];
  completeYourProductIds?: string[];
  
  // Customization / Custom Label
  customizable?: boolean;
  isCustomLabelProduct?: boolean;
  customizationType?: 'label' | 'box' | 'tag' | 'print';
  customLabelConfig?: CustomLabelProductConfig;
  
  // SEO
  seo?: ProductSeoData;
  
  // Completeness score
  completeness?: ProductCompleteness;
  
  // Internal Admin metadata
  internalNotes?: string;
  externalProductId?: string;
  
  // Finished Perfume & Inspiration (Dupe) Master Fields
  brandType?: "arabic" | "designer_niche";
  upc?: string;
  barcode?: string;
  inspiredBy?: string;
  originalBrand?: string;
  relationshipType?: string;
  estimatedSimilarity?: string;
  isOneToOne?: string | boolean;
  referencePrice?: number;
  notes?: string;

  createdAt: string;
  updatedAt: string;
}
