import { PerfumeBase, KitProduct } from "@/types/perfume-making";
import { calculateCostPerLiter, calculateBaseRepackagingCost } from "@/lib/perfume-making/conversions";

// 1 Gallon = 3.78541 L @ $49.99 = $13.206 / Liter
const baseCostCalc = calculateCostPerLiter(49.99, 1, "gallon");

const variant1L = calculateBaseRepackagingCost({
  costPerLiter: baseCostCalc.costPerLiter,
  sellingSizeLiters: 1.0,
  bottleCost: 1.43, // Steve Spangler 1L Bottle
});

const variant500ml = calculateBaseRepackagingCost({
  costPerLiter: baseCostCalc.costPerLiter,
  sellingSizeLiters: 0.5,
  bottleCost: 0.85,
});

const variant250ml = calculateBaseRepackagingCost({
  costPerLiter: baseCostCalc.costPerLiter,
  sellingSizeLiters: 0.25,
  bottleCost: 0.65,
});

export const INITIAL_PERFUME_BASES: PerfumeBase[] = [
  {
    id: "prod_perfume_base_nature_oil",
    name: "Nature's Oil Pure Perfumer's Alcohol & Base",
    slug: "perfumers-alcohol-base",
    description: "Formulator-grade, crystal-clear 200-proof perfumer's base alcohol. Specifically denatured for fine fragrance compounding, body mists, and Eau de Parfum dilution without residual chemical odor.",
    supplierId: "sup_amazon",
    supplierName: "Nature's Oil",
    supplierProductId: "B0GGDJD96Y",
    supplierUrl: "https://www.amazon.com/dp/B0GGDJD96Y",
    sourceQuantity: 1,
    sourceUnit: "gallon",
    sourceCost: 49.99,
    costPerLiter: baseCostCalc.costPerLiter,
    inventoryVolumeLiters: 7.57, // 2 gallons in bulk
    primaryImage: "/images/products/perfume-base-1l.jpg",
    media: [
      {
        id: "med_base_1",
        b2Key: "products/prod_perfume_base_nature_oil/images/base_main.webp",
        url: "/images/products/perfume-base-1l.jpg",
        altText: "Perfume Base 1 Liter",
        isPrimary: true,
        sortOrder: 1,
      },
    ],
    status: "active",
    repackagingVariants: [
      {
        id: "var_base_1liter",
        name: "1 Liter Dispensing Bottle (Steve Spangler Container)",
        size: 1.0,
        unit: "liter",
        sku: "BASE-ALC-1L",
        containerProductId: "prod_bottle_1liter_spangler",
        costBreakdown: variant1L.breakdown,
        unitCost: variant1L.unitCost,
        retailPrice: 21.99,
        suggestedRetailPrice: variant1L.suggestedPrice,
        grossProfit: 21.99 - variant1L.unitCost,
        marginPercent: Math.round(((21.99 - variant1L.unitCost) / 21.99) * 1000) / 10,
        inventoryQuantity: 45,
        active: true,
      },
      {
        id: "var_base_500ml",
        name: "500 ml Glass Dispensing Bottle",
        size: 0.5,
        unit: "liter",
        sku: "BASE-ALC-500ML",
        containerProductId: "prod_bottle_500ml",
        costBreakdown: variant500ml.breakdown,
        unitCost: variant500ml.unitCost,
        retailPrice: 13.99,
        suggestedRetailPrice: variant500ml.suggestedPrice,
        grossProfit: 13.99 - variant500ml.unitCost,
        marginPercent: Math.round(((13.99 - variant500ml.unitCost) / 13.99) * 1000) / 10,
        inventoryQuantity: 30,
        active: true,
      },
      {
        id: "var_base_250ml",
        name: "250 ml Glass Dispensing Bottle",
        size: 0.25,
        unit: "liter",
        sku: "BASE-ALC-250ML",
        containerProductId: "prod_bottle_250ml",
        costBreakdown: variant250ml.breakdown,
        unitCost: variant250ml.unitCost,
        retailPrice: 8.50,
        suggestedRetailPrice: variant250ml.suggestedPrice,
        grossProfit: 8.50 - variant250ml.unitCost,
        marginPercent: Math.round(((8.50 - variant250ml.unitCost) / 8.50) * 1000) / 10,
        inventoryQuantity: 25,
        active: true,
      },
    ],
    createdAt: "2026-08-23T00:00:00.000Z",
    updatedAt: "2026-08-23T00:00:00.000Z",
  },
];

export const INITIAL_PERFUME_KITS: KitProduct[] = [
  {
    id: "kit_master_perfume_maker",
    name: "Master Perfume Compounding & Bottling Studio Kit",
    slug: "master-perfume-maker-kit",
    description: "Complete commercial studio workflow bundle: 1 Liter Perfumer's Base, 10x 10ml Glass Roll-Ons, 20x 3ml Pipettes, 10x Custom Die-Cut Foil Labels, 10x Cricut Presentation Boxes, and 10x Holographic Security Seals.",
    items: [
      { productId: "prod_perfume_base_nature_oil", variantId: "var_base_1liter", productName: "1 Liter Perfume Base", category: "base", quantity: 1, unit: "bottle", unitPrice: 21.99, required: true },
      { productId: "prod_rollon_10ml", productName: "10 ml Glass Roll-On Bottles (10-Pack)", category: "bottles", quantity: 10, unit: "bottle", unitPrice: 1.20, required: true },
      { productId: "prod_pipettes_3ml", productName: "3 ml Transfer Pipettes (20-Pack)", category: "tools", quantity: 20, unit: "pipette", unitPrice: 0.09, required: true },
      { productId: "prod_custom_labels", productName: "Custom Metallic Foil Labels (10-Pack)", category: "labels", quantity: 10, unit: "label", unitPrice: 0.60, required: true },
      { productId: "prod_perfume_boxes", productName: "Cricut Perfume Presentation Boxes (10-Pack)", category: "packaging", quantity: 10, unit: "box", unitPrice: 0.45, required: true },
      { productId: "prod_security_stickers", productName: "Holographic Security Seals (10-Pack)", category: "packaging", quantity: 10, unit: "sticker", unitPrice: 0.03, required: true },
    ],
    individualTotal: 48.99,
    kitPrice: 39.99,
    savings: 9.00,
    discountPercent: 18.4,
    inventoryQuantity: 35,
    active: true,
    primaryImage: "/images/products/perfume-kit-master.jpg",
    createdAt: "2026-08-23T00:00:00.000Z",
    updatedAt: "2026-08-23T00:00:00.000Z",
  },
];
