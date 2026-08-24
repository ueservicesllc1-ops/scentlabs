import { FragranceOil } from "@/types/fragrance";
import { calculateRepackagingCost, calculateSuggestedRetailPrice, calculateGrossMargin } from "@/lib/fragrance/pricing";
import africaFragrancesRaw from "./africa-imports-fragrances.json";

const importedMap = new Map<string, FragranceOil>();

(africaFragrancesRaw as unknown as FragranceOil[]).forEach((f) => {
  // Enforce approved customer-facing sizes (1, 2, 4, 8, 16 oz)
  const approvedVariants = (f.repackagingVariants || []).filter((v) =>
    [1, 2, 4, 8, 16].includes(Number(v.sellingSize))
  );

  importedMap.set(f.id, {
    ...f,
    category: "fragrance_oils",
    status: (f.status as string) === "archived" ? "discontinued" : "active",
    repackagingVariants: approvedVariants.length > 0 ? approvedVariants : f.repackagingVariants,
  });
});

export const INITIAL_FRAGRANCES: FragranceOil[] = Array.from(importedMap.values());
