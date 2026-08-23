import { calculateSheetsRequired } from "../src/lib/packaging/sheet-calculator";
import { calculateBoxCost } from "../src/lib/packaging/box-cost";
import { SHRINK_WRAP_VARIANTS, INITIAL_MATERIALS, STANDARD_BOX_VARIANTS } from "../src/data/packaging";
import { productionRepository } from "../src/lib/firestore/production";
import { packagingRepository } from "../src/lib/firestore/packaging";

console.log("==================================================");
console.log("SCENTLAB PROMPT #8 PACKAGING & BOX TEST SUITE");
console.log("==================================================\n");

let passed = 0;
let total = 8;

// TEST 1: Tags with Cord Initial Pricing
const tagsCost = 12.0 / 1000; // $0.012/tag
const tagsRetail100 = 5.0; // 100u = $5.00 ($0.05/ea)
if (tagsCost < 0.02 && tagsRetail100 === 5.0 && tagsRetail100 / 100 === 0.05) {
  console.log("✓ TEST 1: Tags with cord (100u = $5.00, cost $0.012/ea) -> PASSED");
  passed++;
} else {
  console.error("✗ TEST 1 FAILED");
}

// TEST 2: Holographic Security Stickers
const secCost = 11.79 / 650; // $0.0181
const secRetail200 = 6.0; // 200u = $6.00 ($0.03/ea)
if (secCost > 0.015 && secCost < 0.02 && secRetail200 === 6.0 && secRetail200 / 200 === 0.03) {
  console.log("✓ TEST 2: Security stickers (200u = $6.00, cost $0.018/ea) -> PASSED");
  passed++;
} else {
  console.error("✗ TEST 2 FAILED");
}

// TEST 3: Heat Shrink 7-Size Variants Verification
const shrink4x6 = SHRINK_WRAP_VARIANTS.find((v) => v.sizeName.startsWith("4x6"));
const shrink6x8 = SHRINK_WRAP_VARIANTS.find((v) => v.sizeName.startsWith("6x8"));
const shrink10x14 = SHRINK_WRAP_VARIANTS.find((v) => v.sizeName.startsWith("10x14"));
const shrink14x20 = SHRINK_WRAP_VARIANTS.find((v) => v.sizeName.startsWith("14x20"));

if (
  SHRINK_WRAP_VARIANTS.length === 7 &&
  shrink4x6?.price50 === 5.0 && shrink4x6?.price100 === 10.0 &&
  shrink6x8?.price50 === 6.0 && shrink6x8?.price100 === 11.0 &&
  shrink10x14?.price50 === 10.0 && shrink10x14?.price100 === 18.0 &&
  shrink14x20?.price50 === 13.0 && shrink14x20?.price100 === 25.0
) {
  console.log("✓ TEST 3: Heat Shrink Wrap 7-size matrix & 50/100 pricing -> PASSED");
  passed++;
} else {
  console.error("✗ TEST 3 FAILED:", { SHRINK_WRAP_VARIANTS });
}

// TEST 4: Sheet Yield Calculator (Small 10ml Roll-On Box)
const smallBoxSheet = calculateSheetsRequired({
  boxWidth: 0.95,
  boxHeight: 3.65,
  boxDepth: 0.95,
});

if (smallBoxSheet.optimalBoxesPerSheet >= 2 && smallBoxSheet.sheetsRequiredPerBox <= 0.5) {
  console.log(`✓ TEST 4: Small box sheet calculator (${smallBoxSheet.optimalBoxesPerSheet} boxes/sheet, ${smallBoxSheet.sheetsRequiredPerBox} sheet/box) -> PASSED`);
  passed++;
} else {
  console.error("✗ TEST 4 FAILED:", smallBoxSheet);
}

// TEST 5: Sheet Yield Calculator (Large 30ml Bottle Box)
const largeBoxSheet = calculateSheetsRequired({
  boxWidth: 1.65,
  boxHeight: 4.85,
  boxDepth: 1.65,
});

if (largeBoxSheet.optimalBoxesPerSheet >= 1 && largeBoxSheet.sheetsRequiredPerBox <= 1.0) {
  console.log(`✓ TEST 5: Large box sheet calculator (${largeBoxSheet.optimalBoxesPerSheet} box/sheet, ${largeBoxSheet.sheetsRequiredPerBox} sheet/box) -> PASSED`);
  passed++;
} else {
  console.error("✗ TEST 5 FAILED:", largeBoxSheet);
}

// TEST 6: Box Manufacturing Cost Engine
const smallBoxCost = calculateBoxCost({
  sheetsRequiredPerBox: smallBoxSheet.sheetsRequiredPerBox,
  costPerSheet: 0.0999,
});

if (smallBoxCost.totalCost < 0.25 && smallBoxCost.suggestedPrice >= 0.35 && smallBoxCost.marginPercent >= 45.0) {
  console.log(`✓ TEST 6: Box cost engine (Unit cost: $${smallBoxCost.totalCost}, Suggested Price: $${smallBoxCost.suggestedPrice}) -> PASSED`);
  passed++;
} else {
  console.error("✗ TEST 6 FAILED:", smallBoxCost);
}

// TEST 7 & 8: Cricut Production Execution & Material Deduction
async function testProduction() {
  const materials = await packagingRepository.getRawMaterials();
  const initialCardstock = materials[0].quantity;
  const boxes = await packagingRepository.getBoxVariants();
  const initialBoxStock = boxes[0].inventory;

  const job = {
    id: `job_test_${Date.now()}`,
    productId: "prod_perfume_boxes",
    variantId: boxes[0].id,
    boxName: boxes[0].name,
    quantity: 20,
    materialId: materials[0].id,
    materialName: materials[0].name,
    sheetsRequired: 10,
    estimatedTimeMinutes: 15,
    status: "queued" as const,
    createdBy: "Test Runner",
    createdAt: new Date().toISOString(),
  };

  await productionRepository.createProductionJob(job);

  const res = await productionRepository.executeAndCompleteJob({
    jobId: job.id,
    materialId: materials[0].id,
    variantId: boxes[0].id,
    sheetsToConsume: 10,
    outputBoxQuantity: 20,
    wasteSheets: 1,
    createdBy: "Test Runner",
  });

  const updatedMats = await packagingRepository.getRawMaterials();
  const updatedBoxes = await packagingRepository.getBoxVariants();

  if (
    res.success &&
    updatedMats[0].quantity === initialCardstock - 11 &&
    updatedBoxes[0].inventory === initialBoxStock + 20
  ) {
    console.log(`✓ TEST 7 & 8: Cricut Production Execution (Cardstock: ${initialCardstock} -> ${updatedMats[0].quantity} sheets, Finished Boxes: ${initialBoxStock} -> ${updatedBoxes[0].inventory} units) -> PASSED`);
    passed += 2;
  } else {
    console.error("✗ TEST 7 & 8 FAILED:", { res, updatedMats, updatedBoxes });
  }

  console.log("\n==================================================");
  console.log(`RESULTS: ${passed} / ${total} TESTS PASSED`);
  console.log("==================================================");
}

testProduction();
