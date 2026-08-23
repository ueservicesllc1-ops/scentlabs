// SCENTLAB — Central Type Exports
export * from './product';
export * from './pricing';
export * from './inventory';
export * from './media';
export * from './category';
export * from './customer';
export * from './order';
export * from './recommendation';
export * from './supplier';
export * from './custom-label';
export * from './packaging';
export * from './testing';
export * from './perfume-making';

export type ProductCategory = 
  | 'fragrance'
  | 'bottles'
  | 'packaging'
  | 'tools'
  | 'testing'
  | 'custom'
  | 'custom-labels'
  | 'labels'
  | 'perfume-making'
  | 'kits'
  | 'wholesale';

export type ProductUnit = 'unit' | 'oz' | 'ml' | 'sheet' | 'strip' | 'bag';

// Convenience aliases
export type SellingPackage = import('./pricing').ProductPackage;
export type ProductMediaReference = import('./media').ProductImage;

export interface CustomLabelConfig {
  hasCustomLabel: boolean;
  targetLabelProductId?: string;
  recommendedWidthInches: number;
  recommendedHeightInches: number;
  recommendedWidthCm?: number;
  recommendedHeightCm?: number;
  bottleDiameterInches?: number;
  bottleHeightInches?: number;
  calloutText: string;
}

export interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  productName: string;
  productSlug: string;
  category: ProductCategory;
  sku: string;
  image: string;
  selectedPackage: import('./pricing').ProductPackage;
  packageCount: number;
  totalUnits: number;
  unitPrice: number;
  packagePrice: number;
  totalLinePrice: number;
  totalPrice?: number;
  isLinkedToParent?: boolean;
  parentCartItemId?: string;
  selectedVariant?: {
    id: string;
    name: string;
    sku: string;
  };
  customLabelConfigurationId?: string;
  customLabelSpecs?: {
    bottleName: string;
    dimensions: string;
    material: string;
    customText?: string;
  };
}

export * from './fragrance';

