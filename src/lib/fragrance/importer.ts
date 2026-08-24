import { FragranceOil, VolumeUnit, RepackagingVariant } from "@/types/fragrance";
import { Product, ProductPackage } from "@/types";
import { calculateCostPerOz } from "./conversions";
import { calculateRepackagingCost } from "./pricing";
import { fragranceRepository } from "../firestore/fragrance";
import { productRepository } from "../firestore/products";
import { inventoryRepository } from "../firestore/inventory";
import { RawAfricaFragrance } from "./africa-imports-scraper";

export interface CsvFragranceRow {
  name: string;
  supplierProductId?: string;
  supplierUrl?: string;
  category?: string;
  scentFamily?: string;
  gender?: string;
  sourceSize: string | number;
  sourceUnit: string;
  sourceCost: string | number;
  description?: string;
}

export interface ImportPreviewItem {
  row: number;
  data: Partial<FragranceOil>;
  duplicateMatch?: FragranceOil;
  action: "create" | "update" | "skip";
  isValid: boolean;
  errors: string[];
}

/**
 * Parses CSV raw string into structured rows.
 */
export function parseCsvContent(csvText: string): CsvFragranceRow[] {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/"/g, ""));
  const rows: CsvFragranceRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || lines[i].split(",");
    const rowObj: any = {};

    headers.forEach((header, idx) => {
      let val = cols[idx] ? cols[idx].trim().replace(/^"|"$/g, "") : "";
      rowObj[header] = val;
    });

    if (rowObj.name || rowObj["fragrance name"] || rowObj.title) {
      rows.push({
        name: rowObj.name || rowObj["fragrance name"] || rowObj.title,
        supplierProductId: rowObj.supplierproductid || rowObj.sku || rowObj["item #"] || rowObj.item_number,
        supplierUrl: rowObj.supplierurl || rowObj.url || rowObj.link,
        category: rowObj.category || "fragrance_oils",
        scentFamily: rowObj.scentfamily || rowObj.family || rowObj.notes || "Woody",
        gender: rowObj.gender || "unisex",
        sourceSize: parseFloat(rowObj.sourcesize || rowObj.size || "32") || 32,
        sourceUnit: (rowObj.sourceunit || rowObj.unit || "oz").toLowerCase(),
        sourceCost: parseFloat(rowObj.sourcecost || rowObj.cost || rowObj.price || "50") || 50,
        description: rowObj.description || rowObj.desc || "",
      });
    }
  }

  return rows;
}

/**
 * Normalizes SKU for SCENTLAB formatting: SC-FR-{sourceSku}
 */
export function generateScentlabSku(sourceSku: string): string {
  const clean = (sourceSku || "UNK")
    .toUpperCase()
    .replace(/[^A-Z0-9_-]/g, "");
  return `SC-FR-${clean}`;
}

/**
 * Calculates SCENTLAB repackaging variants using established 25% target margin formula:
 * Selling Price = Total Cost / 0.75
 */
export function buildScentlabVariants(
  fragranceId: string,
  slug: string,
  sourceSku: string,
  costPerOz: number
): RepackagingVariant[] {
  // Standard APPROVED SCENTLAB customer packaging sizes (1 oz, 2 oz, 4 oz, 8 oz, 16 oz)
  const sizes = [
    { size: 1, unit: "oz" as const, label: "1 oz (30 ml)", containerCost: 0.55, labelCost: 0.15 },
    { size: 2, unit: "oz" as const, label: "2 oz (60 ml)", containerCost: 0.65, labelCost: 0.18 },
    { size: 4, unit: "oz" as const, label: "4 oz (120 ml)", containerCost: 0.85, labelCost: 0.20 },
    { size: 8, unit: "oz" as const, label: "8 oz (240 ml)", containerCost: 1.10, labelCost: 0.22 },
    { size: 16, unit: "oz" as const, label: "16 oz (1 lb)", containerCost: 1.50, labelCost: 0.25 },
  ];

  return sizes.map((s, idx) => {
    const rawOilCost = Math.round(costPerOz * s.size * 100) / 100;
    const laborCost = 0.15;
    const totalUnitCost = Math.round((rawOilCost + s.containerCost + s.labelCost + laborCost) * 100) / 100;

    // Selling Price = Total Cost ÷ 0.75 (25% margin target)
    const retailPrice = Math.round((totalUnitCost / 0.75) * 100) / 100;
    const grossProfit = Math.round((retailPrice - totalUnitCost) * 100) / 100;
    const marginPercent = Math.round((grossProfit / retailPrice) * 1000) / 10;

    const variantSku = `${generateScentlabSku(sourceSku)}-${s.size >= 1 ? `${s.size}OZ` : "10ML"}`;

    return {
      id: `var_${fragranceId}_${s.size >= 1 ? `${s.size}oz` : "10ml"}`,
      fragranceOilId: fragranceId,
      sellingSize: s.size,
      sellingUnit: s.unit,
      sku: variantSku,
      costBreakdown: {
        fragranceCost: rawOilCost,
        bottleCost: s.containerCost,
        capCost: 0.10,
        labelCost: s.labelCost,
        packagingCost: 0.10,
        laborCost,
        wasteCost: 0.05,
        allocatedShippingCost: 0.20,
        totalCost: totalUnitCost,
      },
      unitCost: totalUnitCost,
      retailPrice,
      suggestedRetailPrice: retailPrice,
      grossProfit,
      marginPercent,
      volumePricing: [
        { quantity: 1, price: retailPrice, unitPrice: retailPrice },
        { quantity: 10, price: Math.round(retailPrice * 0.95 * 10 * 100) / 100, unitPrice: Math.round(retailPrice * 0.95 * 100) / 100 },
        { quantity: 50, price: Math.round(retailPrice * 0.90 * 50 * 100) / 100, unitPrice: Math.round(retailPrice * 0.90 * 100) / 100 },
        { quantity: 100, price: Math.round(retailPrice * 0.85 * 100 * 100) / 100, unitPrice: Math.round(retailPrice * 0.85 * 100) / 100 },
      ],
      inventoryQuantity: 20, // INITIAL INVENTORY = 20 UNITS PER VARIANT
      active: true,
    };
  });
}

/**
 * Validates import rows against existing catalog and flags duplicates.
 */
export async function validateImportRows(
  rows: CsvFragranceRow[],
  supplierId: string = "sup_africa_imports",
  supplierName: string = "Africa Imports"
): Promise<ImportPreviewItem[]> {
  const existingCatalog = await fragranceRepository.getAllFragrances();
  const previewItems: ImportPreviewItem[] = [];

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const errors: string[] = [];

    if (!r.name || r.name.trim().length === 0) {
      errors.push("Missing fragrance name.");
    }

    const sourceSize = typeof r.sourceSize === "number" ? r.sourceSize : parseFloat(r.sourceSize);
    const sourceCost = typeof r.sourceCost === "number" ? r.sourceCost : parseFloat(r.sourceCost);
    const sourceUnit = (r.sourceUnit || "oz").toLowerCase() as VolumeUnit;

    if (isNaN(sourceSize) || sourceSize <= 0) errors.push("Invalid source size.");
    if (isNaN(sourceCost) || sourceCost <= 0) errors.push("Invalid source cost.");

    const costCalc = calculateCostPerOz(sourceSize, sourceUnit, sourceCost);
    if (costCalc.error) errors.push(costCalc.error);

    const slug = r.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const sourceSku = r.supplierProductId || `AI-${i + 1}`;

    // Duplicate detection: check by sourceSku, supplierUrl, or slug
    const duplicate = existingCatalog.find(
      (f) =>
        (sourceSku && f.supplierProductId === sourceSku) ||
        (r.supplierUrl && f.supplierUrl === r.supplierUrl) ||
        f.slug === slug
    );

    const fragranceObj: Partial<FragranceOil> = {
      id: duplicate ? duplicate.id : `frag_${Date.now()}_${i}`,
      name: r.name,
      slug,
      description: r.description || `Grade-A pure concentrated ${r.name} fragrance oil. 100% uncut laboratory formulation.`,
      supplierId,
      supplierName,
      supplierProductId: sourceSku,
      supplierUrl: r.supplierUrl,
      category: r.category || "fragrance_oils",
      scentFamily: r.scentFamily || "Woody",
      gender: (r.gender as any) || "unisex",
      sourceSize,
      sourceUnit,
      sourceCost,
      costPerOz: costCalc.costPerOz,
      costPerMl: costCalc.costPerMl,
      inventoryVolumeOz: sourceSize,
      status: "draft", // Imported products start in Draft for Admin photo upload & review
      images: [],
      primaryImage: "",
    };

    previewItems.push({
      row: i + 1,
      data: fragranceObj,
      duplicateMatch: duplicate,
      action: duplicate ? "update" : "create",
      isValid: errors.length === 0,
      errors,
    });
  }

  return previewItems;
}

/**
 * Converts RawAfricaFragrance into full SCENTLAB FragranceOil and Product records.
 */
export function transformAfricaFragrance(
  raw: RawAfricaFragrance,
  index: number
): { fragrance: FragranceOil; product: Product } {
  const sourceSku = raw.sku || `AI-${raw.entityId}`;
  const fragranceId = `frag_${raw.entityId}`;
  const scentlabSku = generateScentlabSku(sourceSku);

  const slug = raw.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  // Cost per oz computation
  const sourceSizeOz = raw.sourceUnit === "lb" ? raw.sourceSize * 16 : raw.sourceSize;
  const costPerOz = sourceSizeOz > 0 ? Math.round((raw.sourcePrice / sourceSizeOz) * 100) / 100 : 2.5;
  const costPerMl = Math.round((costPerOz / 29.5735) * 1000) / 1000;

  // Repackaging variants (SCENTLAB 25% target margin)
  const repackagingVariants = buildScentlabVariants(fragranceId, slug, sourceSku, costPerOz);
  const baseVariant = repackagingVariants[1] || repackagingVariants[0]; // 1 oz default

  const now = new Date().toISOString();

  const fragrance: FragranceOil = {
    id: fragranceId,
    name: raw.name,
    slug,
    description: raw.plainTextDescription || `Grade-A pure concentrated ${raw.name} fragrance oil. 100% uncut formulation.`,
    supplierId: "sup_africa_imports",
    supplierName: "Africa Imports",
    supplierProductId: sourceSku,
    supplierUrl: `https://africaimports.com${raw.path}`,
    fragranceReference: raw.fragranceReference,
    category: "fragrance_oils",
    scentFamily: "Woody",
    gender: raw.gender.toLowerCase() as any,
    sourceSize: raw.sourceSize,
    sourceUnit: raw.sourceUnit as VolumeUnit,
    sourceCost: raw.sourcePrice,
    costPerOz,
    costPerMl,
    inventoryVolumeOz: sourceSizeOz,
    status: "draft", // Draft until Admin uploads photos
    images: [],
    primaryImage: "",
    repackagingVariants,
    targetGrossMargin: 0.25, // 25% Target Margin
    createdAt: now,
    updatedAt: now,
  };

  // Dual Product model for unified storefront catalog
  const packageOptions: ProductPackage[] = repackagingVariants.map((v) => ({
    id: `pkg_${v.id}`,
    name: `${v.sellingSize} ${v.sellingUnit || "oz"} Bottle`,
    quantity: v.sellingSize,
    price: v.retailPrice,
    unitPrice: v.unitCost,
    isDefault: v.sellingSize === 1,
  }));

  const product: Product = {
    id: fragranceId,
    name: raw.name,
    slug,
    sku: scentlabSku,
    category: "fragrance",
    subcategory: raw.gender.toLowerCase(),
    description: fragrance.description,
    shortDescription: `Pure concentrated ${raw.name} fragrance oil.`,
    tags: ["fragrance", raw.gender.toLowerCase(), raw.isDesigner ? "designer" : "traditional"],
    attributes: { gender: raw.gender, fragranceReference: raw.fragranceReference || "" },
    currency: "USD",
    hasVariants: true,
    basePrice: baseVariant.retailPrice,
    costData: {
      supplierCost: raw.sourcePrice,
      supplierQuantity: sourceSizeOz,
      unitCost: costPerOz,
      totalUnitCost: baseVariant.unitCost,
    },
    packageOptions,
    volumePricing: [
      { minQuantity: 1, unitPrice: baseVariant.retailPrice },
      { minQuantity: 10, unitPrice: Math.round(baseVariant.retailPrice * 0.95 * 100) / 100, discountPercentage: 5 },
      { minQuantity: 50, unitPrice: Math.round(baseVariant.retailPrice * 0.90 * 100) / 100, discountPercentage: 10 },
      { minQuantity: 100, unitPrice: Math.round(baseVariant.retailPrice * 0.85 * 100) / 100, discountPercentage: 15 },
    ],
    inventory: {
      quantityInStock: 20 * repackagingVariants.length,
      reservedQuantity: 0,
      availableQuantity: 20 * repackagingVariants.length,
      lowStockThreshold: 10,
      reorderPoint: 15,
      status: "in_stock",
    },
    supplierId: "sup_africa_imports",
    supplierName: "Africa Imports",
    status: "draft", // Initial status Draft
    featured: false,
    media: [],
    discountEligible: true,
    minimumDiscountMargin: 0.25,
    createdAt: now,
    updatedAt: now,
  };

  return { fragrance, product };
}

/**
 * Commits verified preview items into Firestore.
 */
export async function commitImportBatch(
  items: ImportPreviewItem[]
): Promise<{ successful: number; failed: number }> {
  let successful = 0;
  let failed = 0;

  for (const item of items) {
    if (!item.isValid || item.action === "skip") continue;

    try {
      const d = item.data;
      const costPerOz = d.costPerOz || 2.0;
      const sourceSku = d.supplierProductId || "AI-SKU";
      const fragranceId = d.id as string;
      const slug = d.slug as string;

      const variants = buildScentlabVariants(fragranceId, slug, sourceSku, costPerOz);

      const fullFragrance: FragranceOil = {
        id: fragranceId,
        name: d.name as string,
        slug,
        description: d.description as string,
        supplierId: d.supplierId as string,
        supplierName: d.supplierName,
        supplierProductId: sourceSku,
        supplierUrl: d.supplierUrl,
        category: d.category || "fragrance_oils",
        scentFamily: d.scentFamily || "Woody",
        gender: d.gender || "unisex",
        sourceSize: d.sourceSize as number,
        sourceUnit: d.sourceUnit as VolumeUnit,
        sourceCost: d.sourceCost as number,
        costPerOz: d.costPerOz as number,
        costPerMl: d.costPerMl as number,
        inventoryVolumeOz: d.inventoryVolumeOz as number,
        status: "draft",
        images: d.images || [],
        primaryImage: d.primaryImage || "",
        repackagingVariants: variants,
        targetGrossMargin: 0.25,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await fragranceRepository.saveFragrance(fullFragrance);

      // Record initial inventory for each variant
      for (const v of variants) {
        await inventoryRepository.recordTransaction({
          id: `tx_init_${v.id}`,
          inventoryItemId: v.id,
          productId: fullFragrance.id,
          productName: `${fullFragrance.name} (${v.sellingSize} ${v.sellingUnit || "oz"})`,
          type: "initial_stock",
          quantity: 20,
          previousQuantity: 0,
          newQuantity: 20,
          referenceType: "manual",
          reason: "Initial SCENTLAB catalog inventory",
          createdBy: "System/Admin",
          createdAt: new Date().toISOString(),
          notes: "Initial inventory setup per catalog ingestion.",
        });
      }

      successful++;
    } catch {
      failed++;
    }
  }

  return { successful, failed };
}
