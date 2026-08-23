export interface ProductPackage {
  id: string;
  name?: string;
  label?: string;
  quantity: number;
  price: number;
  unitPrice: number;
  isDefault?: boolean;
}

export interface VolumePriceTier {
  minQuantity: number;
  maxQuantity?: number;
  unitPrice: number;
  discountPercentage?: number;
}

export interface PricingTier {
  quantity: number;
  price: number;
  unitPrice: number;
}

export interface ProductPrice {
  currency: 'USD';
  baseUnitPrice: number;
  packages: ProductPackage[];
  volumeTiers?: VolumePriceTier[];
  discountEligible: boolean;
  minimumRequiredMargin: number;
}

export interface CalculatedPriceResult {
  unitPrice: number;
  totalPrice: number;
  discountAmount: number;
  effectiveDiscountPercentage: number;
  priceTierName: string;
  isMarginGuarded: boolean;
}
