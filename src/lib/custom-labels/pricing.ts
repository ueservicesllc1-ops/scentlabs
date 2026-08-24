import { 
  BASE_SHEET_CONFIG, 
  STANDARD_LABEL_MATERIALS, 
  LABEL_TEXT_COLORS,
  BASE_LABEL_PRICING_MATRIX,
  OFFICIAL_LABEL_PRICING_TIERS 
} from "@/config/custom-labels";
import { LabelCostBreakdown, LabelMaterial } from "@/types/custom-label";
import { calculateLabelSheetYield } from "./sheet-calculator";

export interface CustomLabelPricingConfig {
  wasteFactor?: number;
  laborRatePerSheet?: number;
  packagingCost?: number;
  targetGrossMargin?: number;
}

/**
 * Calculates internal manufacturing cost for custom labels (Admin breakdown).
 */
export function calculateLabelCost(
  width: number,
  height: number,
  quantity: number,
  material: LabelMaterial,
  config: CustomLabelPricingConfig = {}
): LabelCostBreakdown {
  const wasteFactor = config.wasteFactor ?? BASE_SHEET_CONFIG.defaultWasteFactor;
  const laborRate = config.laborRatePerSheet ?? BASE_SHEET_CONFIG.defaultLaborRatePerSheet;
  const packagingCost = config.packagingCost ?? BASE_SHEET_CONFIG.defaultPackagingCostPerOrder;

  const areaPerLabel = width * height;
  const rawMaterialCost = areaPerLabel * material.materialCostPerSqIn * quantity;
  const wasteCost = rawMaterialCost * wasteFactor;
  const totalMaterialWithWaste = rawMaterialCost + wasteCost;

  // Sheet calculations for labor & machine setup
  const sheetYield = calculateLabelSheetYield(width, height, quantity);
  const sheetsNeeded = sheetYield.estimatedSheetsRequired;

  const productionCost = (material.productionCost + material.additionalCost) * quantity;
  const laborCost = sheetsNeeded * laborRate;

  const totalCost = Math.round((totalMaterialWithWaste + productionCost + laborCost + packagingCost) * 100) / 100;
  const unitCost = Math.round((totalCost / Math.max(1, quantity)) * 1000) / 1000;

  // Match selling price with official matrix pricing
  const pricing = calculateLabelPricing(width, height, quantity, material.id);
  const sellingPrice = pricing.totalPrice;
  const unitPrice = pricing.unitPrice;

  const grossMarginDollar = Math.round((sellingPrice - totalCost) * 100) / 100;
  const grossMarginPercent = Math.round((grossMarginDollar / Math.max(1, sellingPrice)) * 1000) / 10;

  return {
    labelWidth: width,
    labelHeight: height,
    areaPerLabel: Math.round(areaPerLabel * 100) / 100,
    quantity,
    materialCost: Math.round(totalMaterialWithWaste * 100) / 100,
    wasteFactor,
    wasteCost: Math.round(wasteCost * 100) / 100,
    productionCost: Math.round(productionCost * 100) / 100,
    laborCost: Math.round(laborCost * 100) / 100,
    packagingCost: Math.round(packagingCost * 100) / 100,
    totalCost,
    unitCost,
    sellingPrice,
    unitPrice,
    grossMarginDollar,
    grossMarginPercent,
  };
}

/**
 * SINGLE SOURCE OF TRUTH for Custom Label Pricing across Georgina Wholesale.
 *
 * Formula: BASE_PRICE(Size, Quantity) * MAX(MaterialMultiplier, TextColorMultiplier)
 * Rounded to 2 decimal places.
 */
export function calculateLabelPricing(
  width: number,
  height: number,
  quantity: number,
  materialId: string = "mat_black",
  textColorId?: string
): {
  unitPrice: number;
  totalPrice: number;
  materialName: string;
  materialMultiplier: number;
  volumeTierSavingsPercent: number;
} {
  // 1. Material & Text Color lookup & Multiplier
  const material = STANDARD_LABEL_MATERIALS.find((m) => m.id === materialId) ||
    STANDARD_LABEL_MATERIALS.find((m) => m.finishType === materialId) ||
    STANDARD_LABEL_MATERIALS[0];

  const textColor = LABEL_TEXT_COLORS.find((t) => t.id === textColorId || t.type === textColorId) || LABEL_TEXT_COLORS[0];

  const baseMult = material.priceMultiplier ?? 1.0;
  const textMult = textColor.multiplier ?? 1.0;
  const materialMultiplier = Math.max(baseMult, textMult);

  // 2. Size Matrix lookup
  const minDim = Math.min(width, height);
  const maxDim = Math.max(width, height);

  // Exact or min/max dimension match
  let matchedRow = BASE_LABEL_PRICING_MATRIX.find((r) =>
    (Math.abs(r.width - minDim) < 0.01 && Math.abs(r.height - maxDim) < 0.01) ||
    (Math.abs(r.width - maxDim) < 0.01 && Math.abs(r.height - minDim) < 0.01)
  );

  // Closest match if custom size
  if (!matchedRow) {
    let minDistance = Infinity;
    for (const r of BASE_LABEL_PRICING_MATRIX) {
      const rMin = Math.min(r.width, r.height);
      const rMax = Math.max(r.width, r.height);
      const dist = Math.sqrt(Math.pow(minDim - rMin, 2) + Math.pow(maxDim - rMax, 2));
      if (dist < minDistance) {
        minDistance = dist;
        matchedRow = r;
      }
    }
  }

  const row = matchedRow || BASE_LABEL_PRICING_MATRIX[5]; // Fallback 1.5x2.5

  // 3. Base Total Price lookup / interpolation for quantity
  let baseTotalPrice: number;

  if (row.prices[quantity] !== undefined) {
    baseTotalPrice = row.prices[quantity];
  } else {
    const sortedQtys = [50, 100, 250, 500, 1000];
    if (quantity <= 50) {
      baseTotalPrice = row.prices[50];
    } else if (quantity >= 1000) {
      const base1000 = row.prices[1000];
      const unit1000 = base1000 / 1000;
      baseTotalPrice = Math.round(quantity * unit1000 * 100) / 100;
    } else {
      let lowerQty = 50;
      let upperQty = 100;
      for (let i = 0; i < sortedQtys.length - 1; i++) {
        if (quantity >= sortedQtys[i] && quantity <= sortedQtys[i + 1]) {
          lowerQty = sortedQtys[i];
          upperQty = sortedQtys[i + 1];
          break;
        }
      }
      const lowerPrice = row.prices[lowerQty];
      const upperPrice = row.prices[upperQty];
      const fraction = (quantity - lowerQty) / (upperQty - lowerQty);
      baseTotalPrice = lowerPrice + fraction * (upperPrice - lowerPrice);
    }
  }

  // 4. Calculate Final Prices
  const totalPrice = Math.round(baseTotalPrice * materialMultiplier * 100) / 100;
  const unitPrice = Math.round((totalPrice / Math.max(1, quantity)) * 100) / 100;

  // 5. Volume Tier Savings Percent (against 50 unit rate)
  const base50Total = row.prices[50] * materialMultiplier;
  const base50Unit = base50Total / 50;
  const volumeTierSavingsPercent = Math.max(0, Math.round(((base50Unit - unitPrice) / base50Unit) * 100));

  return {
    unitPrice,
    totalPrice,
    materialName: material.name,
    materialMultiplier,
    volumeTierSavingsPercent,
  };
}
