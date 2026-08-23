export type CustomLabelStatus =
  | 'draft'
  | 'pendingReview'
  | 'approved'
  | 'rejected'
  | 'production'
  | 'completed'
  | 'cancelled';

export interface LabelSize {
  id: string;
  name: string; // e.g. "1.5 x 2.25"
  width: number; // in inches
  height: number; // in inches
  unit: 'in' | 'cm';
  area: number; // width * height
  widthCm: number;
  heightCm: number;
  active: boolean;
}

export interface LabelMaterial {
  id: string;
  name: string; // e.g. "Gold Foil + Matte Vinyl"
  description: string;
  active: boolean;
  materialCostPerSqIn: number; // base material basis ($0.00460 / sq in)
  productionCost: number; // printing / hot stamping
  additionalCost: number; // premium finishes
  hexColorPreview?: string;
  finishType: 'gold_foil' | 'silver_foil' | 'rose_gold_foil' | 'holographic' | 'matte_vinyl' | 'gloss_vinyl';
}

export interface CustomLabelPricing {
  id: string;
  labelSizeId: string;
  materialId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  minimumQuantity: number;
  active: boolean;
}

export interface LabelDesignData {
  elements?: any[];
  background?: {
    color?: string;
    finish?: string;
  };
  dimensions?: {
    width: number;
    height: number;
    unit: string;
  };
  textFields?: {
    brandName?: string;
    fragranceName?: string;
    customText?: string;
    volumeText?: string;
  };
}

export interface CustomLabelConfiguration {
  id: string;
  customerId?: string | null;
  productId?: string; // e.g. "prod_rollon_10ml"
  customLabelProductId: string; // "prod_custom_labels"
  labelSizeId: string;
  labelSizeName: string;
  width: number;
  height: number;
  materialId: string;
  materialName: string;
  quantity: number;
  brandName: string;
  fragranceName: string;
  customText?: string;
  logoFileId?: string;
  logoUrl?: string;
  designFileId?: string;
  designUrl?: string;
  notes?: string;
  status: CustomLabelStatus;
  price: number;
  unitPrice: number;
  designData?: LabelDesignData;
  productionNotes?: string;
  productionDate?: string;
  completedDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LabelTemplate {
  id: string;
  name: string;
  thumbnail: string;
  labelSizeId: string;
  materialId: string;
  designData: LabelDesignData;
  category?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LabelSheetYield {
  sheetWidth: number; // 8.5"
  sheetHeight: number; // 11"
  labelWidth: number;
  labelHeight: number;
  spacing: number;
  bleed: number;
  labelsPerSheetPortrait: number;
  labelsPerSheetLandscape: number;
  optimalLabelsPerSheet: number;
  optimalOrientation: 'portrait' | 'landscape';
  estimatedSheetsRequired: number;
}

export interface LabelCostBreakdown {
  labelWidth: number;
  labelHeight: number;
  areaPerLabel: number;
  quantity: number;
  materialCost: number;
  wasteFactor: number;
  wasteCost: number;
  productionCost: number;
  laborCost: number;
  packagingCost: number;
  totalCost: number;
  unitCost: number;
  sellingPrice: number;
  unitPrice: number;
  grossMarginDollar: number;
  grossMarginPercent: number;
}

// Backward compatibility aliases
export type CustomLabel = CustomLabelConfiguration;
export type CustomLabelSpec = {
  id: string;
  bottleProductId: string;
  bottleName: string;
  bottleDiameterInches: number;
  bottleHeightInches: number;
  labelWidthInches: number;
  labelHeightInches: number;
  labelWidthCm: number;
  labelHeightCm: number;
  recommendedFinish: string;
  calloutText: string;
  active: boolean;
};
