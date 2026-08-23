import { convertToLiters, calculateCostPerLiter, calculateBaseRepackagingCost } from "../src/lib/perfume-making/conversions";
import { INITIAL_PERFUME_BASES, INITIAL_PERFUME_KITS } from "../src/data/perfume-making";
import { perfumeMakingRepository } from "../src/lib/firestore/perfume-making";

console.log("==================================================");
console.log("SCENTLAB PROMPT #10 PERFUME MAKING TEST SUITE");
console.log("==================================================\n");

let passed = 0;
let total = 6;

// TEST 1: Unit Conversions
const galLiters = convertToLiters(1, "gallon");
const mlLiters = convertToLiters(500, "ml");
const ozLiters = convertToLiters(32, "oz");

if (galLiters > 3.78 && galLiters < 3.79 && mlLiters === 0.5 && ozLiters > 0.94 && ozLiters < 0.95) {
  console.log("✓ TEST 1: Unit conversions (1 gal = 3.785 L, 500 ml = 0.5 L) -> PASSED");
  passed++;
} else {
  console.error("✗ TEST 1 FAILED:", { galLiters, mlLiters, ozLiters });
}

// TEST 2: Cost Per Liter Calculation
const costCalc = calculateCostPerLiter(49.99, 1, "gallon");
if (costCalc.costPerLiter > 13.20 && costCalc.costPerLiter < 13.22 && costCalc.costPerMl > 0.013) {
  console.log(`✓ TEST 2: Cost per liter ($49.99 / 1 gal = $${costCalc.costPerLiter}/L) -> PASSED`);
  passed++;
} else {
  console.error("✗ TEST 2 FAILED:", costCalc);
}

// TEST 3: 1 Liter Base Repackaging Breakdown
const baseBreakdown = calculateBaseRepackagingCost({
  costPerLiter: costCalc.costPerLiter,
  sellingSizeLiters: 1.0,
  bottleCost: 1.43,
});

if (
  baseBreakdown.breakdown.bottleCost === 1.43 &&
  baseBreakdown.unitCost > 15.0 &&
  baseBreakdown.unitCost < 18.0 &&
  baseBreakdown.suggestedPrice > 20.0
) {
  console.log(`✓ TEST 3: 1L Base repackaging cost ($${baseBreakdown.unitCost}, Steve Spangler bottle $1.43) -> PASSED`);
  passed++;
} else {
  console.error("✗ TEST 3 FAILED:", baseBreakdown);
}

// TEST 4: 1 Liter Selling Price & Margin
const base1L = INITIAL_PERFUME_BASES[0].repackagingVariants.find((v) => v.size === 1.0);
if (base1L && base1L.retailPrice === 21.99 && base1L.sku === "BASE-ALC-1L" && base1L.marginPercent > 20.0) {
  console.log(`✓ TEST 4: 1L Base retail price ($21.99, margin: ${base1L.marginPercent}%) -> PASSED`);
  passed++;
} else {
  console.error("✗ TEST 4 FAILED:", { base1L });
}

// TEST 5: Master Perfume Making Kit Bundle
const masterKit = INITIAL_PERFUME_KITS[0];
if (
  masterKit &&
  masterKit.items.length === 6 &&
  masterKit.kitPrice === 39.99 &&
  masterKit.savings === 9.00 &&
  masterKit.discountPercent > 18.0
) {
  console.log(`✓ TEST 5: Master Studio Kit (6 components, Individual: $${masterKit.individualTotal}, Kit: $${masterKit.kitPrice}, Savings: $${masterKit.savings}) -> PASSED`);
  passed++;
} else {
  console.error("✗ TEST 5 FAILED:", { masterKit });
}

// TEST 6: Repository Retrieval
async function testRepo() {
  const bases = await perfumeMakingRepository.getAllBases();
  const kits = await perfumeMakingRepository.getAllKits();

  if (bases.length > 0 && kits.length > 0 && bases[0].repackagingVariants.length === 3) {
    console.log(`✓ TEST 6: Repository retrieval (${bases.length} bases, ${kits.length} studio kits) -> PASSED`);
    passed++;
  } else {
    console.error("✗ TEST 6 FAILED:", { bases, kits });
  }

  console.log("\n==================================================");
  console.log(`RESULTS: ${passed} / ${total} TESTS PASSED`);
  console.log("==================================================");
}

testRepo();
