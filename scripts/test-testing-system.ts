import { INITIAL_TESTING_PRODUCTS, INITIAL_TESTING_KITS } from "../src/data/testing";
import { testingRepository } from "../src/lib/firestore/testing";

console.log("==================================================");
console.log("SCENTLAB PROMPT #9 TESTING & SAMPLES TEST SUITE");
console.log("==================================================\n");

let passed = 0;
let total = 6;

// TEST 1: Perfume Blotter Strips Volume Tiers
const blotters = INITIAL_TESTING_PRODUCTS.find((p) => p.testingType === "blotter_strip");
const tier50 = blotters?.volumePricing.find((t) => t.quantity === 50);
const tier100 = blotters?.volumePricing.find((t) => t.quantity === 100);
const tier500 = blotters?.volumePricing.find((t) => t.quantity === 500);
const tier1000 = blotters?.volumePricing.find((t) => t.quantity === 1000);
const tier2000 = blotters?.volumePricing.find((t) => t.quantity === 2000);

if (
  tier50?.price === 2.50 &&
  tier100?.price === 4.00 &&
  tier500?.price === 12.00 &&
  tier1000?.price === 20.00 &&
  tier2000?.price === 30.00 &&
  blotters?.asin === "B0FH64YJVM"
) {
  console.log("✓ TEST 1: Perfume blotters 5 volume tiers (50=$2.50, 100=$4, 500=$12, 1000=$20, 2000=$30) -> PASSED");
  passed++;
} else {
  console.error("✗ TEST 1 FAILED:", { blotters });
}

// TEST 2: 5 ml Sample Bottles Volume Tiers
const sample5ml = INITIAL_TESTING_PRODUCTS.find((p) => p.slug === "5ml-fragrance-sample-bottles");
const bot10 = sample5ml?.volumePricing.find((t) => t.quantity === 10);
const bot20 = sample5ml?.volumePricing.find((t) => t.quantity === 20);
const bot50 = sample5ml?.volumePricing.find((t) => t.quantity === 50);
const bot100 = sample5ml?.volumePricing.find((t) => t.quantity === 100);

if (
  bot10?.price === 3.50 &&
  bot20?.price === 6.40 &&
  bot50?.price === 15.00 &&
  bot100?.price === 25.00 &&
  sample5ml?.asin === "B0D9QBDKBR"
) {
  console.log("✓ TEST 2: 5 ml Sample bottles tiers (10=$3.50, 20=$6.40, 50=$15, 100=$25) -> PASSED");
  passed++;
} else {
  console.error("✗ TEST 2 FAILED:", { sample5ml });
}

// TEST 3: 5 ml Glass Atomizer
const atom5ml = INITIAL_TESTING_PRODUCTS.find((p) => p.slug === "5ml-glass-atomizer-spray");
if (atom5ml && atom5ml.basePrice === 0.32 && atom5ml.asin === "B07DX3K5VK") {
  console.log(`✓ TEST 3: 5 ml Glass Atomizer ($0.32/ea, ASIN: B07DX3K5VK) -> PASSED`);
  passed++;
} else {
  console.error("✗ TEST 3 FAILED:", { atom5ml });
}

// TEST 4: 10 ml Glass Atomizer
const atom10ml = INITIAL_TESTING_PRODUCTS.find((p) => p.slug === "10ml-glass-atomizer-sprayer");
if (atom10ml && atom10ml.basePrice === 0.40 && atom10ml.asin === "B07DX4YLW8") {
  console.log(`✓ TEST 4: 10 ml Glass Atomizer ($0.40/ea, ASIN: B07DX4YLW8) -> PASSED`);
  passed++;
} else {
  console.error("✗ TEST 4 FAILED:", { atom10ml });
}

// TEST 5: Sample Kit Starter Bundle Foundation
const kit = INITIAL_TESTING_KITS[0];
if (kit && kit.bundleItems.length === 4 && kit.bundlePrice === 8.50) {
  console.log(`✓ TEST 5: Sample Kit Starter Bundle ($8.50, 4 components) -> PASSED`);
  passed++;
} else {
  console.error("✗ TEST 5 FAILED:", { kit });
}

// TEST 6: Repository Retrieval
async function testRepository() {
  const allProds = await testingRepository.getAllTestingProducts();
  const blotterBySlug = await testingRepository.getTestingProductBySlug("perfume-blotter-strips");

  if (allProds.length === 4 && blotterBySlug?.name.includes("Blotter")) {
    console.log(`✓ TEST 6: Testing repository retrieval (${allProds.length} products loaded) -> PASSED`);
    passed++;
  } else {
    console.error("✗ TEST 6 FAILED:", { allProds, blotterBySlug });
  }

  console.log("\n==================================================");
  console.log(`RESULTS: ${passed} / ${total} TESTS PASSED`);
  console.log("==================================================");
}

testRepository();
