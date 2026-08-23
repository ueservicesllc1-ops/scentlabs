import { convertToOunces, calculateCostPerOz } from "../src/lib/fragrance/conversions";
import { calculateRepackagingCost, calculateSuggestedRetailPrice, calculateGrossMargin } from "../src/lib/fragrance/pricing";
import { parseCsvContent, validateImportRows } from "../src/lib/fragrance/importer";
import { inventoryLedgerRepository } from "../src/lib/firestore/inventory-ledger";
import { fragranceRepository } from "../src/lib/firestore/fragrance";

console.log("==================================================");
console.log("SCENTLAB PROMPT #7 FRAGRANCE OILS TEST SUITE");
console.log("==================================================\n");

let passed = 0;
let total = 8;

// TEST 1: Unit Conversions
const ozConv = convertToOunces(32, "oz");
const galConv = convertToOunces(1, "gallon");
const lbWithoutDensity = convertToOunces(1, "lb");
const lbWithDensity = convertToOunces(1, "lb", 0.985);

if (
  ozConv.ounces === 32 &&
  galConv.ounces === 128 &&
  lbWithoutDensity.requiresDensity === true &&
  lbWithDensity.ounces > 15 && lbWithDensity.ounces < 16
) {
  console.log("✓ TEST 1: Unit conversions (oz, gallon, lb with required density) -> PASSED");
  passed++;
} else {
  console.error("✗ TEST 1 FAILED:", { ozConv, galConv, lbWithoutDensity, lbWithDensity });
}

// TEST 2: Cost Per Ounce Calculation
const cost8oz = calculateCostPerOz(8, "oz", 20.0);
const cost32oz = calculateCostPerOz(32, "oz", 50.0);
if (cost8oz.costPerOz === 2.50 && cost32oz.costPerOz === 1.5625) {
  console.log("✓ TEST 2: Cost per ounce ($20/8oz = $2.50, $50/32oz = $1.5625) -> PASSED");
  passed++;
} else {
  console.error("✗ TEST 2 FAILED:", { cost8oz, cost32oz });
}

// TEST 3: Repackaging Cost Decomposition
const costBreakdown = calculateRepackagingCost({
  costPerOz: 1.6875,
  sellingSizeOz: 2,
  bottleCost: 0.65,
  capCost: 0.15,
  labelCost: 0.18,
  packagingCost: 0.35,
  laborCost: 0.40,
  wasteFactorPercent: 0.03,
  allocatedShippingCost: 0.25,
});

if (costBreakdown.totalCost > 5.0 && costBreakdown.totalCost < 6.0 && costBreakdown.fragranceCost > 3.3) {
  console.log(`✓ TEST 3: Repackaging cost decomposition (2 oz = ${costBreakdown.totalCost}) -> PASSED`);
  passed++;
} else {
  console.error("✗ TEST 3 FAILED:", costBreakdown);
}

// TEST 4: Suggested Retail Price & Gross Margin
const suggestedPrice = calculateSuggestedRetailPrice(costBreakdown.totalCost, 0.55);
const margin = calculateGrossMargin(14.50, costBreakdown.totalCost);

if (suggestedPrice > 12.0 && margin.marginPercent > 60.0 && !margin.isLowMargin) {
  console.log(`✓ TEST 4: Pricing & Margin (Retail: $14.50, Cost: $${costBreakdown.totalCost}, Margin: ${margin.marginPercent}%) -> PASSED`);
  passed++;
} else {
  console.error("✗ TEST 4 FAILED:", { suggestedPrice, margin });
}

// TEST 5: Atomic Repackaging Transaction
async function testRepackaging() {
  const initialFragrance = await fragranceRepository.getFragranceById("frag_santal_reserve");
  if (!initialFragrance) throw new Error("Missing initial test fragrance");

  const initialBulk = initialFragrance.inventoryVolumeOz;
  const initialVariantStock = initialFragrance.repackagingVariants[0].inventoryQuantity;

  const result = await inventoryLedgerRepository.recordRepackaging({
    fragranceOilId: "frag_santal_reserve",
    variantId: initialFragrance.repackagingVariants[0].id,
    sellingSizeOz: 1,
    outputQuantity: 10,
    wasteVolumeOz: 0.3,
    createdBy: "Test Runner",
    notes: "Automated test repackaging run",
  });

  const updatedFragrance = await fragranceRepository.getFragranceById("frag_santal_reserve");
  if (
    result.success &&
    updatedFragrance &&
    updatedFragrance.inventoryVolumeOz === initialBulk - 10.3 &&
    updatedFragrance.repackagingVariants[0].inventoryQuantity === initialVariantStock + 10
  ) {
    console.log(`✓ TEST 5: Atomic Repackaging (Bulk: ${initialBulk} -> ${updatedFragrance.inventoryVolumeOz} oz, Shelf: ${initialVariantStock} -> ${updatedFragrance.repackagingVariants[0].inventoryQuantity} units) -> PASSED`);
    passed++;
  } else {
    console.error("✗ TEST 5 FAILED:", { result, updatedFragrance });
  }

  // TEST 6: Purchase Lot Inbound
  const lotId = await inventoryLedgerRepository.recordPurchaseLot(
    {
      id: `lot_test_${Date.now()}`,
      supplierId: "sup_africa_imports",
      supplierName: "Africa Imports",
      fragranceOilId: "frag_santal_reserve",
      fragranceName: "Santal 33 Type",
      quantity: 32,
      unit: "oz",
      unitCost: 1.6875,
      totalCost: 54.0,
      purchaseDate: new Date().toISOString(),
      lotNumber: "LOT-TEST-999",
      createdAt: new Date().toISOString(),
    },
    32
  );

  const afterLotFragrance = await fragranceRepository.getFragranceById("frag_santal_reserve");
  if (lotId && afterLotFragrance && afterLotFragrance.inventoryVolumeOz > updatedFragrance!.inventoryVolumeOz) {
    console.log(`✓ TEST 6: Purchase Lot Inbound (+32 oz bulk added) -> PASSED`);
    passed++;
  } else {
    console.error("✗ TEST 6 FAILED:", { lotId, afterLotFragrance });
  }

  // TEST 7 & 8: CSV Parsing and Duplicate Detection
  const sampleCsv = `name,supplierProductId,sourceSize,sourceUnit,sourceCost,scentFamily
"Santal 33 Type Premium Fragrance Oil",O-S1132,32,oz,54.0,Woody
"Grand Soir Amber Royale",O-G4416,16,oz,45.0,Amber`;

  const parsedRows = parseCsvContent(sampleCsv);
  const validated = await validateImportRows(parsedRows, "sup_africa_imports", "Africa Imports");

  const duplicateItem = validated.find((v) => v.duplicateMatch !== undefined);
  const newItem = validated.find((v) => v.duplicateMatch === undefined);

  if (parsedRows.length === 2 && duplicateItem && duplicateItem.action === "update" && newItem && newItem.action === "create") {
    console.log("✓ TEST 7 & 8: CSV Import & Duplicate Detection (Existing -> Update, New -> Create) -> PASSED");
    passed += 2;
  } else {
    console.error("✗ TEST 7 & 8 FAILED:", { parsedRows, validated });
  }

  console.log("\n==================================================");
  console.log(`RESULTS: ${passed} / ${total} TESTS PASSED`);
  console.log("==================================================");
}

testRepackaging();
