import { FragranceOil, VolumeUnit } from "@/types/fragrance";
import { calculateCostPerOz } from "./conversions";
import { calculateRepackagingCost } from "./pricing";
import { fragranceRepository } from "../firestore/fragrance";

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
    // Regex for CSV columns handling quoted commas
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

    // Duplicate detection: check by supplierProductId, supplierUrl, or slug
    const duplicate = existingCatalog.find(
      (f) =>
        (r.supplierProductId && f.supplierProductId === r.supplierProductId) ||
        (r.supplierUrl && f.supplierUrl === r.supplierUrl) ||
        f.slug === slug
    );

    const fragranceObj: Partial<FragranceOil> = {
      id: duplicate ? duplicate.id : `frag_${Date.now()}_${i}`,
      name: r.name,
      slug,
      description: r.description || `Pure uncut ${r.name} fragrance oil. Grade-A quality.`,
      supplierId,
      supplierName,
      supplierProductId: r.supplierProductId,
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
      status: "active",
      images: ["/images/products/fragrance-santal.jpg"],
      primaryImage: "/images/products/fragrance-santal.jpg",
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

      // Build standard selling repackaging variants (1 oz, 2 oz, 4 oz, 8 oz)
      const variants = [1, 2, 4, 8].map((sizeOz) => {
        const costBreakdown = calculateRepackagingCost({ costPerOz, sellingSizeOz: sizeOz });
        const retailPrice = Math.round(costBreakdown.totalCost * 2.1 * 100) / 100;
        const grossProfit = Math.round((retailPrice - costBreakdown.totalCost) * 100) / 100;
        const marginPercent = Math.round((grossProfit / retailPrice) * 1000) / 10;

        return {
          id: `var_${d.id}_${sizeOz}oz`,
          fragranceOilId: d.id as string,
          sellingSize: sizeOz,
          sellingUnit: "oz" as const,
          sku: `FRAG-${d.slug?.toUpperCase().slice(0, 8)}-${sizeOz}OZ`,
          costBreakdown,
          unitCost: costBreakdown.totalCost,
          retailPrice,
          suggestedRetailPrice: retailPrice,
          grossProfit,
          marginPercent,
          inventoryQuantity: 20,
          active: true,
        };
      });

      const fullFragrance: FragranceOil = {
        id: d.id as string,
        name: d.name as string,
        slug: d.slug as string,
        description: d.description as string,
        supplierId: d.supplierId as string,
        supplierName: d.supplierName,
        supplierProductId: d.supplierProductId,
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
        status: "active",
        images: d.images || ["/images/products/fragrance-santal.jpg"],
        primaryImage: d.primaryImage || "/images/products/fragrance-santal.jpg",
        repackagingVariants: variants,
        targetGrossMargin: 0.50,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await fragranceRepository.saveFragrance(fullFragrance);
      successful++;
    } catch {
      failed++;
    }
  }

  return { successful, failed };
}
