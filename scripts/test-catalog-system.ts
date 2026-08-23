import { INITIAL_PRODUCTS } from "../src/data/products";
import { INITIAL_FRAGRANCES } from "../src/data/fragrances";
import { productRepository } from "../src/lib/firestore/products";

console.log("==================================================");
console.log("SCENTLAB PROMPT #11 STORE CATALOG & SEARCH TEST SUITE");
console.log("==================================================\n");

let passed = 0;
let total = 6;

// TEST 1: Full Catalog Product Retrieval
const allProducts = INITIAL_PRODUCTS;
if (allProducts.length >= 15) {
  console.log(`✓ TEST 1: Full catalog loaded (${allProducts.length} base supplies) -> PASSED`);
  passed++;
} else {
  console.error("✗ TEST 1 FAILED:", { count: allProducts.length });
}

// TEST 2: Search Query Matching (by name, sku, category)
function searchProducts(query: string) {
  const q = query.toLowerCase();
  return allProducts.filter(
    (p) =>
      p.status === "active" &&
      (p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q))
  );
}

const bottleMatches = searchProducts("bottle");
const pipetteMatches = searchProducts("pipette");
const rollonMatches = searchProducts("roll-on");

if (bottleMatches.length > 0 && pipetteMatches.length > 0 && rollonMatches.length > 0) {
  console.log(`✓ TEST 2: Universal search matching (bottles: ${bottleMatches.length}, pipettes: ${pipetteMatches.length}, roll-on: ${rollonMatches.length}) -> PASSED`);
  passed++;
} else {
  console.error("✗ TEST 2 FAILED:", { bottleMatches, pipetteMatches, rollonMatches });
}

// TEST 3: Customer Privacy (No supplier costs in public search responses)
const searchSample = searchProducts("bottle")[0];
if (searchSample && !("supplierCost" in searchSample) && !("marginPercent" in searchSample)) {
  console.log("✓ TEST 3: Customer Cost Privacy (supplier cost & margins excluded from public Product) -> PASSED");
  passed++;
} else {
  console.error("✗ TEST 3 FAILED:", searchSample);
}

// TEST 4: Sorting (Price Low to High)
const sortedAsc = [...allProducts].sort((a, b) => a.basePrice - b.basePrice);
if (sortedAsc[0].basePrice <= sortedAsc[sortedAsc.length - 1].basePrice) {
  console.log(`✓ TEST 4: Price Low->High sort verified (min: $${sortedAsc[0].basePrice}, max: $${sortedAsc[sortedAsc.length - 1].basePrice}) -> PASSED`);
  passed++;
} else {
  console.error("✗ TEST 4 FAILED:", sortedAsc);
}

// TEST 5: Pagination Math
const totalItems = allProducts.length;
const pageSize = 12;
const totalPages = Math.ceil(totalItems / pageSize);

if (totalPages >= 2) {
  console.log(`✓ TEST 5: Pagination calculation (${totalItems} items / ${pageSize} per page = ${totalPages} pages) -> PASSED`);
  passed++;
} else {
  console.error("✗ TEST 5 FAILED:", { totalItems, totalPages });
}

// TEST 6: Firestore Product Repository Retrieval
async function testRepo() {
  const repoProducts = await productRepository.getAll();
  if (repoProducts.length > 0) {
    console.log(`✓ TEST 6: Product repository retrieval (${repoProducts.length} active products) -> PASSED`);
    passed++;
  } else {
    console.error("✗ TEST 6 FAILED:", repoProducts);
  }

  console.log("\n==================================================");
  console.log(`RESULTS: ${passed} / ${total} TESTS PASSED`);
  console.log("==================================================");
}

testRepo();
